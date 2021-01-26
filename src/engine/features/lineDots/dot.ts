import { Color } from "d3";
import { BlockMargin, DataRow, Orient } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";
import { Scale, Scales } from "../scale/scale";

interface DotAttrs {
    cx: (data: DataRow) => number;
    cy: (data: DataRow) => number; 
}

export class Dot
{
    private static dotClass = 'dot';

    public static render(block: Block, data: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, cssClasses: string[], colorPalette: Color[]): void {
        const dotsWrapper = block.getChartBlock()
            .selectAll(`.${this.dotClass}${Helper.getCssClassesLine(cssClasses)}`)
            .data(data)
            .enter();

        const attrs = this.getDotAttrs(keyAxisOrient, scales, margin, keyField, valueField);

        const dots = dotsWrapper.append('circle')
            .attr('class', this.dotClass)
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', 5.5);

        const dotsInside = dotsWrapper.append('circle')
            .attr('class', 'dot-inside')
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', 2.5)
            .style('fill', 'white')
            .style('pointer-events', 'none');

        Helper.setCssClasses(dots, cssClasses);
        Helper.setCssClasses(dotsInside, cssClasses);
        Helper.setChartElementColor(dots, colorPalette, 'fill');
    }

    public static getAllDots(block: Block): d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown> {
        return block.getSvg()
            .selectAll(`.${this.dotClass}`);
    }

    public static updateDotsCoordinateByValueAxis(block: Block, data: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, cssClasses: string[]): void {
        const dots = block.getChartBlock()
            .selectAll(`.${this.dotClass}${Helper.getCssClassesLine(cssClasses)}`)
            .data(data);
        
        const attrs = this.getDotAttrs(keyAxisOrient, scales, margin, keyField, valueField);

        dots
            .transition()
            .duration(1000)
                .attr('cx', d => attrs.cx(d))
                .attr('cy', d => attrs.cy(d));

        block.getChartBlock()
            .selectAll(`.dot-inside${Helper.getCssClassesLine(cssClasses)}`)
            .data(data)
            .transition()
            .duration(1000)
                .attr('cx', d => attrs.cx(d))
                .attr('cy', d => attrs.cy(d));
    }

    private static getDotAttrs(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string): DotAttrs {
        const attrs: DotAttrs = { cx: null, cy: null } 

        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            attrs.cx = d => scales.scaleValue(d[valueField]) + margin.left;
            attrs.cy = d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyField]) + margin.top;
        } else if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            attrs.cx = d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyField]) + margin.left,
            attrs.cy = d => scales.scaleValue(d[valueField]) + margin.top
        }

        return attrs;
    }
}