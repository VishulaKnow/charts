import { MdtChartsTwoDimLegend } from "../../../config/config";
import { ILegendModel, LegendBlockModel, LegendPosition } from "../../model";
import { styledElementValues } from "../../modelBuilder";
import { TwoDimConfigReader } from "../../modelInstance/configReader/twoDimConfigReader/twoDimConfigReader";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { getWidthOfLegendMarkerByType } from "../../notations/twoDimensional/styles";
import { LegendCanvasModel } from "./legendCanvasModel";
import { LegendModel } from "./legendModel";

export class TwoDimLegendModel {
	constructor(private configReader: TwoDimConfigReader) {}

	recalcMarginWith2DLegend(
		modelInstance: ModelInstance,
		legendBlockModel: LegendBlockModel,
		legendOptions: MdtChartsTwoDimLegend
	): void {
		const canvasModel = modelInstance.canvasModel;

		const legendPosition = this.getLegendModel(legendOptions).position;
		modelInstance.canvasModel.legendCanvas.setPosition(legendPosition);

		if (legendPosition !== "off") {
			const legendItemInfo = this.configReader.getLegendItemInfo();
			const legendSize = LegendCanvasModel.findElementsAmountByLegendSize(
				legendItemInfo.map((i) => ({
					text: i.text,
					markerSize: {
						...styledElementValues.defaultLegendMarkerSizes,
						widthPx: getWidthOfLegendMarkerByType(i.chartType)
					},
					wrapperSize: { marginRightPx: styledElementValues.legend.inlineItemWrapperMarginRightPx }
				})),
				"top",
				modelInstance.canvasModel.getBlockSize().width,
				legendBlockModel.static.maxLinesAmount * styledElementValues.legend.inlineLegendOneLineHeightPx
			).size.height;

			if (legendSize !== 0) {
				const legendTotalMargin = LegendModel.getLegendTotalMargin(legendPosition, legendBlockModel);
				modelInstance.canvasModel.legendCanvas.initSizeAndPad(legendSize, legendTotalMargin);
				canvasModel.increaseMarginSide(
					legendPosition,
					modelInstance.canvasModel.legendCanvas.getAllNeededSpace()
				);
			}

			legendBlockModel.coordinate[legendPosition].size = legendSize;
		}
	}

	private getLegendModel(legendOptions: MdtChartsTwoDimLegend): ILegendModel {
		const position: LegendPosition = legendOptions.show ? legendOptions.position ?? "top" : "off";

		return {
			position
		};
	}
}
