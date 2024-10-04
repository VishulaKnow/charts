import { select, Selection, BaseType } from 'd3-selection';
import { transition } from 'd3-transition';
import { MdtChartsDataRow } from '../../../config/config';
import { BlockMargin, MarkersOptions, MarkersStyleOptions, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Block } from "../../block/block";
import { DomHelper } from '../../helpers/domHelper';
import { Helper } from '../../helpers/helper';
import { NamesHelper } from '../../helpers/namesHelper';
import { Scales } from "../scale/scale";
import { MarkDotHelper } from "./markDotsHelper";
import { ElementHighlighter } from "../../../engine/elementHighlighter/elementHighlighter";

export interface DotAttrs {
    cx: (data: MdtChartsDataRow) => number;
    cy: (data: MdtChartsDataRow) => number;
}

select.prototype.transition = transition;

interface MarkDotDataItem extends MdtChartsDataRow {
    $mdtChartsMetadata: { valueFieldName: string };
}

export class MarkDot {
    public static readonly markerDotClass = NamesHelper.getClassName('dot');
    public static readonly hiddenDotClass = NamesHelper.getClassName('dot-hidden');

    public static render(block: Block, data: MdtChartsDataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyFieldName: string, vfIndex: number, valueFieldName: string, chart: TwoDimensionalChartModel): void {
        const dotsWrapper = block.svg.getChartGroup(chart.index)
            .selectAll(`.${this.markerDotClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-index-${vfIndex}`)
            .data(data.map<MarkDotDataItem>(row => ({ ...row, $mdtChartsMetadata: { valueFieldName } })))
            .enter();

        const attrs = MarkDotHelper.getDotAttrs(keyAxisOrient, scales, margin, keyFieldName, valueFieldName, chart.isSegmented);
        const dots = dotsWrapper.append('circle');
        this.setAttrs(block, dots, attrs, chart.markersOptions.styles);

        this.setClassesAndStyle(dots, chart.cssClasses, vfIndex, chart.style.elementColors);
        MarkDot.tryMakeMarkDotVisible(dots, chart.markersOptions, false);
    }

    public static update(block: Block, newData: MdtChartsDataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyFieldName: string, vfIndex: number, valueFieldName: string, chart: TwoDimensionalChartModel): void {
        const dots = block.svg.getChartGroup(chart.index)
            .selectAll(`.${this.markerDotClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${vfIndex}`)
            .data(newData.map<MarkDotDataItem>(row => ({ ...row, $mdtChartsMetadata: { valueFieldName } })));
        dots.exit().remove();

        dots.each(function (datum) {
            if (chart.markersOptions.show({ row: datum, valueFieldName })) {
                MarkDot.toggleMarkDotVisible(select(this), true);
            }
        });

        const attrs = MarkDotHelper.getDotAttrs(keyAxisOrient, scales, margin, keyFieldName, valueFieldName, chart.isSegmented);
        const newDots = dots
            .enter()
            .append('circle');
        this.setAttrs(block, newDots, attrs, chart.markersOptions.styles);

        this.setClassesAndStyle(newDots, chart.cssClasses, vfIndex, chart.style.elementColors);
        MarkDot.tryMakeMarkDotVisible(newDots, chart.markersOptions, false);

        const animationName = 'data-updating';
        dots
            .interrupt(animationName)
            .transition(animationName)
            .duration(block.transitionManager.durations.chartUpdate)
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d));
    }

    public static updateColors(block: Block, chart: TwoDimensionalChartModel, valueFieldIndex: number): void {
        const dots = block.svg.getChartGroup(chart.index)
            .selectAll(`.${this.markerDotClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueFieldIndex}`);
        DomHelper.setChartElementColor(dots, chart.style.elementColors, valueFieldIndex, 'stroke');
    }

    public static getMarkDotForChart(block: Block, chartCssClasses: string[]): Selection<BaseType, MarkDotDataItem, BaseType, unknown> {
        return block.getSvg()
            .selectAll(`.${MarkDot.markerDotClass}${Helper.getCssClassesLine(chartCssClasses)}`);
    }

    public static tryMakeMarkDotVisible(elems: Selection<BaseType, MdtChartsDataRow, BaseType, unknown>, markersOptions: MarkersOptions, turnOnIfCan: boolean): void {
        elems.each(function (datum) {
            if (!markersOptions.show({ row: datum, valueFieldName: (datum as MarkDotDataItem).$mdtChartsMetadata?.valueFieldName }))
                MarkDot.toggleMarkDotVisible(select(this), turnOnIfCan);
        });
    }

    private static toggleMarkDotVisible(markDots: Selection<BaseType, any, BaseType, any>, isHighlight: boolean) {
        markDots.classed(MarkDot.hiddenDotClass, !isHighlight);
    }

    private static setClassesAndStyle(dots: Selection<SVGCircleElement, MarkDotDataItem, BaseType, any>, cssClasses: string[], vfIndex: number, elementColors: string[]): void {
        DomHelper.setCssClasses(dots, Helper.getCssClassesWithElementIndex(cssClasses, vfIndex));
        DomHelper.setChartElementColor(dots, elementColors, vfIndex, 'stroke');
    }

    private static setAttrs(block: Block, dots: Selection<SVGCircleElement, MarkDotDataItem, BaseType, any>, attrs: DotAttrs, styles: MarkersStyleOptions): void {
        dots
            .attr('class', this.markerDotClass)
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', styles.normal.size.radius)
            .style('stroke-width', styles.normal.size.borderSize)
            .style('fill', 'white')
            .style('clip-path', `url(#${block.svg.getClipPathId()})`);
    }
}