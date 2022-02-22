import { MdtChartsCardOptionByValue, MdtChartsCardsChange, MdtChartsCardsChangeColor, MdtChartsCardsChangeIcon, MdtChartsColorName, MdtChartsDataRow } from "../../../config/config";
import { CardsChangeModel } from "../../model";

export const DEFAULT_CARD_FONT_COLOR: MdtChartsColorName = "#000";
export const DEFAULT_CARD_CHANGE_COLORS: MdtChartsCardOptionByValue<MdtChartsColorName> = {
    aboveZero: "#20b078",
    belowZero: "#ff3131",
    equalZero: DEFAULT_CARD_FONT_COLOR
}

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

    private getColor(changeValue: number, colorOptions: MdtChartsCardsChangeColor): MdtChartsColorName {
        const colorByValue = this.getOptionsByValue(changeValue, {
            ...DEFAULT_CARD_CHANGE_COLORS,
            ...colorOptions
        });
        return colorByValue;
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