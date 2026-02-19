import { LegendConfig } from "../../../config/config";
import { LegendBlockCanvas } from "../../../designer/designerConfig";
import { LegendBlockModel, LegendPosition } from "../../model";
import { styledElementValues } from "../../modelBuilder";
import { TwoDimConfigReader } from "../../modelInstance/configReader/twoDimConfigReader/twoDimConfigReader";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { getWidthOfLegendMarkerByType } from "../../notations/twoDimensional/styles";
import { LegendCanvasModel } from "./legendCanvasModel";
import { calculateLegendMaxSize, LegendModel } from "./legendModel";

export class TwoDimLegendModel {
	constructor(private configReader: TwoDimConfigReader) {}

	recalcMarginWith2DLegend(
		modelInstance: ModelInstance,
		legendBlockModel: LegendBlockModel,
		legendOptions: LegendConfig,
		legendCanvas: LegendBlockCanvas
	): void {
		const canvasModel = modelInstance.canvasModel;

		const legendPosition = this.getLegendPosition(legendOptions);
		modelInstance.canvasModel.legendCanvas.setPosition(legendPosition);

		const legendItemInfo = this.configReader.getLegendItemInfo();
		if (legendPosition !== "off" && legendItemInfo.length > 0) {
			const legendMaxSize = calculateLegendMaxSize(legendBlockModel, canvasModel, legendPosition, legendCanvas);
			const legendBlockSize = LegendCanvasModel.findElementsAmountByLegendSize(
				legendItemInfo.map((i) => ({
					text: i.text,
					markerSize: {
						...styledElementValues.defaultLegendMarkerSizes,
						widthPx: getWidthOfLegendMarkerByType(i.chartType)
					},
					wrapperSize: { marginRightPx: styledElementValues.legend.inlineItemWrapperMarginRightPx }
				})),
				legendPosition,
				legendMaxSize.width,
				legendMaxSize.height
			).size;

			const legendSize =
				legendPosition === "top" || legendPosition === "bottom"
					? legendBlockSize.height
					: legendBlockSize.width;

			const legendTotalMargin = LegendModel.getLegendTotalMargin(legendPosition, legendBlockModel);
			modelInstance.canvasModel.legendCanvas.initSizeAndPad(legendSize, legendTotalMargin);
			canvasModel.increaseMarginSide(legendPosition, modelInstance.canvasModel.legendCanvas.getAllNeededSpace());

			legendBlockModel.coordinate[legendPosition].size = legendSize;
		}
	}

	private getLegendPosition(legendOptions: LegendConfig): LegendPosition {
		return legendOptions.show ? (legendOptions.position ?? "top") : "off";
	}
}
