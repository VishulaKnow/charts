import { LegendModel } from "./legendModel/legendModel";
import { OtherCommonComponents } from "../model";
import { LegendBlockCanvas } from "../../designer/designerConfig";
import { ModelInstance } from "../modelInstance/modelInstance";
import { TitleConfigReader } from "../modelInstance/titleConfigReader";

interface OtherComponentsModelDependencies {
	legendConfig: LegendBlockCanvas;
	titleConfig: TitleConfigReader;
}

export class OtherComponentsModel {
	public static getOtherComponentsModel(
		dependencies: OtherComponentsModelDependencies,
		modelInstance: ModelInstance
	): OtherCommonComponents {
		const canvasModel = modelInstance.canvasModel;

		canvasModel.titleCanvas.init(dependencies.titleConfig);

		return {
			legendBlock: LegendModel.getBaseLegendBlockModel(canvasModel, dependencies.legendConfig),
			titleBlock: canvasModel.titleCanvas.getModel()
		};
	}
}
