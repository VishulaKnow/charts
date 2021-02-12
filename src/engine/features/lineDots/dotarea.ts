import { select, pointer, Selection, EnterElement } from 'd3-selection'
import { DataRow } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";
import { DotAttrs } from "./dot";

export class DotArea
{
    public static render(block: Block, dotsWrapper: Selection<EnterElement, DataRow, SVGGElement, unknown>, attrs: DotAttrs, keyFieldName: string, cssClasses: string[], dotClass: string): void {
        const dotsHover = dotsWrapper.append('circle')
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', 40)
            .attr('class', 'dot-hover')
            .style('fill', 'none')
            .style('pointer-events', 'visibleFill')
            .lower();

        // dotsHover.sort((a, b) => attrs.cx(a[keyField]) > attrs.cx(b[keyField]) ? 1 : -1);
        // dotsHover.order();

        this.setDotsAreasListeners(block, dotsHover, keyFieldName, dotClass);

        Helper.setCssClasses(dotsHover, cssClasses);
    }

    private static setDotsAreasListeners(block: Block, dotsHover: Selection<SVGCircleElement, DataRow, SVGGElement, unknown>, keyFieldName: string, dotClass: string): void {
        const thisClass = this;
        let eventIsActive = false;
        let activeDot: Selection<SVGCircleElement, DataRow, SVGGElement, unknown>;

        dotsHover.each(function(dataRow) {
            select(this).on('mousemove', function(event) {
                const xDots = block.getChartBlock().selectAll<SVGCircleElement, DataRow>(`.${dotClass}`).filter((d) => d[keyFieldName] === dataRow[keyFieldName]);
                const attrsCy: number[] = [];
                xDots.each(function() {
                    attrsCy.push(parseFloat(select(this).attr('cy')));
                });

                const thisY = pointer(event, this)[1];
                let minClosing = Math.abs(attrsCy[0] - thisY),
                    indexOfDot = 0;
                attrsCy.forEach((attrCy, index) => {
                    if(Math.abs(attrCy - thisY) < minClosing) {
                        minClosing = Math.abs(attrCy - thisY);
                        indexOfDot = index;
                    }
                });

                const findedDot = xDots.filter((d, i) => i === indexOfDot);

                if(!activeDot || findedDot.node() !== activeDot.node() || !eventIsActive) {
                    if(activeDot)
                        activeDot.dispatch('mouseleave');

                    activeDot = findedDot;
                    eventIsActive = true;
                    findedDot.dispatch('mouseover');
                } 
            });
        });

        dotsHover.each(function(dataRow) {
            select(this).on('mouseleave', function(event) {
                const xDots = block.getChartBlock().selectAll<SVGCircleElement, DataRow>(`.${dotClass}`).filter((d) => d[keyFieldName] === dataRow[keyFieldName]);
                const attrsCy: number[] = [];
                xDots.each(function() {
                    attrsCy.push(parseFloat(select(this).attr('cy')));
                });

                const thisY = pointer(event, this)[1];
                let minClosing = Math.abs(attrsCy[0] - thisY),
                    indexOfDot = 0;
                attrsCy.forEach((attrCy, index) => {
                    if(Math.abs(attrCy - thisY) < minClosing) {
                        minClosing = Math.abs(attrCy - thisY);
                        indexOfDot = index;
                    }
                });

                xDots.filter((d, i) => i === indexOfDot).dispatch('mouseleave');
                activeDot = null;
                eventIsActive = false;
            });
        });
    }
}