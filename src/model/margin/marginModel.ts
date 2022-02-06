import { MdtChartsConfig, MdtChartsDataSource, MdtChartsTwoDimensionalOptions } from "../../config/config";
import { DesignerConfig } from "../../designer/designerConfig";
import { OtherCommonComponents } from "../model";
import { ModelInstance } from "../modelInstance/modelInstance";
import { CanvasModel } from "../modelInstance/canvasModel/canvasModel";
import { TwoDimMarginModel } from "./twoDim/twoDimMarginModel";

export class MarginModel {
    private twoDimModel = new TwoDimMarginModel();

    public initMargin(designerConfig: DesignerConfig, config: MdtChartsConfig, otherComponents: OtherCommonComponents, data: MdtChartsDataSource, modelInstance: ModelInstance): void {
        const canvasModel = modelInstance.canvasModel;
        canvasModel.initMargin({ ...designerConfig.canvas.chartBlockMargin });
        this.recalcMarginByTitle(canvasModel);

        if (config.options.type === '2d') {
            this.twoDimModel.recalcMargin(designerConfig, config.options, otherComponents, data, modelInstance);
        }
    }

    public recalcMarginByVerticalAxisLabel(modelInstance: ModelInstance, options: MdtChartsTwoDimensionalOptions, designerConfig: DesignerConfig): void {
        this.twoDimModel.recalcMarginByVerticalAxisLabel(modelInstance, options, designerConfig)
    }

    private recalcMarginByTitle(canvasModel: CanvasModel): void {
        canvasModel.increaseMarginSide("top", canvasModel.titleCanvas.getAllNeededSpace());
    }
}