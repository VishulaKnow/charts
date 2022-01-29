import { MarginModel } from "../../marginModel";
import { LegendBlockModel } from "../../model";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";

export class LegendPolarMarginCalculator {
    updateMargin(legendPosition: "right" | "bottom", canvasModel: CanvasModel, legendBlockModel: LegendBlockModel, size: number) {
        canvasModel.legendCanvas.setPosition(legendPosition);
        this.updateMarginObj(legendBlockModel, legendPosition, size, canvasModel);
    }

    private updateMarginObj(legendBlockModel: LegendBlockModel, legendPosition: "right" | "bottom", legendSize: number, canvasModel: CanvasModel) {
        if (legendSize !== 0) {
            canvasModel.increaseMarginSide(legendPosition, legendSize);
            MarginModel.appendToGlobalMarginValuesLegendMargin(canvasModel, legendPosition, legendBlockModel);
        }

        legendBlockModel.coordinate[legendPosition].size = legendSize;
    }
}