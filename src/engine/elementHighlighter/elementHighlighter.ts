import { Selection, BaseType } from 'd3-selection';
import { PieArcDatum } from 'd3-shape'
import { BlockMargin, DataRow, Size, TwoDimensionalChartModel } from "../../model/model";
import { Helper, SelectionCondition } from "../helper";
import { Block } from "../block/block";
import { easeLinear } from 'd3-ease';
import { interrupt, Transition } from 'd3-transition';
import { DonutHelper } from '../polarNotation/donut/DonutHelper';

export class ElementHighlighter {
    public static renderShadowFilter(block: Block, filterId: string): Selection<SVGFilterElement, unknown, HTMLElement, unknown> {
        let filter = block.renderDefs()
            .select<SVGFilterElement>(`filter#${filterId}`);

        if (filter.empty())
            filter = block.renderDefs()
                .append('filter')
                .attr('id', filterId)
                .attr('width', '300%')
                .attr('height', '300%')
                .attr('x', '-100%')
                .attr('y', '-100%')
                .style('outline', '1px solid red');

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

    public static changeDonutHighlightAppearance(segment: Selection<SVGGElement, PieArcDatum<DataRow>, BaseType, unknown>, margin: BlockMargin, blockSize: Size, donutThickness: number, transitionDuration: number, on: boolean): void {
        interrupt(segment.node());

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
        const segments = Helper.getChartElementsByKeys(arcSegments, true, keyFieldName, keyValues, SelectionCondition.Exclude);
        this.changeDonutHighlightAppearance(segments, margin, blockSize, donutThickness, 0, false);
        this.removeFilter(segments);
    }

    public static remove2DChartsFullHighlighting(block: Block, charts: TwoDimensionalChartModel[], transitionDuration: number = 0): void {
        charts.forEach(chart => {
            const elems = Helper.getChartElements(block, chart);
            if (chart.type === 'area' || chart.type === 'line') {
                elems.call(this.scaleElement, false, transitionDuration);
            } else {
                this.removeFilter(elems);
            }
        });
    }

    public static highlight2DElementsHover(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], filterId: string, transitionDuration: number): void {
        this.removeUnselected2DHighlight(block, keyFieldName, charts, transitionDuration);

        this.highlightElementsOf2D(block, keyFieldName, keyValue, charts, filterId, transitionDuration);
    }

    public static removeUnselected2DHighlight(block: Block, keyFieldName: string, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        charts.forEach(chart => {
            const elems = Helper.getChartElements(block, chart);

            const selectedElems = Helper.getChartElementsByKeys(elems, chart.isSegmented, keyFieldName, block.filterEventManager.getSelectedKeys(), SelectionCondition.Exclude);

            if (chart.type === 'area' || chart.type === 'line') {
                selectedElems.call(this.scaleElement, false, transitionDuration);
            } else {
                this.removeFilter(selectedElems);
            }
        });
    }

    public static highlightElementsOf2D(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], filterId: string, transitionDuration: number): void {
        charts.forEach(chart => {
            const elems = Helper.getChartElements(block, chart);

            const selectedElems = Helper.get2DElementsByKey(elems, chart.isSegmented, keyFieldName, keyValue);

            if (chart.type === 'area' || chart.type === 'line') {
                selectedElems.call(this.scaleElement, true, transitionDuration);
            } else {
                selectedElems.style('filter', `url(#${filterId})`);
            }
        });
    }

    //TODO: убрать дублирование
    public static remove2DHighlightingByKey(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        charts.forEach(chart => {
            const elems = Helper.getChartElements(block, chart);

            const selectedElems = Helper.get2DElementsByKey(elems, chart.isSegmented, keyFieldName, keyValue);

            if (chart.type === 'area' || chart.type === 'line') {
                selectedElems.call(this.scaleElement, false, transitionDuration);
            } else {
                this.removeFilter(elems);
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
}