import { Selection, BaseType, select } from 'd3-selection';
import { PieArcDatum } from 'd3-shape'
import { BlockMargin, TwoDimensionalChartModel } from "../../model/model";
import { Block } from "../block/block";
import { easeLinear } from 'd3-ease';
import { interrupt, Transition } from 'd3-transition';
import { DonutHelper } from '../polarNotation/donut/DonutHelper';
import { DomHelper, SelectionCondition } from '../helpers/domHelper';
import { NamesManager } from '../namesManager';
import { DataRow, Size, TwoDimensionalChartType } from '../../config/config';
import { Donut } from '../polarNotation/donut/donut';
import { MarkDot } from '../features/markDots/markDot';
import { RectElemWithAttrs } from '../twoDimensionalNotation/bar/bar';

export class ElementHighlighter {
    private static inactiveElemClass = 'charts-opacity-inactive';

    public static toggleActivityStyle(elementSelection: Selection<BaseType, unknown, BaseType, unknown>, isActive: boolean): void {
        elementSelection.classed(this.inactiveElemClass, !isActive);
    }

    public static renderShadowFilter(block: Block): Selection<SVGFilterElement, unknown, HTMLElement, unknown> {
        const filterId = NamesManager.getId('shadow', block.id);

        let filter = block.renderDefs()
            .select<SVGFilterElement>(`filter#${filterId}`);

        if (filter.empty())
            filter = block.renderDefs()
                .append('filter')
                .attr('id', filterId)
                .attr('width', '300%')
                .attr('height', '300%')
                .attr('x', '-100%')
                .attr('y', '-100%');

        if (filter.select('feDropShadow').empty())
            filter.append('feDropShadow')
                .attr('dx', 0)
                .attr('dy', 0)
                .attr('flood-color', 'rgba(0, 0, 0, 0.5)')
                .attr('stdDeviation', 6);

        return filter;
    }

    public static setShadowFilter(elemSelection: Selection<BaseType, any, BaseType, any>, block: Block): void {
        // elemSelection.style('filter', `url(#${NamesManager.getId('shadow', block.id)})`);
        elemSelection.style('filter', 'drop-shadow(0px 0px 6px rgba(0, 0, 0, 0.5))');
    }

    public static removeFilter(elemSelection: Selection<BaseType, any, BaseType, any>): void {
        elemSelection.style('filter', null);
    }

    public static makeArcClone(segment: Selection<SVGGElement, PieArcDatum<DataRow>, BaseType, unknown>, block: Block): Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown> {
        const clone = segment
            .clone(true)
            .style('pointer-events', 'none')
            .raise()
            .classed(`${Donut.arcItemClass}`, false)
            .classed(`${Donut.arcItemClass}-clone`, true)
            .remove();
        block.getSvg().select(`.${Donut.clonesGroupClass}`).append(function () { return clone.node() });

        return clone as Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>;
    }

    public static removeCloneForElem(block: Block, keyFieldName: string, selectedSegment: Selection<SVGGElement, PieArcDatum<DataRow>, BaseType, unknown>): void {
        const clone = Donut.getAllArcClones(block)
            .filter((d: PieArcDatum<DataRow>) => d.data[keyFieldName] === selectedSegment.datum().data[keyFieldName]);
        clone.remove();
    }

    public static removeDonutArcClones(block: Block): void {
        Donut.getAllArcClones(block).remove();
    }

    public static renderArcCloneAndHighlight(block: Block, margin: BlockMargin, arcSelection: Selection<SVGGElement, PieArcDatum<DataRow>, BaseType, unknown>, blockSize: Size, donutThickness: number): void {
        const clones = this.makeArcClone(arcSelection, block)
        this.toggleDonutHighlightState(arcSelection, margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, true);
        this.toggleDonutHighlightState(clones, margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, true)
    }

    public static toggleDonutHighlightState(segment: Selection<SVGGElement, PieArcDatum<DataRow>, BaseType, unknown>, margin: BlockMargin, blockSize: Size, donutThickness: number, transitionDuration: number, on: boolean): void {
        let scaleSize = 0;
        if (on)
            scaleSize = 5; // Если нужно выделить сегмент, то scaleSize не равен нулю и отображается увеличенным

        segment
            .select('path')
            .interrupt()
            .transition()
            .duration(transitionDuration)
            .ease(easeLinear)
            .attr('d', (d, i) => DonutHelper.getArcGeneratorObject(blockSize, margin, donutThickness)
                .outerRadius(DonutHelper.getOuterRadius(margin, blockSize) + scaleSize)
                .innerRadius(DonutHelper.getOuterRadius(margin, blockSize) - donutThickness - scaleSize)(d, i));
    }

    public static removeDonutHighlightingByKeys(arcSegments: Selection<SVGGElement, PieArcDatum<DataRow>, BaseType, unknown>, keyFieldName: string, keyValues: string[], margin: BlockMargin, blockSize: Size, donutThickness: number): void {
        const segments = DomHelper.getChartElementsByKeys(arcSegments, true, keyFieldName, keyValues, SelectionCondition.Exclude);
        this.toggleDonutHighlightState(segments, margin, blockSize, donutThickness, 0, false);
    }

