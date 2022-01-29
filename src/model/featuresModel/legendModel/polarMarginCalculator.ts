import { LegendBlockCanvas } from "../../../designer/designerConfig";
import { getPxPercentUnitByValue } from "../../helpers/unitsFromConfigReader";
import { MarginModel } from "../../marginModel";
import { LegendBlockModel } from "../../model";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";

export class LegendPolarMarginCalculator {
    updateMargin(legendPosition: "right" | "bottom", canvasModel: CanvasModel, legendBlockModel: LegendBlockModel, size: number) {
        canvasModel.legendCanvas.setPosition(legendPosition);
        this.updateMarginObj(legendBlockModel, legendPosition, size, canvasModel);
    }

    getMaxLegendWidth(legendCanvas: LegendBlockCanvas, blockWidth: number) {
        const maxWidth = legendCanvas.maxWidth;
        if (typeof maxWidth === "number") return maxWidth;

        const unit = getPxPercentUnitByValue(maxWidth);
        const maxWidthNumber = parseInt(maxWidth);

        if (unit === "px") return maxWidthNumber;
        return maxWidthNumber / 100 * blockWidth;
    }

    private updateMarginObj(legendBlockModel: LegendBlockModel, legendPosition: "right" | "bottom", legendSize: number, canvasModel: CanvasModel) {
        if (legendSize !== 0) {
            canvasModel.increaseMarginSide(legendPosition, legendSize);
            MarginModel.appendToGlobalMarginValuesLegendMargin(canvasModel, legendPosition, legendBlockModel);
        }

        legendBlockModel.coordinate[legendPosition].size = legendSize;
    }
}