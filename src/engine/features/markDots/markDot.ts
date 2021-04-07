import { select, Selection, BaseType } from 'd3-selection';
import { transition } from 'd3-transition';
import { DataRow } from '../../../config/config';
import { BlockMargin, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Block } from "../../block/block";
import { DomHelper } from '../../helpers/domHelper';
import { Helper } from '../../helpers/helper';
import { Scales } from "../scale/scale";
import { MarkDotHelper } from "./markDotsHelper";

export interface DotAttrs {
    cx: (data: DataRow) => number;
    cy: (data: DataRow) => number;
}

select.prototype.transition = transition;

export class MarkDot {
    public static readonly markerDotClass = 'dot';
    private static dotRadius = 4;

    public static render(block: Block, data: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyFieldName: string, valueFieldIndex: number, valueFieldName: string, chart: TwoDimensionalChartModel): void {
        const dotsWrapper = block.getChartGroup(chart.index)
            .selectAll(`.${this.markerDotClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-index-${valueFieldIndex}`)
            .data(data)
            .enter();

        const attrs = MarkDotHelper.getDotAttrs(keyAxisOrient, scales, margin, keyFieldName, valueFieldName, chart.isSegmented);
        const dots = dotsWrapper.append('circle');
        this.setAttrs(block, dots, attrs);

        DomHelper.setCssClasses(dots, Helper.getCssClassesWithElementIndex(chart.cssClasses, valueFieldIndex));
        DomHelper.setChartElementColor(dots, chart.style.elementColors, valueFieldIndex, 'stroke');
    }

    public static update(block: Block, newData: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueFieldIndex: number, valueFieldName: string, chart: TwoDimensionalChartModel): void {
        const dots = block.getChartGroup(chart.index)
            .selectAll(`.${this.markerDotClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueFieldIndex}`)
            .data(newData);

        dots.exit().remove();

        const attrs = MarkDotHelper.getDotAttrs(keyAxisOrient, scales, margin, keyField, valueFieldName, chart.isSegmented);
        const newDots = dots
            .enter()
            .append('circle');
        this.setAttrs(block, newDots, attrs);

        DomHelper.setCssClasses(newDots, Helper.getCssClassesWithElementIndex(chart.cssClasses, valueFieldIndex));
        DomHelper.setChartElementColor(newDots, chart.style.elementColors, valueFieldIndex, 'stroke');

        const animationName = 'data-updating';

        dots
            .interrupt(animationName)
            .transition(animationName)
            .duration(block.transitionManager.durations.chartUpdate)
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d));
    }

    public static renderDot(block: Block, data: DataRow, keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyFieldName: string, chart: TwoDimensionalChartModel): void {
        chart.data.valueFields.forEach((valueField, vfIndex) => {
            let dotWrapper = block.getChartGroup(chart.index)
                .selectAll<SVGCircleElement, DataRow>(`.${this.markerDotClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-index-${vfIndex}`)
                .filter(d => d[keyFieldName] === data[keyFieldName]);
            if (!dotWrapper.empty())
                return;

            const attrs = MarkDotHelper.getDotAttrs(keyAxisOrient, scales, margin, keyFieldName, valueField.name, chart.isSegmented);
            const newDot = block.getChartGroup(chart.index)
                .append('circle')
                .datum(data);
            this.setAttrs(block, newDot, attrs);

            DomHelper.setCssClasses(newDot, Helper.getCssClassesWithElementIndex(chart.cssClasses, vfIndex));
            DomHelper.setChartElementColor(newDot, chart.style.elementColors, vfIndex, 'stroke');
        })
    }

    public static updateColors(block: Block, chart: TwoDimensionalChartModel, valueFieldIndex: number): void {
        const dots = block.getChartGroup(chart.index)
            .selectAll(`.${this.markerDotClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueFieldIndex}`);
        DomHelper.setChartElementColor(dots, chart.style.elementColors, valueFieldIndex, 'stroke');
    }

    public static getAllDots(block: Block): Selection<BaseType, DataRow, BaseType, unknown> {
        return block.getSvg().selectAll(`.${this.markerDotClass}`);
    }

    public static getMarkDotForChart(block: Block, chartCssClasses: string[]): Selection<BaseType, DataRow, BaseType, unknown> {
        return block.getSvg()
            .selectAll(`.${MarkDot.markerDotClass}${Helper.getCssClassesLine(chartCssClasses)}`);
    }

    private static setAttrs(block: Block, dots: Selection<SVGCircleElement, DataRow, BaseType, any>, attrs: DotAttrs): void {
        dots
            .attr('class', this.markerDotClass)
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', this.dotRadius)
            .style('stroke-width', '3px')
            .style('fill', 'white')
            .style('clip-path', `url(#${block.getClipPathId()})`);
    }
}