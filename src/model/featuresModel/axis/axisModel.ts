import {
	ItemPositionByOrientation,
	ChartOrientation,
	MdtChartsDataSource,
	NumberAxisOptions,
	AxisLabelPosition,
	MdtChartsTwoDimensionalOptions,
	DiscreteAxisOptions,
	NumberSecondaryAxisOptions,
	AxisLabelFormatter
} from "../../../config/config";
import {
	AxisModelOptions,
	DiscreteAxisModelOptions,
	Orient,
	ScaleValueModel,
	TickAmountPolicy,
	TranslateModel
} from "../../model";
import { ModelHelper } from "../../helpers/modelHelper";
import { AxisType } from "../../modelBuilder";
import { DataManagerModel } from "../../dataManagerModel/dataManagerModel";
import { TwoDimensionalModel } from "../../notations/twoDimensionalModel";
import { AxisLabelCanvas, TooltipSettings } from "../../../designer/designerConfig";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { AxisModelService, AxisModelTickCalculator, showAllTicks } from "./axisModelService";

export interface LabelSize {
	width: number;
	height: number;
}

export const MINIMAL_VERTICAL_STEP_SIZE = 60;
export const MINIMAL_HORIZONTAL_STEP_SIZE = 100;

export const LABEL_ELEMENT_HEIGHT_PX = 14;

const DEFAULT_AXIS_LINE_VISIBLE = true;

export class AxisModel {
	private static service = new AxisModelService();

	public static getKeyAxis(
		options: MdtChartsTwoDimensionalOptions,
		data: MdtChartsDataSource,
		labelConfig: AxisLabelCanvas,
		canvasModel: CanvasModel,
		tooltipSettings: TooltipSettings,
		getZeroCoordinate?: () => number
	): DiscreteAxisModelOptions {
		const { charts, orientation, data: dataOptions } = options;
		const axisConfig = options.axis.key;

		const translate: TranslateModel = this.getKeyAxisTranslateModel(
			orientation,
			axisConfig.position,
			canvasModel,
			getZeroCoordinate
		);
		const tickCalculator = new AxisModelTickCalculator(
			data[dataOptions.dataSource],
			options.axis.key.labels?.showRule
		);

		return {
			type: "key",
			orient: AxisModel.getAxisOrient(AxisType.Key, orientation, axisConfig.position),
			translate,
			cssClass: "key-axis",
			ticks: axisConfig.ticks,
			labels: {
				maxSize: AxisModel.getLabelSize(
					labelConfig.maxSize.main,
					data[dataOptions.dataSource].map((d) => d[dataOptions.keyField.name])
				).width,
				position: AxisModel.getKeyAxisLabelPosition(
					canvasModel,
					DataManagerModel.getDataValuesByKeyField(data, dataOptions.dataSource, dataOptions.keyField.name)
						.length,
					axisConfig
				),
				visible: !TwoDimensionalModel.getChartsEmbeddedLabelsFlag(charts, orientation),
				defaultTooltip: tooltipSettings.position === "fixed",
				showTick: tickCalculator.createFunctionCalculator(this.getAxisLength(orientation, canvasModel)),
				linearTickStep: MINIMAL_HORIZONTAL_STEP_SIZE,
				tickAmountSettings: {
					policy: { type: "auto" }
				},
				format: (options) => {
					const dataRow = data[dataOptions.dataSource].find(
						(d) => d[dataOptions.keyField.name] === options.key
					);
					if (dataRow && axisConfig.labels?.format)
						return axisConfig.labels.format({ key: options.key, dataRow });
					return options.key;
				}
			},
			visibility: axisConfig.visibility,
			line: {
				visible: axisConfig.line?.visible ?? DEFAULT_AXIS_LINE_VISIBLE
			},
			browserTooltip: {
				format: (value) => value
			}
		};
	}

	public static getMainValueAxis(
		defaultFormatter: AxisLabelFormatter,
		orient: ChartOrientation,
		position: ItemPositionByOrientation,
		axisConfig: NumberAxisOptions,
		labelConfig: AxisLabelCanvas,
		canvasModel: CanvasModel,
		scaleInfo: ScaleValueModel
	): AxisModelOptions {
		return this.getValueAxis(
			defaultFormatter,
			orient,
			position,
			"value-axis",
			axisConfig,
			labelConfig,
			canvasModel,
			scaleInfo
		);
	}

