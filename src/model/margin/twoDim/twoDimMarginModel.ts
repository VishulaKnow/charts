import { DesignerConfig } from "../../../designer/designerConfig";
import { AxisModel, LABEL_ELEMENT_HEIGHT_PX, LabelSize } from "../../featuresModel/axis/axisModel";
import { TwoDimLegendModel } from "../../featuresModel/legendModel/twoDimLegendModel";
import { keyAxisLabelHorizontalLog, keyAxisLabelVerticalLog } from "../../featuresModel/scaleModel/scaleAxisRecalcer";
import { Orient, OtherCommonComponents, ScaleValueModel } from "../../model";
import { AxisType } from "../../modelBuilder";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { TwoDimConfigReader } from "../../modelInstance/configReader/twoDimConfigReader/twoDimConfigReader";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { TwoDimensionalModel } from "../../notations/twoDimensionalModel";
import { ChartOrientation } from "../../../config/config";
import { VALUE_LABEL_OFFSET_ABS_SIZE_PX } from "../../featuresModel/valueLabelsModel/valueLabelsModel";
import { ScaleModel } from "../../featuresModel/scaleModel/scaleModel";
import { Scale } from "../../../engine/features/scale/scale";

export const AXIS_HORIZONTAL_LABEL_PADDING = 12;
export const AXIS_VERTICAL_LABEL_PADDING = 8;

export class TwoDimMarginModel {
	private twoDimLegendModel = new TwoDimLegendModel(this.configReader);

	constructor(private designerConfig: DesignerConfig, private configReader: TwoDimConfigReader) {}

	recalcMargin(otherComponents: OtherCommonComponents, modelInstance: ModelInstance) {
		const canvasModel = modelInstance.canvasModel;

		this.twoDimLegendModel.recalcMarginWith2DLegend(
			modelInstance,
			otherComponents.legendBlock,
			this.configReader.options.legend
		);
		this.recalcVerticalMarginByAxisLabelHeight(LABEL_ELEMENT_HEIGHT_PX, canvasModel);
		const labelSize = this.getMaxLabelSize(modelInstance);

		// Если встроенный лейбл показывает ключи, то лейблы оси ключей не показываются
		// При этом все графики должны иметь: embeddedLabels = 'key'
		// И все графики должны быть типа bar.
		const showingFlag =
			this.configReader.options.type === "2d"
				? !TwoDimensionalModel.getChartsEmbeddedLabelsFlag(
						this.configReader.options.charts,
						this.configReader.options.orientation
				  )
				: true;

		this.recalcHorizontalMarginByAxisLabelWidth(labelSize, canvasModel, showingFlag);

		if (this.configReader.containsSecondaryAxis()) {
			const secondaryLabelSize = this.getMaxLabelSizeSecondary(modelInstance);
			this.recalcMarginBySecondaryAxisLabelSize(secondaryLabelSize, canvasModel);
		}
		if (
			this.configReader.areValueLabelsOn() &&
			this.configReader.areValueLabelsNeedIncreaseMargin() &&
			this.configReader.options.orientation === "vertical"
		) {
			this.recalcVerticalMarginWithValueLabelsOn(canvasModel);
		}

		const groupingSlices = this.configReader.grouping.getSlicesSizesByOrients(
			modelInstance.dataModel.repository.getRawRows()
		);
		groupingSlices.forEach((slice) => canvasModel.increaseMarginSide(slice.orient, slice.size));
	}

	public recalcMarginByVerticalAxisLabel(modelInstance: ModelInstance): void {
		if (this.configReader.options.orientation === "vertical") {
			const dataModel = modelInstance.dataModel;

			const allowableKeys = dataModel.repository
				.getScopedRows()
				.map((d) => d[this.configReader.options.data.keyField.name]);

			const axisLabelSize = AxisModel.getLabelSize(
				this.designerConfig.canvas.axisLabel.maxSize.main,
				allowableKeys
			);
			const axisConfig = AxisModel.getKeyAxisLabelPosition(
				modelInstance.canvasModel,
				allowableKeys.length,
				this.configReader.options.axis.key
			);

			const marginOrient = this.configReader.options.axis.key.position === "end" ? "bottom" : "top";

			if (axisConfig === "rotated") {
				modelInstance.canvasModel.decreaseMarginSide(marginOrient, axisLabelSize.height);
				modelInstance.canvasModel.increaseMarginSide(
					marginOrient,
					axisLabelSize.width,
					keyAxisLabelVerticalLog
				);
			}
		}
	}

	private getMaxLabelSize(modelInstance: ModelInstance): LabelSize {
		const keyAxisOrient = AxisModel.getAxisOrient(
			AxisType.Key,
			this.configReader.options.orientation,
			this.configReader.options.axis.key.position
		);
		let labelsTexts: string[];

		if (keyAxisOrient === "left" || keyAxisOrient === "right") {
			labelsTexts = modelInstance.dataModel.repository.getValuesByKeyField();
		} else {
			const scaleModel = new ScaleModel(
				this.configReader.options,
				modelInstance.canvasModel,
				this.designerConfig.canvas.chartOptions.bar
			).getScaleLinear(modelInstance.dataModel.repository.getRawRows(), this.configReader);
			labelsTexts = this.getValueAxisLabels(scaleModel).map((v) =>
				this.configReader.getAxisLabelFormatter()(v).toString()
			);
		}

		return AxisModel.getLabelSize(this.designerConfig.canvas.axisLabel.maxSize.main, labelsTexts);
	}

