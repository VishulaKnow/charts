import { Arc, Pie, PieArcDatum } from 'd3-shape'
import { Selection, BaseType } from 'd3-selection'
import { interpolate } from 'd3-interpolate'
import { BlockMargin, DonutChartSettings, PolarChartModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Aggregator } from "../../features/aggregator/aggregator";
import { DonutHelper } from './DonutHelper';
import { DomHelper } from '../../helpers/domHelper';
import { DataRow, Size } from '../../../config/config';
import { ElementHighlighter } from '../../elementHighlighter/elementHighlighter';

export interface Translate {
    x: number;
    y: number;
}

export class Donut {
    public static readonly donutBlockClass = 'donut-block';
    public static readonly arcPathClass = 'arc-path';
    public static readonly arcItemClass = 'arc';
    public static readonly arcHighlightedClass = 'arc-highlighted';
    public static readonly clonesGroupClass = 'arc-clones';

    public static render(block: Block, data: DataRow[], margin: BlockMargin, chart: PolarChartModel, blockSize: Size, settings: DonutChartSettings): void {
        const outerRadius = DonutHelper.getOuterRadius(margin, blockSize);
        const thickness = DonutHelper.getThickness(settings, blockSize, margin);
        const innerRadius = DonutHelper.getInnerRadius(outerRadius, thickness);

        const arcGenerator = DonutHelper.getArcGenerator(outerRadius, innerRadius);
        const pieGenerator = DonutHelper.getPieGenerator(chart.data.valueField.name, settings.padAngle);

        const translateAttr = DonutHelper.getTranslate(margin, blockSize);

        const donutBlock = block.getSvg()
            .append('g')
            .attr('class', this.donutBlockClass)
            .attr('x', translateAttr.x)
            .attr('y', translateAttr.y)
            .attr('transform', `translate(${translateAttr.x}, ${translateAttr.y})`);

        this.renderNewArcItems(arcGenerator, pieGenerator, donutBlock, data, chart);
        this.renderClonesG(donutBlock);

        Aggregator.render(block, data, chart.data.valueField, innerRadius, translateAttr, thickness, settings.aggregatorPad);
    }

    public static update(block: Block, data: DataRow[], margin: BlockMargin, chart: PolarChartModel, blockSize: Size, donutSettings: DonutChartSettings, keyField: string): Promise<any> {
        const outerRadius = DonutHelper.getOuterRadius(margin, blockSize);
        const thickness = DonutHelper.getThickness(donutSettings, blockSize, margin);
        const innerRadius = DonutHelper.getInnerRadius(outerRadius, thickness);

        const arcGenerator = DonutHelper.getArcGenerator(outerRadius, innerRadius);
        const pieGenerator = DonutHelper.getPieGenerator(chart.data.valueField.name, donutSettings.padAngle);

        const oldData = block.getSvg()
            .selectAll(`.${this.donutBlockClass}`)
            .selectAll<SVGPathElement, PieArcDatum<DataRow>>('path')
            .data()
            .map(d => d.data);

        const dataNewZeroRows = DonutHelper.mergeDataWithZeros(data, oldData, keyField);
        const dataExtraZeroRows = DonutHelper.mergeDataWithZeros(oldData, data, keyField);

        const donutBlock = block.getSvg().select<SVGGElement>(`.${this.donutBlockClass}`);

        this.renderNewArcItems(arcGenerator, pieGenerator, donutBlock, dataNewZeroRows, chart);
        this.setElementsColor(this.getAllArcGroups(block), chart.style.elementColors);

        const path = this.getAllArcGroups(block)
            .data(pieGenerator(dataExtraZeroRows))
            .select<SVGPathElement>('path');
        const items = this.getAllArcGroups(block)
            .data(pieGenerator(data));

        return new Promise(resolve => {
            this.raiseClonesG(block);
            path
                .interrupt()
                .transition()
                .duration(block.transitionManager.durations.chartUpdate)
                .on('end', () => {
                    items.exit().remove();
                    resolve('updated');
                })
                .attrTween('d', function (d) {
                    const interpolateFunc = interpolate((this as any)._currentData, d);
                    return t => {
                        (this as any)._currentData = interpolateFunc(t); // _current - старые данные до обновления, задаются во время рендера
                        return arcGenerator((this as any)._currentData);
                    }
                });
        });
    }

    public static updateColors(block: Block, chart: PolarChartModel): void {
        this.setElementsColor(this.getAllArcGroups(block), chart.style.elementColors);
    }

    public static getAllArcGroups(block: Block): Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown> {
        return block.getSvg()
            .selectAll(`.${this.arcItemClass}`) as Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>;
    }

    public static getAllArcClones(block: Block): Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown> {
        return block.getSvg()
            .selectAll(`.${Donut.arcItemClass}-clone`) as Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>;
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

        DomHelper.setCssClasses(arcs, chart.cssClasses);
        this.setElementsColor(items, chart.style.elementColors);
    }

    private static setElementsColor(arcItems: Selection<SVGGElement, unknown, BaseType, unknown>, colorPalette: string[]): void {
        arcItems
            .select('path')
            .style('fill', (d, i) => colorPalette[i % colorPalette.length]);
    }

    /**
     * Рендер группы для клонов сегментов доната внутри donut-block. Объекдиняет в себе стили для клонов 
     */
    private static renderClonesG(donutBlock: Selection<SVGGElement, unknown, BaseType, unknown>): void {
        const clonesG = donutBlock.append('g').attr('class', this.clonesGroupClass).raise();
        ElementHighlighter.setShadowFilter(clonesG);
    }

    private static raiseClonesG(block: Block): void {
        block.getSvg()
            .select(`.${this.donutBlockClass}`)
            .select(`.${this.clonesGroupClass}`)
            .raise();
    }
}