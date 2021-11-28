import { LegendModel } from "./legendModel/legendModel";
import { OtherCommonComponents } from "../model";
import { TitleModel } from "./titleModel";
import { ElementsOptions } from "../../designer/designerConfig";
import { TooltipModel } from "./tooltipModel";
import { ChartNotation } from "../../config/config";

interface OtherComponentsModelDependencies {
    elementsOptions: ElementsOptions;
    title: string;
    notation: ChartNotation;
}

export class OtherComponentsModel {
    public static getOtherComponentsModel(dependencies: OtherComponentsModelDependencies): OtherCommonComponents {
        const titleBlock = TitleModel.getTitleModel(dependencies.title);
        return {
            legendBlock: LegendModel.getBaseLegendBlockModel(dependencies.notation, titleBlock),
            titleBlock,
            tooltipBlock: TooltipModel.getTooltipModel(dependencies.elementsOptions.tooltip)
        }
    }
}