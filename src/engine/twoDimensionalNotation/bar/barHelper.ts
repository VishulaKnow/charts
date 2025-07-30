import { AxisScale } from "d3-axis";
import {
	BandLikeChartSettingsStore,
	BarBorderRadius,
	BarChartSettings,
	BlockMargin,
	Orient,
	TwoDimensionalChartModel
} from "../../../model/model";
import { Scale, Scales } from "../../features/scale/scale";
import { Helper } from "../../helpers/helper";
import { MdtChartsDataRow } from "../../../config/config";
import { Pipeline } from "../../helpers/pipeline/Pipeline";
import { BaseType, Selection } from "d3-selection";
import { HatchPatternDef } from "../../block/defs/hatchPattern";

export interface BarAttrsHelper {
	x: (dataRow: MdtChartsDataRow) => number;
	y: (dataRow: MdtChartsDataRow) => number;
	width: (dataRow: MdtChartsDataRow) => number;
	height: (dataRow: MdtChartsDataRow) => number;
}

export interface GroupBarsSegment {
	segmentIndex: number;
	chart: TwoDimensionalChartModel;
}

export class BarHelper {
	public static getGroupedBarAttrs(
		keyAxisOrient: Orient,
		scales: Scales,
		margin: BlockMargin,
		keyField: string,
		valueFieldName: string,
		barIndex: number,
		settingsStore: BandLikeChartSettingsStore
	): BarAttrsHelper {
		const attrs: BarAttrsHelper = {
			x: null,
			y: null,
			width: null,
			height: null
		};

		this.setBarAttrsByKey(attrs, keyAxisOrient, scales.key, margin, keyField, barIndex, settingsStore, false);
		this.setGroupedBarAttrsByValue(attrs, keyAxisOrient, margin, scales.value, valueFieldName);

		return attrs;
	}

	public static getStackedBarAttr(
		keyAxisOrient: Orient,
		scales: Scales,
		margin: BlockMargin,
		keyField: string,
		barIndex: number,
		settingsStore: BandLikeChartSettingsStore
	): BarAttrsHelper {
		const attrs: BarAttrsHelper = {
			x: null,
			y: null,
			width: null,
			height: null
		};

		this.setBarAttrsByKey(attrs, keyAxisOrient, scales.key, margin, keyField, barIndex, settingsStore, true);
		this.setSegmentedBarAttrsByValue(attrs, keyAxisOrient, scales.value, margin);

		return attrs;
	}

	static setBarAttrsByKey(
		attrs: BarAttrsHelper,
		keyAxisOrient: Orient,
		scaleKey: AxisScale<any>,
		margin: BlockMargin,
		keyField: string,
		barIndex: number,
		settingsStore: BandLikeChartSettingsStore,
		isSegmented: boolean
	): void {
		if (keyAxisOrient === "top" || keyAxisOrient === "bottom") {
			attrs.x = (d) =>
				scaleKey(Helper.getKeyFieldValue(d, keyField, isSegmented)) +
				margin.left +
				settingsStore.getBandItemPad(barIndex);
			attrs.width = (d) => settingsStore.getBandSubItemSize();
		}
		if (keyAxisOrient === "left" || keyAxisOrient === "right") {
			attrs.y = (d) =>
				scaleKey(Helper.getKeyFieldValue(d, keyField, isSegmented)) +
				margin.top +
				settingsStore.getBandItemPad(barIndex);
			attrs.height = (d) => settingsStore.getBandSubItemSize();
		}
	}

	private static setGroupedBarAttrsByValue(
		attrs: BarAttrsHelper,
		keyAxisOrient: Orient,
		margin: BlockMargin,
		scaleValue: AxisScale<any>,
		valueFieldName: string
	): void {
		this.setGroupedBandStartCoordinateAttr(attrs, keyAxisOrient, scaleValue, margin, valueFieldName);

		if (keyAxisOrient === "top" || keyAxisOrient === "bottom") {
			attrs.height = this.getBandItemValueStretch(scaleValue, valueFieldName);
		}
		if (keyAxisOrient === "left" || keyAxisOrient === "right") {
			attrs.width = this.getBandItemValueStretch(scaleValue, valueFieldName);
		}
	}

