import { LegendModel } from "./legendModel/legendModel";
import { OtherComponents } from "../model";
import { TitleModel } from "./titleModel";

export class OtherComponentsModel {
    public static getOtherComponentsModel(): OtherComponents {
        return {
            legendBlock: LegendModel.getBaseLegendBlockModel(),
            titleBlock: TitleModel.getTitleModel()
        }
    }
}