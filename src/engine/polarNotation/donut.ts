import { PieArcDatum } from 'd3-shape'
import { Color } from "d3-color";
import { Selection, BaseType } from 'd3-selection'
import { interpolate } from 'd3-interpolate'
import { BlockMargin, DataRow, DonutChartSettings, PolarChartModel, Size } from "../../model/model";
import { Helper } from "../helper";
import { Block } from "../block/block";
import { Aggregator } from "./aggregator";
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
            .each(function (d) { (this as any)._currentData = d; });

        Helper.setCssClasses(arcs, chart.cssClasses);
        this.setElementsColor(items, chart.style.elementColors);

        Aggregator.render(block, data, chart.data.valueField, innerRadius, translateAttribute, thickness);
    }

    public static updateValues(block: Block, data: DataRow[], margin: BlockMargin, chart: PolarChartModel, blockSize: Size, donutSettings: DonutChartSettings, keyField: string): Promise<any> {
        const outerRadius = DonutHelper.getOuterRadius(margin, blockSize);
        const thickness = DonutHelper.getThickness(donutSettings, blockSize, margin);
        const innerRadius = DonutHelper.getInnerRadius(outerRadius, thickness);
        const arcGenerator = DonutHelper.getArcGenerator(outerRadius, innerRadius);
        const pieGenerator = DonutHelper.getPieGenerator(chart.data.valueField.name, donutSettings.padAngle);

        var oldData = block.getSvg().selectAll(`.${this.donutBlockClass}`)
            .selectAll("path")
            .data().map((d) => (d as any).data);

        const was = this.mergeWithFirstEqualZero(data, oldData, keyField);
        const is = this.mergeWithFirstEqualZero(oldData, data, keyField);

        const donutBlock = block.getSvg()
            .selectAll(`.${this.donutBlockClass}`);

        let items = donutBlock
            .selectAll(`.${this.arcItemClass}`)
            .data(pieGenerator(was))
            .enter()
            .append('g')
            .attr('class', this.arcItemClass);

        const arcs = items
            .append('path')
            .attr('d', arcGenerator)
            .attr('class', this.arcPathClass)
            .each(function (d) { (this as any)._currentData = d; });

        Helper.setCssClasses(arcs, chart.cssClasses);
        this.setElementsColor(items, chart.style.elementColors);

        // add transition
        items = this.getAllArcGroups(block)
            .data(pieGenerator(is));

        const path = items.select<SVGPathElement>('path');

        items = this.getAllArcGroups(block)
            .data(pieGenerator(data));
        items.exit()
            .transition()
            .delay(block.transitionManager.updateChartsDuration)
            .duration(0)
            .remove();

        return new Promise((resolve, reject) => {
            path
                .interrupt()
                .transition()
                .duration(block.transitionManager.updateChartsDuration)
                .on('end', () => resolve(''))
                .attrTween('d', function (d) {
                    const interpolateFunc = interpolate((this as any)._currentData, d); // current - старые данные до обновления, задаются во время рендера
                    const _this = this;
                    return function (t) {
                        (_this as any)._currentData = interpolateFunc(t);
                        return arcGenerator((_this as any)._currentData);
                    }
                });
        });
    }

    public static getAllArcGroups(block: Block): Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown> {
        return block.getSvg()
            .selectAll(`.${this.arcItemClass}`) as Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>;
    }

    private static setElementsColor(arcItems: Selection<SVGGElement, unknown, BaseType, unknown>, colorPalette: Color[]): void {
        arcItems
            .select('path')
            .style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }

    private static mergeWithFirstEqualZero(first: DataRow[], second: DataRow[], keyField: string): DataRow[] {
        const secondSet = new Set()
        second.forEach(function (d) {
            secondSet.add(d[keyField]);
        });
        const onlyFirst = first
            .filter(d => !secondSet.has(d[keyField]))
            .map((d, index, array) => {
                const data: DataRow = {
                    keyField: array[index][keyField],
                    valueField: 0
                }
                return data;
            });
        const sortedMerge = merge([second, onlyFirst])
        return sortedMerge;
    }
}