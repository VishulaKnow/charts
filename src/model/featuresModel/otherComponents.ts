import { LegendModel } from "./legendModel/legendModel";
import { OtherComponents } from "../model";
import { TitleModel } from "./titleModel";
import { ElementsOptions } from "../../designer/designerConfig";
import { TooltipModel } from "./tooltipModel";
import { ChartNotation } from "../../config/config";

export class OtherComponentsModel {
    public static getOtherComponentsModel(elementsOptions: ElementsOptions, notation: ChartNotation): OtherComponents {
        return {
            legendBlock: LegendModel.getBaseLegendBlockModel(notation),
            titleBlock: TitleModel.getTitleModel(),
            tooltipBlock: TooltipModel.getTooltipModel(elementsOptions.tooltip)
        }
    }
}