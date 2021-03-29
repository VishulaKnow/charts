import { ModelHelper } from "../modelHelper";
import { BlockMargin, DataSource, ScaleKeyModel, ScaleKeyType, ScaleValueModel, ScaleValueType } from "../model";
import { AxisPosition, NumberDomain, IntervalChart, TwoDimensionalChart, TwoDimensionalOptions, Size, ChartOrientation } from "../../config/config";

export enum ScaleType {
    Key, Value
}

export class ScaleModel {
    public static getScaleKey(allowableKeys: string[], orient: ChartOrientation, margin: BlockMargin, blockSize: Size, charts: TwoDimensionalChart[] | IntervalChart[], barCharts: TwoDimensionalChart[]): ScaleKeyModel {
        return {
            domain: allowableKeys,
            range: {
                start: 0,
                end: ScaleModel.getRangePeek(ScaleType.Key, orient, margin, blockSize)
            },
            type: ScaleModel.getScaleKeyType(charts),
            elementsAmount: this.getElementsAmount(barCharts)
        }
    }

    public static getScaleLinear(options: TwoDimensionalOptions, data: DataSource, margin: BlockMargin, blockSize: Size): ScaleValueModel {
        return {
            domain: ScaleModel.getLinearDomain(options.axis.value.domain, data, options),
            range: {
                start: 0,
                end: ScaleModel.getRangePeek(ScaleType.Value, options.orientation, margin, blockSize)
            },
            type: ScaleModel.getScaleValueType(options.charts)
        }
    }

    public static getRangePeek(scaleType: ScaleType, chartOrientation: string, margin: BlockMargin, blockSize: Size): number {
        if (chartOrientation === 'vertical')
            return scaleType === ScaleType.Key
                ? blockSize.width - margin.left - margin.right
                : blockSize.height - margin.top - margin.bottom;

        return scaleType === ScaleType.Key
            ? blockSize.height - margin.top - margin.bottom
            : blockSize.width - margin.left - margin.right;
    }

    public static getDateValueDomain(data: DataSource, charts: IntervalChart[], keyAxisPosition: AxisPosition, dataSource: string): [Date, Date] {
        const minMax = ModelHelper.getMinAndMaxOfIntervalData(data, dataSource, charts);
        let domainPeekMin = minMax[0];
        let domainPeekMax = minMax[1];

        if (keyAxisPosition === 'start')
            return [domainPeekMin, domainPeekMax];
        return [domainPeekMax, domainPeekMin];
    }

    public static getLinearDomain(configDomain: NumberDomain, data: DataSource, configOptions: TwoDimensionalOptions): [number, number] {
        let domainPeekMin: number;
        let domainPeekMax: number;
        if (configDomain.start === -1)
            domainPeekMin = 0;
        else
            domainPeekMin = configDomain.start;
        if (configDomain.end === -1)
            domainPeekMax = this.getScaleMaxValue(configOptions.charts, configOptions.data.dataSource, data);
        else
            domainPeekMax = configDomain.end;

        if (configOptions.axis.key.position === 'start')
            return [domainPeekMin, domainPeekMax];
        return [domainPeekMax, domainPeekMin];
    }

    public static getScaleKeyType(charts: TwoDimensionalChart[] | IntervalChart[]): ScaleKeyType {
        if (charts.findIndex((chart: TwoDimensionalChart | IntervalChart) => chart.type === 'bar' || chart.type === 'gantt') === -1)
            return 'point';

        return 'band';
    }

    public static getScaleValueType(charts: TwoDimensionalChart[] | IntervalChart[]): ScaleValueType {
        if (charts.findIndex((chart: TwoDimensionalChart | IntervalChart) => chart.type === 'gantt') !== -1)
            return 'datetime';

        return 'linear';
    }

    public static getElementsAmount(barCharts: TwoDimensionalChart[]): number {
        if (barCharts.length === 0)
            return 1;

        let barsAmount = 0;
        barCharts.forEach(chart => {
            if (chart.isSegmented)
                barsAmount += 1; // Если бар сегментированный, то все valueFields являются частями одного бара
            else
                barsAmount += chart.data.valueFields.length;
        });

        return barsAmount;
    }

    public static getScaleMaxValue(charts: TwoDimensionalChart[], dataSource: string, data: DataSource): number {
        let max: number = 0;

        charts.forEach(chart => {
            data[dataSource].forEach(dataRow => {
                let sumInRow = 0;
                chart.data.valueFields.forEach(field => {
                    if (chart.isSegmented)
                        sumInRow += dataRow[field.name];
                    else
                        if (dataRow[field.name] > sumInRow)
                            sumInRow = dataRow[field.name];
                });
                if (max < sumInRow)
                    max = sumInRow;
            });
        });

        return max;
    }
}