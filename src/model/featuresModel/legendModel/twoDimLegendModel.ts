import { Legend } from "../../../config/config";
import { ILegendModel, LegendBlockModel, LegendPosition } from "../../model";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { LegendModel } from "./legendModel";

export class TwoDimLegendModel {
    recalcMarginWith2DLegend(modelInstance: ModelInstance, legendBlockModel: LegendBlockModel, legendOptions: Legend): void {
        const canvasModel = modelInstance.canvasModel;

        const legendPosition = this.getLegendModel(legendOptions).position;
        modelInstance.canvasModel.legendCanvas.setPosition(legendPosition);

        if (legendPosition !== 'off') {
            const legendSize = this.getLegendSize();
            canvasModel.increaseMarginSide(legendPosition, legendSize);

            if (legendSize !== 0)
                LegendModel.appendToGlobalMarginValuesLegendMargin(canvasModel, legendPosition, legendBlockModel);

            legendBlockModel.coordinate[legendPosition].size = legendSize;
        }
    }

    private getLegendSize(): number {
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