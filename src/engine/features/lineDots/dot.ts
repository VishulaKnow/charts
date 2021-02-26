import { Color } from "d3-color";
import { select, Selection, BaseType } from 'd3-selection';
import { transition } from 'd3-transition';
import { BlockMargin, DataRow, Orient, Size } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";
import { Scale, Scales } from "../scale/scale";

export interface DotAttrs {
    cx: (data: DataRow) => number;
    cy: (data: DataRow) => number; 
}

select.prototype.transition = transition;

export class Dot
{
    public static dotClass = 'dot';
    private static dotRadius = 4;

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
            .style('stroke-width', '3px')
            .style('fill', 'white');
        
        Helper.setCssClasses(dots, Helper.getCssClassesWithElementIndex(cssClasses, itemIndex));
        Helper.setChartElementColor(dots, colorPalette, itemIndex, 'stroke');
    }

    public static getAllDots(block: Block, chartCssClasses: string[]): Selection<BaseType, DataRow, BaseType, unknown> {
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
    }

    private static getDotAttrs(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, isSegmented: boolean): DotAttrs {
        const attrs: DotAttrs = { cx: null, cy: null }

        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            attrs.cx = d => scales.scaleValue(d[valueField]) + margin.left;
            attrs.cy = d => Scale.getScaledValue(scales.scaleKey, this.getKeyFieldValue(d, keyField, isSegmented)) + margin.top;
        } else if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            attrs.cx = d => Scale.getScaledValue(scales.scaleKey, this.getKeyFieldValue(d, keyField, isSegmented)) + margin.left,
            attrs.cy = d => scales.scaleValue(d[valueField]) + margin.top
        }

        return attrs;
    }

    private static getKeyFieldValue(row: DataRow, keyFieldName: string, isSegmented: boolean): string {
        return isSegmented ? row.data[keyFieldName] : row[keyFieldName];
    }
}