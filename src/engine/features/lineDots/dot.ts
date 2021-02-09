import * as d3 from "d3";
import { Color } from "d3";
import { BlockMargin, DataRow, Orient, Size } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";
import { Scale, Scales } from "../scale/scale";
import { DotArea } from "./dotarea";

export interface DotAttrs {
    cx: (data: DataRow) => number;
    cy: (data: DataRow) => number; 
}

export class Dot
{
    private static dotClass = 'dot';
    private static dotRadius = 5.5;
    private static innerDotRadius = 2.5;

    public static render(block: Block, data: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, cssClasses: string[], itemIndex: number, colorPalette: Color[], blockSize: Size, isSegmented: boolean): void {
        const dotsWrapper = block.getChartBlock()
            .selectAll(`.${this.dotClass}${Helper.getCssClassesLine(cssClasses)}.chart-index-${itemIndex}`)
            .data(data)
            .enter();

        const attrs = this.getDotAttrs(keyAxisOrient, scales, margin, keyField, valueField, isSegmented);

        const dots = dotsWrapper.append('circle')
            .attr('class', this.dotClass)
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', this.dotRadius)
            .style('clip-path', `url(${block.getClipPathId()})`);

        const dotsInside = dotsWrapper.append('circle')
            .attr('class', 'dot-inside')
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', this.innerDotRadius)
            .style('fill', 'white')
            .style('pointer-events', 'none');

        DotArea.render(block, dotsWrapper, attrs, keyField, cssClasses, this.dotClass);
        
        Helper.setCssClasses(dots, Helper.getCssClassesWithElementIndex(cssClasses, itemIndex));
        Helper.setCssClasses(dotsInside, Helper.getCssClassesWithElementIndex(cssClasses, itemIndex));
        Helper.setChartElementColor(dots, colorPalette, itemIndex, 'fill');
    }

    public static getAllDots(block: Block, chartCssClasses: string[]): d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown> {
        return block.getSvg()
            .selectAll(`.${this.dotClass}${Helper.getCssClassesLine(chartCssClasses)}`);
    }

    public static updateDotsCoordinateByValueAxis(block: Block, data: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, cssClasses: string[], index: number, isSegmented: boolean): void {
        const dots = block.getChartBlock()
            .selectAll(`.${this.dotClass}${Helper.getCssClassesLine(cssClasses)}.chart-element-${index}`)
            .data(data);
        
        const attrs = this.getDotAttrs(keyAxisOrient, scales, margin, keyField, valueField, isSegmented);
        
        dots
            .transition()
            .duration(1000)
                .attr('cx', d => attrs.cx(d))
                .attr('cy', d => attrs.cy(d));

        block.getChartBlock()
            .selectAll(`.dot-inside${Helper.getCssClassesLine(cssClasses)}.chart-element-${index}`)
            .data(data)
            .transition()
            .duration(1000)
                .attr('cx', d => attrs.cx(d))
                .attr('cy', d => attrs.cy(d));
    }

    private static getDotAttrs(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, isSegmented: boolean): DotAttrs {
        const attrs: DotAttrs = { cx: null, cy: null }

        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            attrs.cx = d => scales.scaleValue(d[valueField]) + margin.left;
            attrs.cy = d => Scale.getScaleKeyPoint(scales.scaleKey, this.getKeyFieldValue(d, keyField, isSegmented)) + margin.top;
        } else if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            attrs.cx = d => Scale.getScaleKeyPoint(scales.scaleKey, this.getKeyFieldValue(d, keyField, isSegmented)) + margin.left,
            attrs.cy = d => scales.scaleValue(d[valueField]) + margin.top
        }

        return attrs;
    }

    private static getKeyFieldValue(row: DataRow, keyFieldName: string, isSegmented: boolean): string {
        return isSegmented ? row.data[keyFieldName] : row[keyFieldName];
    }
}