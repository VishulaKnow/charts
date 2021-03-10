import { Color } from "d3-color";
import { select, Selection, BaseType } from 'd3-selection';
import { transition } from 'd3-transition';
import { BlockMargin, DataRow, Orient } from "../../../model/model";
import { Block } from "../../block/block";
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

    public static render(block: Block, data: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, cssClasses: string[], itemIndex: number, colorPalette: Color[], isSegmented: boolean): void {
        const dotsWrapper = block.getChartBlock()
            .selectAll(`.${this.markerDotClass}${Helper.getCssClassesLine(cssClasses)}.chart-index-${itemIndex}`)
            .data(data)
            .enter();

        const attrs = MarkDotHelper.getDotAttrs(keyAxisOrient, scales, margin, keyField, valueField, isSegmented);

        const dots = dotsWrapper.append('circle')
            .attr('class', this.markerDotClass)
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', this.dotRadius)
            .style('stroke-width', '3px')
            .style('fill', 'white')
            .style('clip-path', `url(#${block.getClipPathId()})`);

        Helper.setCssClasses(dots, Helper.getCssClassesWithElementIndex(cssClasses, itemIndex));
        Helper.setChartElementColor(dots, colorPalette, itemIndex, 'stroke');
    }

    public static getAllDots(block: Block): Selection<BaseType, DataRow, BaseType, unknown> {
        return block.getSvg().selectAll(`.${this.markerDotClass}`);
    }

    public static updateDotsCoordinateByValueAxis(block: Block, newData: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, cssClasses: string[], itemIndex: number, colorPalette: Color[], isSegmented: boolean): void {
        const dots = block.getChartBlock()
            .selectAll(`.${this.markerDotClass}${Helper.getCssClassesLine(cssClasses)}.chart-element-${itemIndex}`)
            .data(newData);

        const attrs = MarkDotHelper.getDotAttrs(keyAxisOrient, scales, margin, keyField, valueField, isSegmented);

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

        Helper.setCssClasses(newDots, Helper.getCssClassesWithElementIndex(cssClasses, itemIndex));
        Helper.setChartElementColor(newDots, colorPalette, itemIndex, 'stroke');

        dots
            .interrupt()
            .transition()
            .duration(block.transitionManager.updateChartsDuration)
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d));
    }
}