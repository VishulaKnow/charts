import { MdtChartsCardOptionByValue, MdtChartsCardsOptions, MdtChartsColorName, MdtChartsColorRangeItem } from "../../../config/config";
import { ColorRangeManager } from "../../chartStyleModel/colorRange";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { CardsChangeService } from "./cardsChangeService";

export const DEFAULT_CARD_COLOR: MdtChartsColorName = "#000";
export const DEFAULT_CARD_CHANGE_COLOR: MdtChartsCardOptionByValue<MdtChartsColorName> = {
    aboveZero: "#20b078",
    equalZero: DEFAULT_CARD_COLOR,
    belowZero: "#ff3131"
};
export const DEFAULT_CARD_CHANGE_RANGE: MdtChartsColorRangeItem[] = [
    {
        color: DEFAULT_CARD_CHANGE_COLOR.belowZero
    },
    {
        color: DEFAULT_CARD_CHANGE_COLOR.equalZero,
        value: 0
    },
    {
        color: DEFAULT_CARD_CHANGE_COLOR.aboveZero,
        value: 0
    }
];

export class CardsModelService {
    private changeService = new CardsChangeService();

    getCardColor(options: MdtChartsCardsOptions, modelInstance: ModelInstance): MdtChartsColorName {
        const data = modelInstance.dataModel.repository.getFirstRow();
        const value = data[options.value.field];
        return getCardColor(value, options.color);
    }

    getCardsChangeModel(options: MdtChartsCardsOptions, modelInstance: ModelInstance) {
        const data = modelInstance.dataModel.repository.getFirstRow();
        return this.changeService.getChangeModel(data, options.change);
    }
}

export function getCardColor(value: number | string, colorRange: MdtChartsColorRangeItem[]) {
    if (typeof value === "string" || !colorRange?.length) return DEFAULT_CARD_COLOR;
    const rangeManager = new ColorRangeManager(colorRange);
    return rangeManager.getColorByValue(value);
}