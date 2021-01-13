import { DataType, Formatter } from '../../designer/designerConfig';
import { DataRow, DataSource, Model, PolarChartModel, TwoDimensionalChartModel } from '../../model/model'

export class DataHelper
{
    static format: Formatter;

    static formatValue(valueType: DataType, value: string): string {
        return this.format[valueType]({}, value);
    }

    static prepareData(data: DataSource, model: Model): void {
        const allowableKeys = model.dataSettings.scope.allowableKeys;
        model.options.charts.forEach((chart: TwoDimensionalChartModel | PolarChartModel) => {
            data[chart.data.dataSource] = data[chart.data.dataSource].filter((d: DataRow) => allowableKeys.includes(d[chart.data.keyField.name]));
        });
    }

    static getValueOrZero(value: number): number {
        return value > 0 ? value : 0;
    }
}