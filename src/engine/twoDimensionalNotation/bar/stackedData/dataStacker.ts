import { stack } from "d3-shape";
import { MdtChartsDataRow } from "../../../../config/config";
import { DataStackerService } from "./dataStackerService";

export interface StackedDataRow {
    0: number;
    1: number;
    data: MdtChartsDataRow;
}

export type StackedDataFull = StackedDataRow[][];

export class DataStacker {
    private service = new DataStackerService();

    getStackedData(rawData: MdtChartsDataRow[], valueFields: string[]): StackedDataFull {
        const stackedData: StackedDataFull = [];

        valueFields.forEach((vField, vfIndex) => {
            const fieldStack: StackedDataRow[] = [];

            rawData.forEach((dataRow, drIndex) => {
                const valueFromData = dataRow[vField]

                const value0 = this.service.getValue0(stackedData, vfIndex, drIndex, valueFromData);
                const value1 = this.service.getValue1(value0, valueFromData);

                fieldStack.push({
                    "0": value0,
                    "1": value1,
                    data: dataRow
                });
            });

            stackedData.push(fieldStack);
        });

        return stackedData;
    }
}


export function getStackedDataWithOwn(rawData: MdtChartsDataRow[], valueFields: string[]): StackedDataFull {
    const stacker = new DataStacker();
    return stacker.getStackedData(rawData, valueFields);
}

export function getStackedDataWithD3(rawData: MdtChartsDataRow[], valueFields: string[]): StackedDataFull {
    return stack().keys(valueFields)(rawData);
}