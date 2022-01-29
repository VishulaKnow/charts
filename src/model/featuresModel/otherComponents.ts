import { LegendModel } from "./legendModel/legendModel";
import { OtherCommonComponents } from "../model";
import { TitleModel } from "./titleModel";
import { ElementsOptions } from "../../designer/designerConfig";
import { TooltipModel } from "./tooltipModel";
import { ModelInstance } from "../modelInstance/modelInstance";

interface OtherComponentsModelDependencies {
    elementsOptions: ElementsOptions;
    title: string;
}

export class OtherComponentsModel {
    public static getOtherComponentsModel(dependencies: OtherComponentsModelDependencies, modelInstance: ModelInstance): OtherCommonComponents {
        const canvasModel = modelInstance.canvasModel;

        canvasModel.titleCanvas.init(TitleModel.getTitleModel(dependencies.title));

        return {
            legendBlock: LegendModel.getBaseLegendBlockModel(canvasModel),
            titleBlock: canvasModel.titleCanvas.getModel(),
            tooltipBlock: TooltipModel.getTooltipModel(dependencies.elementsOptions.tooltip)
        }
    }
}