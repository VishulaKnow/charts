import { ILegendModel, LegendBlockModel } from "../../model";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { LegendModel } from "./legendModel";

export class TwoDimLegendModel {
    recalcMarginWith2DLegend(modelInstance: ModelInstance, legendBlockModel: LegendBlockModel): void {
        const canvasModel = modelInstance.canvasModel;

        const legendPosition = this.getLegendModel().position;
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

    private getLegendModel(): ILegendModel {
        return {
            position: "top"
        }
    }
}