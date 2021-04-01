import { LegendModel } from "./legendModel/legendModel";
import { OtherComponents } from "../model";
import { TitleModel } from "./titleModel";
import { ElementsOptions } from "../../designer/designerConfig";
import { TooltipModel } from "./tooltipModel";

export class OtherComponentsModel {
    public static getOtherComponentsModel(elementsOptions: ElementsOptions): OtherComponents {
        return {
            legendBlock: LegendModel.getBaseLegendBlockModel(),
            titleBlock: TitleModel.getTitleModel(),
            tooltipBlock: TooltipModel.getTooltipModel(elementsOptions.tooltip)
        }
    }
}