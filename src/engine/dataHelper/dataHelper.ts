import { DataType, Formatter, Model, PolarChartModel, TwoDimensionalChartModel } from '../../model/model'

export type DataRow = {
    [field: string]: any
}

export class DataHelper
{
    static format: Formatter;

    static formatValue(valueType: DataType, value: any): string {
        return this.format[valueType]({}, value);
    }

    static prepareData(data: any, model: Model): void {
        const allowableKeys = model.dataSettings.allowableKeys;
        model.options.charts.forEach((chart: TwoDimensionalChartModel | PolarChartModel) => {
            data[chart.data.dataSource] = data[chart.data.dataSource].filter((d: DataRow) => allowableKeys.includes(d[chart.data.keyField.name]));
        });
    }

    static getValueOrZero(value: number): number {
        return value > 0 ? value : 0;
    }
}