	static getBandItemValueStretch(
		scaleValue: AxisScale<any>,
		valueFieldName: string
	): (dataRow: MdtChartsDataRow) => number {
		return (d) => Math.abs(scaleValue(d[valueFieldName]) - scaleValue(0));
	}

	static setGroupedBandStartCoordinateAttr(
		attrs: BarAttrsHelper,
		keyAxisOrient: Orient,
		scaleValue: AxisScale<any>,
		margin: BlockMargin,
		valueFieldName: string
	) {
		if (keyAxisOrient === "top") {
			attrs.y = (d) => scaleValue(Math.min(d[valueFieldName], 0)) + margin.top;
		}
		if (keyAxisOrient === "bottom") {
			attrs.y = (d) => scaleValue(Math.max(d[valueFieldName], 0)) + margin.top;
		}
		if (keyAxisOrient === "left") {
			attrs.x = (d) => scaleValue(Math.min(d[valueFieldName], 0)) + margin.left;
		}
		if (keyAxisOrient === "right") {
			attrs.x = (d) => scaleValue(Math.max(d[valueFieldName], 0)) + margin.left;
		}
	}

	private static setSegmentedBarAttrsByValue(
		attrs: BarAttrsHelper,
		keyAxisOrient: Orient,
		scaleValue: AxisScale<number>,
		margin: BlockMargin
	): void {
		if (keyAxisOrient === "top") {
			attrs.y = (d) => scaleValue(Math.min(d[1], d[0])) + margin.top;
			attrs.height = (d) => Math.abs(scaleValue(d[1]) - scaleValue(d[0]));
		}
		if (keyAxisOrient === "bottom") {
			attrs.y = (d) => scaleValue(Math.max(d[1], d[0])) + margin.top;
			attrs.height = (d) => Math.abs(scaleValue(d[1]) - scaleValue(d[0]));
		}
		if (keyAxisOrient === "left") {
			attrs.x = (d) => scaleValue(Math.min(d[1], d[0])) + margin.left;
			attrs.width = (d) => Math.abs(scaleValue(d[1]) - scaleValue(d[0]));
		}
		if (keyAxisOrient === "right") {
			attrs.x = (d) => scaleValue(Math.max(d[1], d[0])) + margin.left;
			attrs.width = (d) => Math.abs(scaleValue(d[1]) - scaleValue(d[0]));
		}
	}
}

export function onBarChartInit(
	createBarPipeline: Pipeline<Selection<SVGRectElement, any, BaseType, any>, TwoDimensionalChartModel>,
	createSegmentGroupBarsPipeline: Pipeline<Selection<SVGRectElement, any, BaseType, any>, GroupBarsSegment>
) {
	createBarPipeline.push(hatchBar);
	createBarPipeline.push(roundGroupedBars);

	createSegmentGroupBarsPipeline.push(roundSegmentedBars);
}

function roundSegmentedBars(
	bars: Selection<SVGRectElement, any, BaseType, any>,
	segment: GroupBarsSegment
): Selection<SVGRectElement, any, BaseType, any> {
	const radiusValues = segment.chart.barViewOptions.borderRadius.segmented.handle(segment.segmentIndex);

	return bars.style("clip-path", getClipPathValue(radiusValues));
}

function roundGroupedBars(
	bars: Selection<SVGRectElement, any, BaseType, any>,
	chart: TwoDimensionalChartModel
): Selection<SVGRectElement, any, BaseType, any> {
	return bars.style("clip-path", getClipPathValue(chart.barViewOptions.borderRadius.grouped));
}

export function getClipPathValue({ topLeft, topRight, bottomLeft, bottomRight }: BarBorderRadius): string {
	return `inset(0px round ${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px)`;
}

function hatchBar(bars: Selection<SVGRectElement, any, BaseType, any>, chart: TwoDimensionalChartModel) {
	if (chart.barViewOptions.hatch.on) bars.style("mask", HatchPatternDef.getMaskValue());
	return bars;
}
