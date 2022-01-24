import { MdtChartsDataSource, MdtChartsPolarOptions } from "../../../config/config";
import { DataManagerModel } from "../../dataManagerModel/dataManagerModel";
import { MarginModel } from "../../marginModel";
import { LegendBlockModel, Orient } from "../../model";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { MIN_DONUT_BLOCK_SIZE } from "../../notations/polar/polarModel";
import { LegendModel } from "./legendModel";

export class LegendPolarMarginCalculator {
    recalcMargin(modelInstance: ModelInstance, options: MdtChartsPolarOptions, legendMaxWidth: number, legendBlockModel: LegendBlockModel, data: MdtChartsDataSource) {
        const canvasModel = modelInstance.canvasModel;

        let legendPosition = LegendModel.getLegendModel(options.type, options.legend.show, modelInstance.canvasModel).position;
        modelInstance.canvasModel.legendCanvas.setPosition(legendPosition);

        if (legendPosition === "off") return;

        let legendSize = this.getLegendSize(options, legendMaxWidth, legendBlockModel, data, canvasModel, legendPosition);

        if (legendPosition === "right" && canvasModel.getChartBlockWidth() - legendSize < MIN_DONUT_BLOCK_SIZE) {
            legendSize = this.getLegendSize(options, legendMaxWidth, legendBlockModel, data, canvasModel, "bottom");
            legendPosition = "bottom";
            modelInstance.canvasModel.legendCanvas.setPosition(legendPosition);
        }

        if (legendSize !== 0) {
            canvasModel.increaseMarginSide(legendPosition, legendSize);
            MarginModel.appendToGlobalMarginValuesLegendMargin(canvasModel, legendPosition, legendBlockModel);
        }

        legendBlockModel.coordinate[legendPosition].size = legendSize;
    }

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

    private getLegendSize(options: MdtChartsPolarOptions, legendMaxWidth: number, legendBlockModel: LegendBlockModel, data: MdtChartsDataSource, canvasModel: CanvasModel, legendPosition: Orient) {
        const legendItemsContent = this.getLegendItemsContent(options, data);
        return LegendModel.getLegendSize(options.type, legendPosition, legendItemsContent, legendMaxWidth, canvasModel.getBlockSize(), legendBlockModel);
    }

    private getLegendItemsContent(options: MdtChartsPolarOptions, data: MdtChartsDataSource) {
        return DataManagerModel.getDataValuesByKeyField(data, options.data.dataSource, options.data.keyField.name);
    }
}