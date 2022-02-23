import { MdtChartsCardOptionByValue, MdtChartsCardsChange, MdtChartsCardsChangeIcon, MdtChartsColorName, MdtChartsColorRangeItem, MdtChartsDataRow } from "../../../config/config";
import { ColorRangeManager } from "../../chartStyleModel/colorRange";
import { CardsChangeModel } from "../../model";

export const DEFAULT_CARD_CHANGE_COLOR: MdtChartsCardOptionByValue<MdtChartsColorName> = {
    aboveZero: "#20b078",
    equalZero: "#000",
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

export class CardsChangeService {
    getChangeModel(dataRow: MdtChartsDataRow, changeOptions: MdtChartsCardsChange): CardsChangeModel {
        if (!changeOptions || !changeOptions.value?.field) return void 0;

        const value = dataRow[changeOptions.value.field];

        return {
            description: changeOptions.description,
            value: {
                ...changeOptions.value
            },
            color: this.getColor(value, changeOptions.color),
            icon: this.getIcon(value, changeOptions.icon)
        }
    }

    private getColor(changeValue: number, colorOptions: MdtChartsColorRangeItem[]): MdtChartsColorName {
        const range = colorOptions?.length ? colorOptions : DEFAULT_CARD_CHANGE_RANGE;
        const rangeManager = new ColorRangeManager(range);
        return rangeManager.getColorByValue(changeValue);
    }

    private getIcon(changeValue: number, iconOptions: MdtChartsCardsChangeIcon) {
        if (!iconOptions) return void 0;
        return this.getOptionsByValue(changeValue, iconOptions);
    }

    private getOptionsByValue<T>(value: number, optionsByValues: MdtChartsCardOptionByValue<T>): T {
        if (value < 0) return optionsByValues.belowZero;
        if (value > 0) return optionsByValues.aboveZero;
        return optionsByValues.equalZero;
    }
}