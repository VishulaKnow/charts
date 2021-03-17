import { Selection, BaseType } from 'd3-selection';
import { PieArcDatum } from 'd3-shape'
import { BlockMargin, DataRow, Size, TwoDimensionalChartModel } from "../model/model";
import { Helper } from "./helper";
import { Block } from "./block/block";
import { easeLinear } from 'd3-ease';
import { interrupt } from 'd3-transition';
import { DonutHelper } from './polarNotation/donut/DonutHelper';

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

    public static removeElementsFilter(elemSelection: Selection<BaseType, any, BaseType, any>): void {
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

    public static highlight2DElementsHover(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], filterId: string, transitionDuration: number): void {
        this.remove2DElementsHighlighting(block, charts, transitionDuration);

        this.highlightElementsOf2D(block, keyFieldName, keyValue, charts, filterId, transitionDuration);
    }

    public static remove2DElementsHighlighting(block: Block, charts: TwoDimensionalChartModel[], transitionDuration: number): void {
        charts.forEach(chart => {
            const elems = Helper.getChartElements(block, chart);
            if (chart.type === 'area' || chart.type === 'line') {
                elems.call(this.scaleElement, false, transitionDuration);
            } else {
                this.removeElementsFilter(elems);
            }
        });
    }

    public static highlightElementsOf2D(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[], filterId: string, transitionDuration: number): void {
        charts.forEach(chart => {
            const elems = Helper.getChartElements(block, chart);

            let selectedElems: Selection<BaseType, DataRow, BaseType, unknown>;
            if (!chart.isSegmented)
                selectedElems = elems.filter(d => d[keyFieldName] === keyValue);
            else
                selectedElems = elems.filter(d => d.data[keyFieldName] === keyValue);

            if (chart.type === 'area' || chart.type === 'line') {
                elems.call(this.scaleElement, false, transitionDuration);
                selectedElems.call(this.scaleElement, true, transitionDuration);
            } else {
                selectedElems.style('filter', `url(#${filterId})`);
            }
        });
    }

    private static scaleElement(elementSelection: Selection<BaseType, DataRow, BaseType, unknown>, isScaled: boolean, transitionDuration: number): void {
        const animationName = 'size-scale';

        elementSelection.nodes().forEach(node => {
            interrupt(node, animationName);
        });

        elementSelection
            .interrupt(animationName)
            .transition(animationName)
            .duration(transitionDuration)
            .ease(easeLinear)
            .attr('r', isScaled ? 6 : 4)
            .style('stroke-width', (isScaled ? 4.3 : 3) + 'px');
    }
}