import { Arc, Pie, PieArcDatum } from 'd3-shape'
import { Color } from "d3-color";
import { Selection, BaseType } from 'd3-selection'
import { interpolate } from 'd3-interpolate'
import { BlockMargin, DataRow, DonutChartSettings, PolarChartModel, Size } from "../../../model/model";
import { Helper } from "../../helper";
import { Block } from "../../block/block";
import { Aggregator } from "../aggregator";
import { DonutHelper } from './DonutHelper';
import { merge } from 'd3-array';

export interface Translate {
    x: number;
    y: number;
}

export class Donut {
    public static donutBlockClass = 'donut-block';
    public static arcPathClass = 'arc-path';

    private static arcItemClass = 'arc';

    public static render(block: Block, data: DataRow[], margin: BlockMargin, chart: PolarChartModel, blockSize: Size, donutSettings: DonutChartSettings): void {
        const outerRadius = DonutHelper.getOuterRadius(margin, blockSize);
        const thickness = DonutHelper.getThickness(donutSettings, blockSize, margin);
        const innerRadius = DonutHelper.getInnerRadius(outerRadius, thickness);

        const arcGenerator = DonutHelper.getArcGenerator(outerRadius, innerRadius);
        const pieGenerator = DonutHelper.getPieGenerator(chart.data.valueField.name, donutSettings.padAngle);

        const translateAttribute = DonutHelper.getTranslate(margin, blockSize);

        const donutBlock = block.getSvg()
            .append('g')
            .attr('class', this.donutBlockClass)
            .attr('x', translateAttribute.x)
            .attr('y', translateAttribute.y)
            .attr('transform', `translate(${translateAttribute.x}, ${translateAttribute.y})`);

        this.renderNewArcItems(arcGenerator, pieGenerator, donutBlock, data, chart);

        Aggregator.render(block, data, chart.data.valueField, innerRadius, translateAttribute, thickness);
    }

    public static updateValues(block: Block, data: DataRow[], margin: BlockMargin, chart: PolarChartModel, blockSize: Size, donutSettings: DonutChartSettings, keyField: string): Promise<any> {
        const outerRadius = DonutHelper.getOuterRadius(margin, blockSize);
        const thickness = DonutHelper.getThickness(donutSettings, blockSize, margin);
        const innerRadius = DonutHelper.getInnerRadius(outerRadius, thickness);

        const arcGenerator = DonutHelper.getArcGenerator(outerRadius, innerRadius);
        const pieGenerator = DonutHelper.getPieGenerator(chart.data.valueField.name, donutSettings.padAngle);

        const oldData = block.getSvg().selectAll(`.${this.donutBlockClass}`)
            .selectAll<SVGPathElement, PieArcDatum<DataRow>>('path')
            .data()
            .map((d) => d.data);

        const dataNewZeroRows = this.mergeWithFirstEqualZero(data, oldData, keyField);
        const dataExtraZeroRows = this.mergeWithFirstEqualZero(oldData, data, keyField);

        const donutBlock = block.getSvg().select<SVGGElement>(`.${this.donutBlockClass}`)

        this.renderNewArcItems(arcGenerator, pieGenerator, donutBlock, dataNewZeroRows, chart);

        const path = this.getAllArcGroups(block)
            .data(pieGenerator(dataExtraZeroRows))
            .select<SVGPathElement>('path');

        const items = this.getAllArcGroups(block)
            .data(pieGenerator(data));


        return new Promise((resolve) => {
            path
                .interrupt()
                .transition()
                .duration(block.transitionManager.durations.updateChartsDuration)
                .on('end', () => {
                    items.exit()
                        .remove();
                    resolve('');
                })
                .attrTween('d', function (d) {
                    const interpolateFunc = interpolate((this as any)._currentData, d); // current - старые данные до обновления, задаются во время рендера
                    return t => {
                        (this as any)._currentData = interpolateFunc(t);
                        return arcGenerator((this as any)._currentData);
                    }
                });
        });
    }

    public static getAllArcGroups(block: Block): Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown> {
        return block.getSvg()
            .selectAll(`.${this.arcItemClass}`) as Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>;
    }

    private static renderNewArcItems(arcGenerator: Arc<any, PieArcDatum<DataRow>>, pieGenerator: Pie<any, DataRow>, donutBlock: Selection<SVGGElement, unknown, HTMLElement, any>, data: DataRow[], chart: PolarChartModel): void {
        const items = donutBlock
            .selectAll(`.${this.arcItemClass}`)
            .data(pieGenerator(data))
            .enter()
            .append('g')
            .attr('class', this.arcItemClass);

        const arcs = items
            .append('path')
            .attr('d', arcGenerator)
            .attr('class', this.arcPathClass)
            .each(function (d) { (this as any)._currentData = d; }); // _currentData используется для получения текущих данных внутри функции обновления.

        Helper.setCssClasses(arcs, chart.cssClasses);
        this.setElementsColor(items, chart.style.elementColors);
    }

    private static setElementsColor(arcItems: Selection<SVGGElement, unknown, BaseType, unknown>, colorPalette: Color[]): void {
        arcItems
            .select('path')
            .style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }

    private static mergeWithFirstEqualZero(firstDataset: DataRow[], secondDataset: DataRow[], keyField: string): DataRow[] {
        const secondSet = new Set()
        secondDataset.forEach(dataRow => {
            secondSet.add(dataRow[keyField]);
        });
        const onlyNew = firstDataset
            .filter(d => !secondSet.has(d[keyField]))
            .map((d, index, array) => {
                const data: DataRow = {
                    keyField: array[index][keyField],
                    valueField: 0
                }
                return data;
            });
        const sortedMerge = merge([secondDataset, onlyNew]);
        return sortedMerge;
    }
}