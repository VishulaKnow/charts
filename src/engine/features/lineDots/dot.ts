import * as d3 from "d3";
import { Color, min } from "d3";
import { BlockMargin, DataRow, Orient, Size } from "../../../model/model";
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

        // this.renderDotsAreas(block, dotsWrapper, attrs, keyField, cssClasses);
        
        Helper.setCssClasses(dots, Helper.getCssClassesWithElementIndex(cssClasses, itemIndex));
        Helper.setCssClasses(dotsInside, Helper.getCssClassesWithElementIndex(cssClasses, itemIndex));
        Helper.setChartElementColor(dots, colorPalette, itemIndex, 'fill');
    }

    private static renderDotsAreas(block: Block, dotsWrapper: d3.Selection<d3.EnterElement, DataRow, SVGGElement, unknown>, attrs: DotAttrs, keyField: string, cssClasses: string[]): void {
        const dotsHover = dotsWrapper.append('circle')
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', 40)
            .attr('class', 'dot-hover')
            .style('fill', 'none')
            .style('pointer-events', 'visibleFill')
            .lower();

        dotsHover.sort((a, b) => attrs.cx(a[keyField]) > attrs.cx(b[keyField]) ? 1 : -1);
        dotsHover.order();

        const thisClass = this;

        ['mouseover', 'mouseleave'].forEach(eventName => {
            dotsHover.each(function(dataRow) {
                d3.select(this).on(eventName, function(event) {
                    const xDots = block.getChartBlock().selectAll<SVGCircleElement, DataRow>(`.${thisClass.dotClass}`).filter((d) => d[keyField] === dataRow[keyField]);
                    const attrsCy: number[] = [];
                    xDots.each(function() {
                        attrsCy.push(parseFloat(d3.select(this).attr('cy')));
                    });
    
                    const thisY = d3.pointer(event, this)[1];
                    let minClosing = Math.abs(attrsCy[0] - thisY),
                        indexOfDot = 0;
                    attrsCy.forEach((attrCy, index) => {
                        if(Math.abs(attrCy - thisY) < minClosing) {
                            minClosing = Math.abs(attrCy - thisY);
                            indexOfDot = index;
                        }
                    });
    
                    xDots.filter((d, i) => i === indexOfDot).dispatch(eventName);
                });
            });
        })

        Helper.setCssClasses(dotsHover, cssClasses);
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