import { MdtChartsCardOptionByValue, MdtChartsCardsChange, MdtChartsCardsChangeIcon, MdtChartsColorName, MdtChartsColorRangeItem, MdtChartsDataRow } from "../../../config/config";
import { ColorRangeManager } from "../../chartStyleModel/colorRange";
import { CardsChangeModel } from "../../model";
import { DEFAULT_CARD_CHANGE_RANGE } from "./cardsModelService";
export class CardsChangeService {
    getChangeModel(dataRow: MdtChartsDataRow, changeOptions: MdtChartsCardsChange): CardsChangeModel {
        if (!changeOptions || !changeOptions.value?.field) return void 0;

        const value = dataRow[changeOptions.value.field];

        return {
            description: changeOptions.description,
            value: {
                ...changeOptions.value
            },
            valuePrefix: this.getValuePrefix(value),
            color: this.getColor(value, changeOptions.color),
            icon: this.getIcon(value, changeOptions.icon)
        }
    }

    private getValuePrefix(value: number) {
        const prefixes: MdtChartsCardOptionByValue<string> = {
            aboveZero: "+",
            belowZero: "",
            equalZero: ""
        }
        return this.getOptionsByValue(value, prefixes);
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