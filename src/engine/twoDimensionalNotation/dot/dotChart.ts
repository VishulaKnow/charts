import { MdtChartsDataRow, MdtChartsValueField } from "../../../config/config";
import { BarChartSettings, BlockMargin, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Scale, Scales } from "../../features/scale/scale";
import { DomSelectionHelper } from "../../helpers/domHelper";
import { Helper } from "../../helpers/helper";
import { NamesHelper } from "../../helpers/namesHelper";
import { BarHelper, DotChartSettingsStore } from "../bar/barHelper";

export interface CanvasDotChartOptions {
	elementAccessors: {
		getBlock: () => Block;
	};
	dataOptions: {
		keyFieldName: string;
	};
	canvas: {
		keyAxisOrient: Orient;
	};
	bandOptions: {
		settings: BarChartSettings;
	};
}

export interface DotItemAttrGetters {
	x1: (dataRow: MdtChartsDataRow) => number;
	y1: (dataRow: MdtChartsDataRow) => number;
	x2: (dataRow: MdtChartsDataRow) => number;
	y2: (dataRow: MdtChartsDataRow) => number;
}

/**
 * @alpha experimental feature. Need to refactor.
 */
export class CanvasDotChart {
	private readonly dotChartItemClass = NamesHelper.getClassName("dot-chart-item");

	private renderedChart: TwoDimensionalChartModel | undefined = undefined;

	constructor(private readonly options: CanvasDotChartOptions) {}

	render(scales: Scales, chart: TwoDimensionalChartModel, records: MdtChartsDataRow[], margin: BlockMargin) {
		if (this.renderedChart) return;

		const valueFieldIndex = 0;

		const elements = this.options.elementAccessors
			.getBlock()
			.svg.getChartGroup(chart.index)
			.selectAll(
				`.${this.dotChartItemClass}${Helper.getCssClassesLine(chart.cssClasses)}${Helper.getCssClassesLine(
					Helper.getCssClassesWithElementIndex(chart.cssClasses, valueFieldIndex)
				)}`
			)
			.data(records)
			.enter()
			.append("line")
			.style("stroke-width", chart.dotViewOptions.shape.width)
			.attr("class", this.dotChartItemClass);

		const attrs = this.getAttrs(scales, chart, chart.data.valueFields[0], margin);

		elements
			.attr("x1", (d) => attrs.x1(d))
			.attr("y1", (d) => attrs.y1(d))
			.attr("x2", (d) => attrs.x2(d))
			.attr("y2", (d) => attrs.y2(d));

		DomSelectionHelper.setCssClasses(
			elements,
			Helper.getCssClassesWithElementIndex(chart.cssClasses, valueFieldIndex)
		);
		DomSelectionHelper.setChartStyle(elements, chart.style, valueFieldIndex, "stroke");

		this.renderedChart = chart;
	}

	update(scales: Scales, newRecords: MdtChartsDataRow[], margin: BlockMargin): Promise<void>[] {
		if (!this.renderedChart) return;

		const valueFieldIndex = 0;

		const elements = this.options.elementAccessors
			.getBlock()
			.svg.getChartGroup(this.renderedChart.index)
			.selectAll(
				`.${this.dotChartItemClass}${Helper.getCssClassesLine(
					this.renderedChart.cssClasses
				)}${Helper.getCssClassesLine(
					Helper.getCssClassesWithElementIndex(this.renderedChart.cssClasses, valueFieldIndex)
				)}`
			)
			.data(newRecords);

		elements.exit().remove();

		const newElements = elements
			.enter()
			.append("line")
			.style("stroke-width", this.renderedChart.dotViewOptions.shape.width)
			.attr("class", this.dotChartItemClass);

		const attrs = this.getAttrs(scales, this.renderedChart, this.renderedChart.data.valueFields[0], margin);

		newElements
			.attr("x1", (d) => attrs.x1(d))
			.attr("y1", (d) => attrs.y1(d))
			.attr("x2", (d) => attrs.x2(d))
			.attr("y2", (d) => attrs.y2(d));

		DomSelectionHelper.setCssClasses(
			newElements,
			Helper.getCssClassesWithElementIndex(this.renderedChart.cssClasses, valueFieldIndex)
		);
		DomSelectionHelper.setChartStyle(newElements, this.renderedChart.style, valueFieldIndex, "stroke");

		return [
			new Promise((resolve) => {
				elements
					.interrupt()
					.transition()
					.duration(this.options.elementAccessors.getBlock().transitionManager.durations.chartUpdate)
					.attr("x1", (d) => attrs.x1(d))
					.attr("y1", (d) => attrs.y1(d))
					.attr("x2", (d) => attrs.x2(d))
					.attr("y2", (d) => attrs.y2(d))
					.on("end", () => resolve());
			})
		];
	}

