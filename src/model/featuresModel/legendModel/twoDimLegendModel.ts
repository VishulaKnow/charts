import { Legend } from "../../../config/config";
import { ILegendModel, LegendBlockModel, LegendPosition } from "../../model";
import { styledElementValues } from "../../modelBuilder";
import { TwoDimConfigReader } from "../../modelInstance/configReader";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { getWidthOfLegendMarkerByType } from "../../notations/twoDimensional/styles";
import { LegendCanvasModel } from "./legendCanvasModel";
import { LegendModel } from "./legendModel";

export class TwoDimLegendModel {
    constructor(private configReader: TwoDimConfigReader) { }

    recalcMarginWith2DLegend(modelInstance: ModelInstance, legendBlockModel: LegendBlockModel, legendOptions: Legend): void {
        const canvasModel = modelInstance.canvasModel;

        const legendPosition = this.getLegendModel(legendOptions).position;
        modelInstance.canvasModel.legendCanvas.setPosition(legendPosition);

        if (legendPosition !== 'off') {
            const legendItemInfo = this.configReader.getLegendItemInfo();
            const legendSize = LegendCanvasModel.findElementsAmountByLegendSize(
                legendItemInfo.map(i => ({
                    text: i.text,
                    markerSize: { ...styledElementValues.defaultLegendMarkerSizes, widthPx: getWidthOfLegendMarkerByType(i.chartType) },
                    wrapperSize: { marginRightPx: styledElementValues.legend.inlineItemWrapperMarginRightPx }
                })),
                'top',
                modelInstance.canvasModel.getBlockSize().width,
                legendBlockModel.static.maxLinesAmount * styledElementValues.legend.inlineLegendOneLineHeightPx
            ).size.height;
            canvasModel.increaseMarginSide(legendPosition, legendSize);

            if (legendSize !== 0)
                LegendModel.appendToGlobalMarginValuesLegendMargin(canvasModel, legendPosition, legendBlockModel);

            legendBlockModel.coordinate[legendPosition].size = legendSize;
        }
    }

    private getLegendSizeLegacy(): number {
        const heightOfLegendItemWithoutWordWrapping = 20;
        return heightOfLegendItemWithoutWordWrapping;
    }

    private getLegendModel(legendOptions: Legend): ILegendModel {
        const position: LegendPosition = legendOptions.show ? "top" : "off";
        return {
            position
        }
    }
}