import { MdtChartsConfig, MdtChartsDataSource, MdtChartsTwoDimensionalOptions } from "../../config/config";
import { DesignerConfig } from "../../designer/designerConfig";
import { LegendBlockModel, Orient, OtherCommonComponents, TitleBlockModel } from "../model";
import { ModelInstance } from "../modelInstance/modelInstance";
import { CanvasModel } from "../modelInstance/canvasModel/canvasModel";
import { TwoDimMarginModel } from "./twoDim/twoDimMarginModel";

export class MarginModel {
    public static initMargin(designerConfig: DesignerConfig, config: MdtChartsConfig, otherComponents: OtherCommonComponents, data: MdtChartsDataSource, modelInstance: ModelInstance): void {
        const canvasModel = modelInstance.canvasModel;
        canvasModel.initMargin({ ...designerConfig.canvas.chartBlockMargin });
        this.recalcMarginByTitle(canvasModel, otherComponents.titleBlock);

        if (config.options.type === '2d') {
            const twoDimModel = new TwoDimMarginModel();
            twoDimModel.recalcMargin(designerConfig, config.options, otherComponents, data, modelInstance);
        }
    }

    public static recalcMarginByVerticalAxisLabel(modelInstance: ModelInstance, options: MdtChartsTwoDimensionalOptions, designerConfig: DesignerConfig): void {
        const twoDimModel = new TwoDimMarginModel();
        twoDimModel.recalcMarginByVerticalAxisLabel(modelInstance, options, designerConfig)
    }

    public static appendToGlobalMarginValuesLegendMargin(canvasModel: CanvasModel, position: Orient, legendBlockModel: LegendBlockModel): void {
        const legendCoordinate = legendBlockModel.coordinate;
        if (position === 'left' || position === 'right')
            canvasModel.increaseMarginSide(position, legendCoordinate[position].margin.left + legendCoordinate[position].margin.right);
        else
            canvasModel.increaseMarginSide(position, legendCoordinate[position].margin.top + legendCoordinate[position].margin.bottom)
    }

    private static recalcMarginByTitle(canvasModel: CanvasModel, titleBlockModel: TitleBlockModel): void {
        canvasModel.increaseMarginSide("top", titleBlockModel.margin.top + titleBlockModel.size + titleBlockModel.margin.bottom);
    }
}