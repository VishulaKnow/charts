import { Selection, BaseType } from 'd3-selection';
import { PieArcDatum } from 'd3-shape'
import { BlockMargin, DataRow, TwoDimensionalChartModel } from "../../model/model";
import { Block } from "../block/block";
import { easeLinear } from 'd3-ease';
import { interrupt, Transition } from 'd3-transition';
import { DonutHelper } from '../polarNotation/donut/DonutHelper';
import { DomHelper, SelectionCondition } from '../helpers/domHelper';
import { NamesManager } from '../namesManager';
import { Size } from '../../config/config';
import { Donut } from '../polarNotation/donut/donut';

export class ElementHighlighter {
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

    public static removeDonutArcClones(block: Block) {
        let clones = Donut.getAllArcClones(block);
        clones.remove()
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

    public static removeFilter(elemSelection: Selection<BaseType, any, BaseType, any>): void {
        elemSelection.style('filter', null);
    }

    public static setFilter(elemSelection: Selection<BaseType, any, BaseType, any>, block: Block): void {
        elemSelection.style('filter', `url(#${NamesManager.getId('shadow', block.id)})`);
    }

    public static changeDonutHighlightAppearance(segment: Selection<SVGGElement, PieArcDatum<DataRow>, BaseType, unknown>, margin: BlockMargin, blockSize: Size, donutThickness: number, transitionDuration: number, on: boolean): void {
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
        this.changeDonutHighlightAppearance(segments, margin, blockSize, donutThickness, 0, false);
    }

    public static remove2DChartsFullHighlighting(block: Block, charts: TwoDimensionalChartModel[], transitionDuration: number = 0): void {
        charts.forEach(chart => {
            const elems = DomHelper.get2DChartElements(block, chart);
            if (chart.type === 'area' || chart.type === 'line') {
                elems.call(this.scaleElement, false, transitionDuration);
            } else {
                this.removeFilter(elems);
            }
        });
    }

    public static highlight2DElementsHover(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        this.removeUnselected2DHighlight(block, keyFieldName, charts, transitionDuration);

        this.highlightElementsOf2D(block, keyFieldName, keyValue, charts, transitionDuration);
    }

    public static removeUnselected2DHighlight(block: Block, keyFieldName: string, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        charts.forEach(chart => {
            const elems = DomHelper.get2DChartElements(block, chart);

            const selectedElems = DomHelper.getChartElementsByKeys(elems, chart.isSegmented, keyFieldName, block.filterEventManager.getSelectedKeys(keyFieldName), SelectionCondition.Exclude);

            if (chart.type === 'area' || chart.type === 'line') {
                selectedElems.call(this.scaleElement, false, transitionDuration);
            } else {
                this.removeFilter(selectedElems);
            }
        });
    }

    public static highlightElementsOf2D(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        const filterId = NamesManager.getId('shadow', block.id);
        this.change2DHighlightState(block, keyFieldName, keyValue, charts, true, filterId, transitionDuration);
    }

    public static remove2DHighlightingByKey(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        this.change2DHighlightState(block, keyFieldName, keyValue, charts, false, null, transitionDuration);
    }

    private static change2DHighlightState(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], isHighlight: boolean, filterId: string, transitionDuration: number): void {
        charts.forEach(chart => {
            const elems = DomHelper.get2DChartElements(block, chart);

            const selectedElems = DomHelper.get2DElementsByKey(elems, chart.isSegmented, keyFieldName, keyValue);

            if (chart.type === 'area' || chart.type === 'line') {
                selectedElems.call(this.scaleElement, isHighlight, transitionDuration);
            } else {
                if (isHighlight)
                    selectedElems.style('filter', `url(#${filterId})`);
                else
                    this.removeFilter(selectedElems);
            }
        });
    }

    private static scaleElement(elementSelection: Selection<BaseType, DataRow, BaseType, unknown>, isScaled: boolean, transitionDuration: number = 0): void {
        const animationName = 'size-scale';

        elementSelection.nodes().forEach(node => {
            interrupt(node, animationName);
        });

        let elementsHandler: Selection<BaseType, DataRow, BaseType, unknown> | Transition<BaseType, DataRow, BaseType, unknown> = elementSelection;

        if (transitionDuration > 0) {
            elementsHandler = elementsHandler.interrupt().transition(animationName)
                .duration(transitionDuration)
                .ease(easeLinear);
        }

        elementsHandler
            .attr('r', isScaled ? 6 : 4)
            .style('stroke-width', (isScaled ? 4.3 : 3) + 'px');
    }

    public static removeCloneForElem(block: Block, keyFieldName: string, selectedSegment: Selection<SVGGElement, PieArcDatum<DataRow>, BaseType, unknown>): void {
        const clone = Donut.getAllArcClones(block)
            .filter((d: PieArcDatum<DataRow>) => d.data[keyFieldName] === selectedSegment.datum().data[keyFieldName]);
        clone.remove();
    }
}