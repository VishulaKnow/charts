import { select, Selection, BaseType } from 'd3-selection';
import { transition } from 'd3-transition';
import { BlockMargin, DataRow, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Block } from "../../block/block";
import { DomHelper } from '../../domHelper';
import { Helper } from "../../helper";
import { Scales } from "../scale/scale";
import { MarkDotHelper } from "./markDotsHelper";

export interface DotAttrs {
    cx: (data: DataRow) => number;
    cy: (data: DataRow) => number;
}

select.prototype.transition = transition;

export class MarkDot {
    public static markerDotClass = 'dot';
    private static dotRadius = 4;

    public static render(block: Block, data: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueFieldIndex: number, valueFieldName: string, chart: TwoDimensionalChartModel): void {
        const dotsWrapper = block.getChartGroup(chart.index)
            .selectAll(`.${this.markerDotClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-index-${valueFieldIndex}`)
            .data(data)
            .enter();

        const attrs = MarkDotHelper.getDotAttrs(keyAxisOrient, scales, margin, keyField, valueFieldName, chart.isSegmented);

        const dots = dotsWrapper.append('circle')
            .attr('class', this.markerDotClass)
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', this.dotRadius)
            .style('stroke-width', '3px')
            .style('fill', 'white')
            .style('clip-path', `url(#${block.getClipPathId()})`);

        DomHelper.setCssClasses(dots, Helper.getCssClassesWithElementIndex(chart.cssClasses, valueFieldIndex));
        DomHelper.setChartElementColor(dots, chart.style.elementColors, valueFieldIndex, 'stroke');
    }

    public static getAllDots(block: Block): Selection<BaseType, DataRow, BaseType, unknown> {
        return block.getSvg().selectAll(`.${this.markerDotClass}`);
    }

    public static updateDotsCoordinateByValueAxis(block: Block, newData: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueFieldIndex: number, valueFieldName: string, chart: TwoDimensionalChartModel): void {
        const dots = block.getChartGroup(chart.index)
            .selectAll(`.${this.markerDotClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueFieldIndex}`)
            .data(newData);

        const attrs = MarkDotHelper.getDotAttrs(keyAxisOrient, scales, margin, keyField, valueFieldName, chart.isSegmented);

        dots.exit().remove();

        const newDots = dots
            .enter()
            .append('circle')
            .attr('class', this.markerDotClass)
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', this.dotRadius)
            .style('stroke-width', '3px')
            .style('fill', 'white')
            .style('clip-path', `url(#${block.getClipPathId()})`);

        DomHelper.setCssClasses(newDots, Helper.getCssClassesWithElementIndex(chart.cssClasses, valueFieldIndex));
        DomHelper.setChartElementColor(newDots, chart.style.elementColors, valueFieldIndex, 'stroke');

        const animationName = 'data-updating'

        dots
            .interrupt(animationName)
            .transition(animationName)
            .duration(block.transitionManager.durations.chartUpdate)
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d));
    }
}