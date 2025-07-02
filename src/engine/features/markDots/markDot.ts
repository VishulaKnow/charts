import { select, Selection, BaseType } from "d3-selection";
import { transition } from "d3-transition";
import { MdtChartsDataRow } from "../../../config/config";
import {
	BlockMargin,
	MarkersOptions,
	MarkersStyleOptions,
	MarkersLikeElementsVisibilityFnOptions,
	Orient,
	TwoDimensionalChartModel
} from "../../../model/model";
import { Block } from "../../block/block";
import { DomSelectionHelper } from "../../helpers/domSelectionHelper";
import { Helper } from "../../helpers/helper";
import { NamesHelper } from "../../helpers/namesHelper";
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
	public static readonly markerDotClass = NamesHelper.getClassName("dot");
	public static readonly hiddenDotClass = NamesHelper.getClassName("dot-hidden");

	public static render(
		block: Block,
		data: MdtChartsDataRow[],
		keyAxisOrient: Orient,
		scales: Scales,
		margin: BlockMargin,
		keyFieldName: string,
		vfIndex: number,
		valueFieldName: string,
		chart: TwoDimensionalChartModel
	): void {
		const dotsWrapper = block.svg
			.getChartGroup(chart.index)
			.selectAll(`.${this.markerDotClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-index-${vfIndex}`)
			.data(data.map<MarkDotDataItem>((row) => ({ ...row, $mdtChartsMetadata: { valueFieldName } })))
			.enter();

		const attrs = MarkDotHelper.getDotAttrs(
			keyAxisOrient,
			scales,
			margin,
			keyFieldName,
			valueFieldName,
			chart.isSegmented
		);
		const dots = dotsWrapper.append("circle");
		this.setAttrs(block, dots, attrs, chart.markersOptions.styles);

		this.setClassesAndStyle(dots, chart.cssClasses, vfIndex, chart.style.elementColors);
		MarkDot.handleMarkDotVisibility(dots, chart.markersOptions, false);
	}

	public static update(
		block: Block,
		newData: MdtChartsDataRow[],
		keyAxisOrient: Orient,
		scales: Scales,
		margin: BlockMargin,
		keyFieldName: string,
		vfIndex: number,
		valueFieldName: string,
		chart: TwoDimensionalChartModel
	): void {
		const dots = block.svg
			.getChartGroup(chart.index)
			.selectAll(`.${this.markerDotClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${vfIndex}`)
			.data(newData.map<MarkDotDataItem>((row) => ({ ...row, $mdtChartsMetadata: { valueFieldName } })));
		dots.exit().remove();

		MarkDot.handleMarkDotVisibility(dots, chart.markersOptions);

		const attrs = MarkDotHelper.getDotAttrs(
			keyAxisOrient,
			scales,
			margin,
			keyFieldName,
			valueFieldName,
			chart.isSegmented
		);
		const newDots = dots.enter().append("circle");
		this.setAttrs(block, newDots, attrs, chart.markersOptions.styles);

		this.setClassesAndStyle(newDots, chart.cssClasses, vfIndex, chart.style.elementColors);
		MarkDot.handleMarkDotVisibility(newDots, chart.markersOptions, false);

		const animationName = "data-updating";
		dots.interrupt(animationName)
			.transition(animationName)
			.duration(block.transitionManager.durations.chartUpdate)
			.attr("cx", (d) => attrs.cx(d))
			.attr("cy", (d) => attrs.cy(d));
	}

	public static updateColors(block: Block, chart: TwoDimensionalChartModel, valueFieldIndex: number): void {
		const dots = block.svg
			.getChartGroup(chart.index)
			.selectAll(
				`.${this.markerDotClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueFieldIndex}`
			);
		DomSelectionHelper.setChartElementColor(dots, chart.style.elementColors, valueFieldIndex, "stroke");
	}

	public static getMarkDotForChart(
		block: Block,
		chartCssClasses: string[]
	): Selection<BaseType, MarkDotDataItem, BaseType, unknown> {
		return block.getSvg().selectAll(`.${MarkDot.markerDotClass}${Helper.getCssClassesLine(chartCssClasses)}`);
	}

	public static handleMarkDotVisibility(
		elems: Selection<BaseType, MdtChartsDataRow, BaseType, unknown>,
		markersOptions: MarkersOptions,
		turnOnIfCan?: boolean
	): void {
		elems.each(function (datum) {
			let visibility = turnOnIfCan;

			const checkOptions: MarkersLikeElementsVisibilityFnOptions = {
				row: datum,
				valueFieldName: (datum as MarkDotDataItem).$mdtChartsMetadata?.valueFieldName
			};

			if (markersOptions.shouldForceShow(checkOptions)) visibility = true;

			if (markersOptions.shouldForceHide(checkOptions)) visibility = false;

			if (visibility != null) MarkDot.toggleMarkDotVisible(select(this), visibility);
		});
	}

	private static toggleMarkDotVisible(markDots: Selection<BaseType, any, BaseType, any>, isVisible: boolean) {
		markDots.classed(MarkDot.hiddenDotClass, !isVisible);
	}

	private static setClassesAndStyle(
		dots: Selection<SVGCircleElement, MarkDotDataItem, BaseType, any>,
		cssClasses: string[],
		vfIndex: number,
		elementColors: string[]
	): void {
		DomSelectionHelper.setCssClasses(dots, Helper.getCssClassesWithElementIndex(cssClasses, vfIndex));
		DomSelectionHelper.setChartElementColor(dots, elementColors, vfIndex, "stroke");
	}

	private static setAttrs(
		block: Block,
		dots: Selection<SVGCircleElement, MarkDotDataItem, BaseType, any>,
		attrs: DotAttrs,
		styles: MarkersStyleOptions
	): void {
		dots.attr("class", this.markerDotClass)
			.attr("cx", (d) => attrs.cx(d))
			.attr("cy", (d) => attrs.cy(d))
			.attr("r", styles.normal.size.radius)
			.style("stroke-width", styles.normal.size.borderSize)
			.style("fill", "white")
			.style("clip-path", `url(#${block.svg.getClipPathId()})`);
	}
}