	private getMaxLabelSizeSecondary(modelInstance: ModelInstance): LabelSize {
		const scaleModel = new ScaleModel(
			this.configReader.options,
			modelInstance.canvasModel,
			this.designerConfig.canvas.chartOptions.bar
		).getScaleSecondaryLinear(modelInstance.dataModel.repository.getRawRows(), this.configReader);
		const labelsTexts = this.getValueAxisLabels(scaleModel).map((v) =>
			this.configReader.getSecondaryAxisLabelFormatter()(v).toString()
		);

		return AxisModel.getLabelSize(this.designerConfig.canvas.axisLabel.maxSize.main, labelsTexts);
	}

	private recalcVerticalMarginByAxisLabelHeight(labelHeight: number, canvasModel: CanvasModel): void {
		const keyAxisOrient = AxisModel.getAxisOrient(
			AxisType.Key,
			this.configReader.options.orientation,
			this.configReader.options.axis.key.position
		);
		const valueAxisOrient = AxisModel.getAxisOrient(
			AxisType.Value,
			this.configReader.options.orientation,
			this.configReader.options.axis.value.position
		);

		if ((keyAxisOrient === "bottom" || keyAxisOrient === "top") && this.configReader.options.axis.key.visibility)
			canvasModel.increaseMarginSide(
				keyAxisOrient,
				labelHeight + AXIS_HORIZONTAL_LABEL_PADDING,
				keyAxisLabelVerticalLog
			);
		else if (this.configReader.options.axis.value.visibility)
			canvasModel.increaseMarginSide(valueAxisOrient, labelHeight + AXIS_HORIZONTAL_LABEL_PADDING);
	}

	private recalcHorizontalMarginByAxisLabelWidth(
		labelSize: LabelSize,
		canvasModel: CanvasModel,
		isShow: boolean
	): void {
		const keyAxisOrient = AxisModel.getAxisOrient(
			AxisType.Key,
			this.configReader.options.orientation,
			this.configReader.options.axis.key.position
		);
		const valueAxisOrient = AxisModel.getAxisOrient(
			AxisType.Value,
			this.configReader.options.orientation,
			this.configReader.options.axis.value.position
		);

		if (
			(keyAxisOrient === "left" || keyAxisOrient === "right") &&
			isShow &&
			this.configReader.options.axis.key.visibility
		) {
			canvasModel.increaseMarginSide(
				keyAxisOrient,
				labelSize.width + AXIS_VERTICAL_LABEL_PADDING,
				keyAxisLabelHorizontalLog
			);
		} else if (
			(valueAxisOrient === "left" || valueAxisOrient === "right") &&
			this.configReader.options.axis.value.visibility
		) {
			canvasModel.increaseMarginSide(valueAxisOrient, labelSize.width + AXIS_VERTICAL_LABEL_PADDING);
		}
	}

	private recalcMarginBySecondaryAxisLabelSize(labelSize: LabelSize, canvasModel: CanvasModel) {
		const valueAxisOrient = AxisModel.getAxisOrient(
			AxisType.Value,
			this.configReader.options.orientation,
			this.configReader.options.axis.value.position
		);
		const secondaryOrientByMain: Record<Orient, Orient> = {
			bottom: "top",
			left: "right",
			right: "left",
			top: "bottom"
		};
		const secondaryOrient = secondaryOrientByMain[valueAxisOrient];

		const sizeMap: Record<ChartOrientation, number> = {
			vertical: labelSize.width + AXIS_VERTICAL_LABEL_PADDING,
			horizontal: labelSize.height + AXIS_HORIZONTAL_LABEL_PADDING
		};

		if (this.configReader.options.axis.valueSecondary?.visibility) {
			canvasModel.increaseMarginSide(secondaryOrient, sizeMap[this.configReader.options.orientation]);
		}
	}

	private recalcVerticalMarginWithValueLabelsOn(canvasModel: CanvasModel) {
		const keyAxisOrient = AxisModel.getAxisOrient(
			AxisType.Key,
			this.configReader.options.orientation,
			this.configReader.options.axis.key.position
		);
		const valueLabelFontSize = this.configReader.getValueLabelsStyleModel().fontSize;
		const axisMarginMapping: Partial<Record<Orient, Orient>> = {
			top: "bottom",
			bottom: "top"
		};

		canvasModel.increaseMarginSide(
			axisMarginMapping[keyAxisOrient]!,
			//TODO: calculate according to offsetSize from config for each chart
			valueLabelFontSize + VALUE_LABEL_OFFSET_ABS_SIZE_PX
		);
	}

	private getValueAxisLabels(scaleModel: ScaleValueModel) {
		const scale = Scale.getScaleValue(scaleModel);
		const ticksPolicy = AxisModel.getTickAmountPolicy(
			this.configReader.options.orientation,
			this.configReader.options.axis.value,
			scaleModel
		);

		let outputValues: number[] = [];
		if (ticksPolicy.type === "constant") outputValues = ticksPolicy.values;
		else if (ticksPolicy.type === "amount") outputValues = scale.ticks(ticksPolicy.amount);

		return outputValues;
	}
}
