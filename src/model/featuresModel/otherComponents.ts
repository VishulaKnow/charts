import { LegendModel } from "./legendModel/legendModel";
import { OtherCommonComponents } from "../model";
import { ElementsOptions, LegendBlockCanvas } from "../../designer/designerConfig";
import { TooltipCanvasModel } from "./tooltipModel/tooltipCanvasModel";
import { ModelInstance } from "../modelInstance/modelInstance";
import { TitleConfigReader } from "../modelInstance/titleConfigReader";

interface OtherComponentsModelDependencies {
	elementsOptions: ElementsOptions;
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
			titleBlock: canvasModel.titleCanvas.getModel(),
			tooltipBlock: TooltipCanvasModel.getCanvasModel(dependencies.elementsOptions.tooltip)
		};
	}
}
