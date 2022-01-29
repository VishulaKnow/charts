import { MdtChartsTwoDimensionalOptions, Size } from "../../../config/config";
import { MarginModel } from "../../marginModel";
import { ILegendModel, LegendBlockModel, Orient } from "../../model";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { LegendCanvasModel } from "./legendCanvasModel";

export class TwoDimLegendModel {
    recalcMarginWith2DLegend(modelInstance: ModelInstance, legendBlockModel: LegendBlockModel): void {
        const canvasModel = modelInstance.canvasModel;

        const legendPosition = this.getLegendModel().position;
        modelInstance.canvasModel.legendCanvas.setPosition(legendPosition);

        if (legendPosition !== 'off') {
            const legendSize = this.getLegendSize();
            canvasModel.increaseMarginSide(legendPosition, legendSize);

            if (legendSize !== 0)
                MarginModel.appendToGlobalMarginValuesLegendMargin(canvasModel, legendPosition, legendBlockModel);

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