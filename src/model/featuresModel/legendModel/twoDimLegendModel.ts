import { MdtChartsTwoDimensionalOptions, Size } from "../../../config/config";
import { MarginModel } from "../../marginModel";
import { ILegendModel, LegendBlockModel, Orient } from "../../model";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { LegendCanvasModel } from "./legendCanvasModel";

export class TwoDimLegendModel {
    recalcMarginWith2DLegend(modelInstance: ModelInstance, options: MdtChartsTwoDimensionalOptions, legendBlockModel: LegendBlockModel): void {
        const canvasModel = modelInstance.canvasModel;

        const legendPosition = this.getLegendModel().position;
        modelInstance.canvasModel.legendCanvas.setPosition(legendPosition);

        if (legendPosition !== 'off') {
            const legendItemsContent = this.getLegendItemsContent(options);
            const legendSize = this.getLegendSize(legendPosition, legendItemsContent, canvasModel.getBlockSize(), legendBlockModel);

            canvasModel.increaseMarginSide(legendPosition, legendSize);

            if (legendSize !== 0)
                MarginModel.appendToGlobalMarginValuesLegendMargin(canvasModel, legendPosition, legendBlockModel);

            legendBlockModel.coordinate[legendPosition].size = legendSize;
        }
    }

    private getLegendSize(position: Orient, texts: string[], blockSize: Size, legendBlockModel: LegendBlockModel): number {
        return LegendCanvasModel.getLegendHeight(texts,
            blockSize.width - legendBlockModel.coordinate[position].margin.left - legendBlockModel.coordinate[position].margin.right,
            'row',
            position
        );
    }

    private getLegendModel(): ILegendModel {
        return {
            position: "top"
        }
    }

    private getLegendItemsContent(options: MdtChartsTwoDimensionalOptions): string[] {
        let texts: string[] = [];
        options.charts.forEach(chart => {
            texts = texts.concat(chart.data.valueFields.map(field => field.title))
        });
        return texts;
    }
}