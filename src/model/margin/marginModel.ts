import { MdtChartsConfig } from "../../config/config";
import { DesignerConfig } from "../../designer/designerConfig";
import { OtherCommonComponents } from "../model";
import { ModelInstance } from "../modelInstance/modelInstance";
import { CanvasModel } from "../modelInstance/canvasModel/canvasModel";
import { TwoDimMarginModel } from "./twoDim/twoDimMarginModel";
import { TwoDimConfigReader } from "../modelInstance/configReader/twoDimConfigReader/twoDimConfigReader";
import { BaseConfigReader, getConfigReader } from "../modelInstance/configReader/baseConfigReader";

export class MarginModel {
	private twoDimModel: TwoDimMarginModel | undefined;
	private readonly configReader: BaseConfigReader;

	constructor(private readonly designerConfig: DesignerConfig, private readonly config: MdtChartsConfig) {
		this.configReader = getConfigReader(this.config, this.designerConfig);
	}

	public initMargin(otherComponents: OtherCommonComponents, modelInstance: ModelInstance): void {
		const canvasModel = modelInstance.canvasModel;
		canvasModel.initMargin(this.configReader.getChartBlockMargin());
		this.recalcMarginByTitle(canvasModel);

		if (this.config.options.type === "2d") {
			this.twoDimModel = new TwoDimMarginModel(this.designerConfig, this.configReader as TwoDimConfigReader);
			this.twoDimModel.recalcMargin(otherComponents, modelInstance);
		}
	}

	public recalcMarginByVerticalAxisLabel(modelInstance: ModelInstance): void {
		this.twoDimModel?.recalcMarginByVerticalAxisLabel(modelInstance);
	}

	private recalcMarginByTitle(canvasModel: CanvasModel): void {
		canvasModel.increaseMarginSide("top", canvasModel.titleCanvas.getAllNeededSpace());
	}
}
