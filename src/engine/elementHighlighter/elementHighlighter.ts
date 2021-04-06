import { Selection, BaseType } from 'd3-selection';
import { PieArcDatum } from 'd3-shape'
import { BlockMargin, DataRow, TwoDimensionalChartModel } from "../../model/model";
import { Block } from "../block/block";
import { easeLinear } from 'd3-ease';
import { interrupt, Transition } from 'd3-transition';
import { DonutHelper } from '../polarNotation/donut/DonutHelper';
import { DomHelper, SelectionCondition } from '../helpers/domHelper';
import { NamesManager } from '../namesManager';
import { Size, TwoDimensionalChartType } from '../../config/config';
import { Donut } from '../polarNotation/donut/donut';

export class ElementHighlighter {
    private static inactiveElemClass = 'charts-opacity-inactive';

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

    public static toggleActivityStyle(elementSelection: Selection<BaseType, unknown, BaseType, unknown>, isActive: boolean): void {
        elementSelection.classed(this.inactiveElemClass, !isActive);
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
            this.setElementsStyleByState(block, elems, false, chart.type, transitionDuration);
        });
    }

    public static removeUnselected2DHighlight(block: Block, keyFieldName: string, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        charts.forEach(chart => {
            const elems = DomHelper.get2DChartElements(block, chart);
            const selectedElems = DomHelper.getChartElementsByKeys(elems, chart.isSegmented, keyFieldName, block.filterEventManager.getSelectedKeys(), SelectionCondition.Exclude);

            this.setElementsStyleByState(block, selectedElems, false, chart.type, transitionDuration);
        });
    }

    private static toggle2DHighlightState(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], isHighlight: boolean, transitionDuration: number): void {
        charts.forEach(chart => {
            const elems = DomHelper.get2DChartElements(block, chart);
            const selectedElems = DomHelper.getChartElementsByKeys(elems, chart.isSegmented, keyFieldName, [keyValue]);

            this.setElementsStyleByState(block, selectedElems, isHighlight, chart.type, transitionDuration);
        });
    }

    public static highlightElementsOf2D(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        this.toggle2DHighlightState(block, keyFieldName, keyValue, charts, true, transitionDuration);
    }

    public static remove2DHighlightingByKey(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        this.toggle2DHighlightState(block, keyFieldName, keyValue, charts, false, transitionDuration);
    }

    private static setElementsStyleByState(block: Block, elemSelection: Selection<BaseType, any, BaseType, any>, isHighlight: boolean, chartType: TwoDimensionalChartType, transitionDuration: number): void {
        if (chartType === 'area' || chartType === 'line') {
            elemSelection.call(this.highlightDot, isHighlight, transitionDuration);
        } else {
            if (isHighlight) {
                this.setShadowFilter(elemSelection, block);
            }
            else {
                this.removeFilter(elemSelection);
            }
        }
    }

    private static highlightDot(elementSelection: Selection<BaseType, DataRow, BaseType, unknown>, isScaled: boolean, transitionDuration: number = 0): void {
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
            .attr('r', isScaled ? 6 : 4)
            .style('stroke-width', (isScaled ? 4.3 : 3) + 'px')
        // .each(function () {
        //     select(this).style('fill', isScaled ? select(this).style('stroke') : 'white');
        // });
    }
}