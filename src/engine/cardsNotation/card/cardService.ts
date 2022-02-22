import { MdtChartsCardValue, MdtChartsDataRow, MdtChartsDataSource } from "../../../config/config";
import { ValueFormatter } from "../../valueFormatter";
import { CardValueContent } from "./card";

interface ValueContentGetterOptions extends MdtChartsCardValue {
    dataSetName: string;
}

export class CardServiceClass {
    getValueContentFromDataSource(valueOptions: ValueContentGetterOptions, data: MdtChartsDataSource): CardValueContent {
        const dataRow = data[valueOptions.dataSetName][0];
        return this.getValueContentFromRow(valueOptions, dataRow);
    }

    getValueContentFromRow(valueOptions: MdtChartsCardValue, dataRow: MdtChartsDataRow) {
        const value = dataRow[valueOptions.field];
        return ValueFormatter.formatField(valueOptions.dataType, value);
    }
}

export const CardService = new CardServiceClass();