    public static highlight2DElementsHover(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        this.removeUnselected2DHighlight(block, keyFieldName, charts, transitionDuration);
        this.highlightElementsOf2D(block, keyFieldName, keyValue, charts, transitionDuration);
    }

    public static remove2DChartsFullHighlighting(block: Block, charts: TwoDimensionalChartModel[], transitionDuration: number = 0): void {
        charts.forEach(chart => {
            const elems = DomHelper.get2DChartElements(block, chart);

            if (chart.type !== 'bar' && !chart.markersOptions.show)
                elems.classed(MarkDot.hiddenDotClass, true);
            this.setElementsStyleByState(block, elems, false, chart.type, transitionDuration, false);
        });
    }

    public static removeUnselected2DHighlight(block: Block, keyFieldName: string, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        charts.forEach(chart => {
            const elems = DomHelper.get2DChartElements(block, chart);
            const selectedElems = DomHelper.getChartElementsByKeys(elems, chart.isSegmented, keyFieldName, block.filterEventManager.getSelectedKeys(), SelectionCondition.Exclude);

            if (chart.type !== 'bar' && !chart.markersOptions.show)
                selectedElems.classed(MarkDot.hiddenDotClass, true);
            this.setElementsStyleByState(block, selectedElems, false, chart.type, transitionDuration);
        });
    }

    private static toggle2DHighlightState(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], isHighlight: boolean, transitionDuration: number): void {
        charts.forEach(chart => {
            const elems = DomHelper.get2DChartElements(block, chart);
            const selectedElems = DomHelper.getChartElementsByKeys(elems, chart.isSegmented, keyFieldName, [keyValue]);

            if (chart.type !== 'bar' && !chart.markersOptions.show)
                selectedElems.classed(MarkDot.hiddenDotClass, !isHighlight);
            this.setElementsStyleByState(block, selectedElems, isHighlight, chart.type, transitionDuration);
        });
    }

    public static highlightElementsOf2D(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        this.toggle2DHighlightState(block, keyFieldName, keyValue, charts, true, transitionDuration);
    }

    public static remove2DHighlightingByKey(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        this.toggle2DHighlightState(block, keyFieldName, keyValue, charts, false, transitionDuration);
    }

    private static setElementsStyleByState(block: Block, elemSelection: Selection<BaseType, any, BaseType, any>, isHighlight: boolean, chartType: TwoDimensionalChartType, transitionDuration: number, flag: boolean = true): void {
        if (chartType === 'area' || chartType === 'line') {
            elemSelection.call(this.toggleDot, isHighlight, transitionDuration);
        } else {
            if (flag)
                this.toggleBar(elemSelection, isHighlight);
            if (isHighlight) {
                this.setShadowFilter(elemSelection, block);
            }
            else {
                this.removeFilter(elemSelection);
            }
        }
    }

    private static toggleBar(elemSelection: Selection<BaseType, any, BaseType, any>, isHighlight: boolean): void {
        const scaleSize = (width: number) => width * 0.1;
        const animationName = 'bar-highlight';
        if (isHighlight) {
            elemSelection.each(function () {
                const attrs = (this as RectElemWithAttrs).attrs;
                const handler = select(this).interrupt(animationName).transition(animationName).duration(200);
                if (attrs.orient === 'vertical') {
                    handler
                        .attr('x', attrs.x - scaleSize(attrs.width))
                        .attr('width', attrs.width + scaleSize(attrs.width) * 2);
                } else {
                    handler
                        .attr('y', attrs.y - scaleSize(attrs.height))
                        .attr('height', attrs.height + scaleSize(attrs.height) * 2);
                }
            });
        }
        else {
            elemSelection.each(function () {
                const attrs = (this as RectElemWithAttrs).attrs;
                const handler = select(this).interrupt(animationName).transition(animationName).duration(200);
                handler
                    .attr('x', attrs.x)
                    .attr('width', attrs.width)
                    .attr('y', attrs.y)
                    .attr('height', attrs.height);
            });
        }
    }

    private static toggleDot(elementSelection: Selection<BaseType, DataRow, BaseType, unknown>, isScaled: boolean, transitionDuration: number = 0): void {
        const animationName = 'size-scale';
        elementSelection.nodes().forEach(node => {
            interrupt(node, animationName);
        });

        let elementsHandler: Selection<BaseType, DataRow, BaseType, unknown> | Transition<BaseType, DataRow, BaseType, unknown> = elementSelection;
        if (transitionDuration > 0) {
            elementsHandler = elementsHandler
                .interrupt()
                .transition(animationName)
                .duration(transitionDuration)
                .ease(easeLinear);
        }

        elementsHandler
            .attr('r', isScaled ? 5 : 4)
            .style('stroke-width', (isScaled ? 3.5 : 3) + 'px')
            .each(function () {
                select(this).style('fill', isScaled ? select(this).style('stroke') : 'white');
            });
    }
}