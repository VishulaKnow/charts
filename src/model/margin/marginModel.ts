import { MdtChartsConfig, MdtChartsDataSource, MdtChartsTwoDimensionalOptions } from "../../config/config";
import { DesignerConfig } from "../../designer/designerConfig";
import { OtherCommonComponents } from "../model";
import { ModelInstance } from "../modelInstance/modelInstance";
import { CanvasModel } from "../modelInstance/canvasModel/canvasModel";
import { TwoDimMarginModel } from "./twoDim/twoDimMarginModel";
import { TwoDimConfigReader } from "../modelInstance/configReader";

export class MarginModel {
	//TODO: ensure
	private twoDimModel = new TwoDimMarginModel(
		this.designerConfig,
		new TwoDimConfigReader(this.config, this.designerConfig)
	);

	constructor(private designerConfig: DesignerConfig, private config: MdtChartsConfig) {}

	public initMargin(otherComponents: OtherCommonComponents, modelInstance: ModelInstance): void {
		const canvasModel = modelInstance.canvasModel;
		canvasModel.initMargin({ ...this.designerConfig.canvas.chartBlockMargin });
		this.recalcMarginByTitle(canvasModel);

		if (this.config.options.type === "2d") {
			this.twoDimModel.recalcMargin(otherComponents, modelInstance);
		}
	}

	public recalcMarginByVerticalAxisLabel(modelInstance: ModelInstance): void {
		this.twoDimModel.recalcMarginByVerticalAxisLabel(modelInstance);
	}

	private recalcMarginByTitle(canvasModel: CanvasModel): void {
		canvasModel.increaseMarginSide("top", canvasModel.titleCanvas.getAllNeededSpace());
	}
}
