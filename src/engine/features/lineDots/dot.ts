import { Color } from "d3";
import { BlockMargin, DataRow, Orient, Size } from "../../../model/model";
import { Block } from "../../block/block";
import { BlockHelper } from "../../block/blockHelper";
import { Helper } from "../../helper";
import { Scale, Scales } from "../scale/scale";

interface DotAttrs {
    cx: (data: DataRow) => number;
    cy: (data: DataRow) => number; 
}

export class Dot
{
    private static dotClass = 'dot';
    private static dotRadius = 5.5;
    private static innerDotRadius = 2.5;

    public static render(block: Block, data: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, cssClasses: string[], itemIndex: number, colorPalette: Color[], blockSize: Size, isSegmented: boolean): void {
        this.renderClipPathForCircles(block, blockSize, margin)
        
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
            .style('clip-path', `url(#clipPath-dots-${block.getSvgCssClasses().join('-')})`);

        const dotsInside = dotsWrapper.append('circle')
            .attr('class', 'dot-inside')
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', this.innerDotRadius)
            .style('fill', 'white')
            .style('pointer-events', 'none');

        Helper.setCssClasses(dots, cssClasses.concat([`chart-index-${itemIndex}`]));
        Helper.setCssClasses(dotsInside, cssClasses);
        Helper.setChartElementColor(dots, colorPalette, itemIndex, 'fill');
    }

    public static getAllDots(block: Block): d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown> {
        return block.getSvg()
            .selectAll(`.${this.dotClass}`);
    }

    public static updateDotsCoordinateByValueAxis(block: Block, data: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, cssClasses: string[]): void {
        const dots = block.getChartBlock()
            .selectAll(`.${this.dotClass}${Helper.getCssClassesLine(cssClasses)}`)
            .data(data);
        
        const attrs = this.getDotAttrs(keyAxisOrient, scales, margin, keyField, valueField, false);

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

    private static renderClipPathForCircles(block: Block, blockSize: Size, margin: BlockMargin): void {
        const attributes = BlockHelper.getChartBlockAttributes(blockSize, margin);
        block.getSvg()
            .select('defs')
            .append('clipPath')
            .attr('id', `clipPath-dots-${block.getSvgCssClasses().join('-')}`)
            .append('rect')
            .attr('x', attributes.x - this.dotRadius)
            .attr('y', attributes.y - this.dotRadius)
            .attr('width', attributes.width + this.dotRadius * 2)
            .attr('height', attributes.height + this.dotRadius * 2);
    }
}