	private getAttrs(
		scales: Scales,
		chart: TwoDimensionalChartModel,
		field: MdtChartsValueField,
		margin: BlockMargin
	): DotItemAttrGetters {
		const attrs: DotItemAttrGetters = {
			x1: null,
			y1: null,
			x2: null,
			y2: null
		};

		const settingsStore = new DotChartSettingsStore({ scaleBandWidth: Scale.getScaleBandWidth(scales.key) });

		// TODO: refactor

		if (this.options.canvas.keyAxisOrient === "top" || this.options.canvas.keyAxisOrient === "bottom") {
			const handleBase: (dataRow: MdtChartsDataRow) => number = (d) =>
				scales.key(Helper.getKeyFieldValue(d, this.options.dataOptions.keyFieldName, false)) +
				margin.left +
				settingsStore.getBandItemPad();

			attrs.x1 = (d) => chart.dotViewOptions.shape.handleStartCoordinate(handleBase(d));
			attrs.x2 = (d) =>
				chart.dotViewOptions.shape.handleEndCoordinate(handleBase(d) + settingsStore.getBandItemSize());
		}
		if (this.options.canvas.keyAxisOrient === "left" || this.options.canvas.keyAxisOrient === "right") {
			const handleBase: (dataRow: MdtChartsDataRow) => number = (d) =>
				scales.key(Helper.getKeyFieldValue(d, this.options.dataOptions.keyFieldName, false)) +
				margin.top +
				settingsStore.getBandItemPad();

			attrs.y1 = (d) => chart.dotViewOptions.shape.handleStartCoordinate(handleBase(d));
			attrs.y2 = (d) =>
				chart.dotViewOptions.shape.handleEndCoordinate(handleBase(d) + settingsStore.getBandItemSize());
		}

		if (this.options.canvas.keyAxisOrient === "top") {
			attrs.y1 = (d) =>
				scales.value(Math.min(d[field.name], 0)) +
				margin.top +
				BarHelper.getBandItemValueStretch(scales.value, field.name)(d);
			attrs.y2 = (d) =>
				scales.value(Math.min(d[field.name], 0)) +
				margin.top +
				BarHelper.getBandItemValueStretch(scales.value, field.name)(d);
		}
		if (this.options.canvas.keyAxisOrient === "bottom") {
			attrs.y1 = (d) => scales.value(Math.max(d[field.name], 0)) + margin.top;
			attrs.y2 = (d) => scales.value(Math.max(d[field.name], 0)) + margin.top;
		}
		if (this.options.canvas.keyAxisOrient === "left") {
			attrs.x1 = (d) =>
				scales.value(Math.min(d[field.name], 0)) +
				margin.left +
				BarHelper.getBandItemValueStretch(scales.value, field.name)(d);
			attrs.x2 = (d) =>
				scales.value(Math.min(d[field.name], 0)) +
				margin.left +
				BarHelper.getBandItemValueStretch(scales.value, field.name)(d);
		}
		if (this.options.canvas.keyAxisOrient === "right") {
			attrs.x1 = (d) => scales.value(Math.max(d[field.name], 0)) + margin.left;
			attrs.x2 = (d) => scales.value(Math.max(d[field.name], 0)) + margin.left;
		}

		return attrs;
	}
}