	public static getSecondaryValueAxis(
		defaultFormatter: AxisLabelFormatter,
		orient: ChartOrientation,
		mainAxisPosition: ItemPositionByOrientation,
		axisConfig: NumberSecondaryAxisOptions,
		labelConfig: AxisLabelCanvas,
		canvasModel: CanvasModel,
		scaleInfo: ScaleValueModel
	): AxisModelOptions {
		return this.getValueAxis(
			defaultFormatter,
			orient,
			mainAxisPosition === "start" ? "end" : "start",
			"value-secondary-axis",
			axisConfig,
			labelConfig,
			canvasModel,
			scaleInfo
		);
	}

	private static getValueAxis(
		defaultFormatter: AxisLabelFormatter,
		orient: ChartOrientation,
		position: ItemPositionByOrientation,
		cssClass: string,
		axisConfig: NumberAxisOptions | NumberSecondaryAxisOptions,
		labelConfig: AxisLabelCanvas,
		canvasModel: CanvasModel,
		scaleInfo: ScaleValueModel
	): AxisModelOptions {
		return {
			type: "value",
			orient: AxisModel.getAxisOrient(AxisType.Value, orient, position),
			translate: {
				translateX: AxisModel.getAxisTranslateX(AxisType.Value, orient, position, canvasModel),
				translateY: AxisModel.getAxisTranslateY(AxisType.Value, orient, position, canvasModel)
			},
			cssClass,
			ticks: axisConfig.ticks,
			labels: {
				maxSize: labelConfig.maxSize.main,
				position: "straight",
				visible: true,
				defaultTooltip: true,
				showTick: showAllTicks,
				linearTickStep: this.getTickStep(orient, axisConfig),
				tickAmountSettings: {
					policy: this.getTickAmountPolicy(orient, axisConfig, scaleInfo)
				}
			},
			visibility: axisConfig.visibility,
			line: {
				visible: axisConfig.line?.visible ?? DEFAULT_AXIS_LINE_VISIBLE
			},
			browserTooltip: {
				format: (value) => defaultFormatter(value)
			}
		};
	}

	public static getAxisLength(chartOrientation: ChartOrientation, canvasModel: CanvasModel): number {
		if (chartOrientation === "horizontal") {
			return canvasModel.getChartBlockHeight();
		} else {
			return canvasModel.getChartBlockWidth();
		}
	}

	public static getAxisOrient(
		axisType: AxisType,
		chartOrientation: ChartOrientation,
		axisPosition: ItemPositionByOrientation
	): Orient {
		if (chartOrientation === "vertical") {
			if (axisPosition === "start") return axisType === AxisType.Key ? "top" : "left";
			return axisType === AxisType.Key ? "bottom" : "right";
		}
		if (axisPosition === "start") return axisType === AxisType.Key ? "left" : "top";
		return axisType === AxisType.Key ? "right" : "bottom";
	}

	public static getAxisTranslateX(
		axisType: AxisType,
		chartOrientation: ChartOrientation,
		axisPosition: ItemPositionByOrientation,
		canvasModel: CanvasModel
	): number {
		const orient = AxisModel.getAxisOrient(axisType, chartOrientation, axisPosition);
		if (orient === "top" || orient === "left") return canvasModel.getMarginSide("left");
		else if (orient === "bottom") return canvasModel.getMarginSide("left");
		return canvasModel.getBlockSize().width - canvasModel.getMarginSide("right");
	}

	public static getAxisTranslateY(
		axisType: AxisType,
		chartOrientation: ChartOrientation,
		axisPosition: ItemPositionByOrientation,
		canvasModel: CanvasModel
	): number {
		const orient = AxisModel.getAxisOrient(axisType, chartOrientation, axisPosition);
		if (orient === "top" || orient === "left") return canvasModel.getMarginSide("top");
		else if (orient === "bottom") return canvasModel.getBlockSize().height - canvasModel.getMarginSide("bottom");
		return canvasModel.getMarginSide("top");
	}

