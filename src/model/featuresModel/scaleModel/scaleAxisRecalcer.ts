import { ScaleLinear } from "d3-scale";
import { ChartOrientation, DiscreteAxisOptions } from "../../../config/config";
import { Scale } from "../../../engine/features/scale/scale";
import { ScaleValueModel } from "../../model";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";

export const keyAxisLabelVerticalLog = "keyAxisLabel_vertical_margin_log";
export const keyAxisLabelHorizontalLog = "keyAxisLabel_horizontal_margin_log";

export interface ScaleValueCalculatedInfo {
	scale: ScaleValueModel;
	scaleFn: ScaleLinear<number, number, never>;
}

/**
 * Предназначен для получения нового scaleValue и уменьшения globalMargin, если ось ключей находится где-то внутри chartBlock, а не на его границе
 */
export class ScaleAxisRecalcer {
	constructor(private generateScaleLinear: () => ScaleValueModel) {}

	recalculateMargin(canvasModel: CanvasModel, chartOrientation: ChartOrientation, keyAxis: DiscreteAxisOptions) {
		const { scaleFn: scaleValueFn } = this.getScaleValue();

		const coordinateOnChartBlock =
			keyAxis.position === "start"
				? scaleValueFn(0)
				: (chartOrientation === "vertical"
						? canvasModel.getChartBlockHeight()
						: canvasModel.getChartBlockWidth()) - scaleValueFn(0);
		const key = chartOrientation === "vertical" ? keyAxisLabelVerticalLog : keyAxisLabelHorizontalLog;
		const logInfo = canvasModel.marginService.getDataByKey(key);
		if (logInfo) {
			canvasModel.decreaseMarginSide(
				logInfo.side,
				logInfo.byValue - coordinateOnChartBlock < 0 ? logInfo.byValue : coordinateOnChartBlock
			);
		}
	}

	getScaleValue(): ScaleValueCalculatedInfo {
		const scale = this.generateScaleLinear();
		return {
			scale,
			scaleFn: Scale.getScaleValue(scale)
		};
	}
}