	public static getKeyAxisLabelPosition(
		canvasModel: CanvasModel,
		scopedDataLength: number,
		axisConfig?: DiscreteAxisOptions
	): AxisLabelPosition {
		return this.service.getKeyAxisLabelPosition(
			canvasModel.getChartBlockWidth(),
			scopedDataLength,
			axisConfig?.labels?.position
		);
	}

	public static getLabelSize(labelMaxWidth: number, labelTexts: (string | number)[]): LabelSize {
		const ONE_UPPER_SYMBOL_WIDTH_PX = 8;
		const longestLabelLength = labelTexts.length
			? Math.max(...labelTexts.map((t) => ModelHelper.getStringScore(t?.toString() ?? "")))
			: 0;
		const longestLabelWidth = Math.round(ONE_UPPER_SYMBOL_WIDTH_PX * longestLabelLength);
		return {
			height: LABEL_ELEMENT_HEIGHT_PX,
			width: longestLabelWidth > labelMaxWidth ? labelMaxWidth : longestLabelWidth
		};
	}

	public static getRoundValue(value: number): number {
		const absValue = Math.abs(value);
		const sign = Math.sign(value);

		if (absValue < 10) return value;

		if (absValue < 100) return sign * Math.floor(absValue / 10) * 10;

		const valueStr = absValue.toString();
		const firstTwoDigits = Math.floor(absValue / Math.pow(10, valueStr.length - 2));
		const roundedFirstTwoDigits = firstTwoDigits < 10 ? firstTwoDigits : Math.floor(firstTwoDigits / 5) * 5;

		const roundedNumber = roundedFirstTwoDigits * Math.pow(10, valueStr.length - 2);

		return sign * roundedNumber;
	}

	static getTickAmountPolicy(
		orient: ChartOrientation,
		axisConfig: NumberAxisOptions | NumberSecondaryAxisOptions,
		scaleInfo: ScaleValueModel
	): TickAmountPolicy {
		const axisLength = scaleInfo.range.end - scaleInfo.range.start;
		const linearTickStep = this.getTickStep(orient, axisConfig);

		let tickAmountPolicy: TickAmountPolicy;
		if (Math.floor(axisLength / linearTickStep) > 2) {
			tickAmountPolicy = { type: "amount", amount: Math.floor(axisLength / linearTickStep) };
		} else {
			const roundedMaxValue = this.getRoundValue(Math.max(...scaleInfo.domain));
			tickAmountPolicy = { type: "constant", values: [Math.min(...scaleInfo.domain), roundedMaxValue] };
		}

		return tickAmountPolicy;
	}

	private static getKeyAxisTranslateModel(
		chartOrientation: ChartOrientation,
		axisPosition: ItemPositionByOrientation,
		canvasModel: CanvasModel,
		getZeroCoordinate?: () => number
	) {
		let translateY;
		let translateX;

		if (chartOrientation === "vertical") {
			translateY = getZeroCoordinate
				? getZeroCoordinate() + canvasModel.getMarginSide("top")
				: AxisModel.getAxisTranslateY(AxisType.Key, chartOrientation, axisPosition, canvasModel);
			translateX = AxisModel.getAxisTranslateX(AxisType.Key, chartOrientation, axisPosition, canvasModel);
		} else {
			translateX = getZeroCoordinate
				? getZeroCoordinate() + canvasModel.getMarginSide("left")
				: AxisModel.getAxisTranslateX(AxisType.Key, chartOrientation, axisPosition, canvasModel);
			translateY = AxisModel.getAxisTranslateY(AxisType.Key, chartOrientation, axisPosition, canvasModel);
		}

		return {
			translateX,
			translateY
		};
	}

	private static getTickStep(
		orient: ChartOrientation,
		axisConfig: NumberAxisOptions | NumberSecondaryAxisOptions
	): number {
		return (
			axisConfig.labels?.stepSize ??
			(orient === "horizontal" ? MINIMAL_HORIZONTAL_STEP_SIZE : MINIMAL_VERTICAL_STEP_SIZE)
		);
	}
}
