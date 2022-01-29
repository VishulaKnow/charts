import { ModelHelper } from "../../helpers/modelHelper";
import { ScaleKeyModel, ScaleKeyType, ScaleValueModel, ScaleValueType } from "../../model";
import { AxisPosition, NumberDomain, IntervalChart, MdtChartsTwoDimensionalChart, MdtChartsTwoDimensionalOptions, ChartOrientation, MdtChartsDataSource, MdtChartsDataRow } from "../../../config/config";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";

export enum ScaleType {
    Key, Value
}

export class ScaleModel {
    public static getScaleKey(allowableKeys: string[], orient: ChartOrientation, canvasModel: CanvasModel, charts: MdtChartsTwoDimensionalChart[], barCharts: MdtChartsTwoDimensionalChart[]): ScaleKeyModel {
        return {
            domain: allowableKeys,
            range: {
                start: 0,
                end: ScaleModel.getRangePeek(ScaleType.Key, orient, canvasModel)
            },
            type: ScaleModel.getScaleKeyType(charts),
            elementsAmount: this.getElementsAmount(barCharts)
        }
    }

    public static getScaleLinear(options: MdtChartsTwoDimensionalOptions, dataRows: MdtChartsDataRow[], canvasModel: CanvasModel): ScaleValueModel {
        return {
            domain: ScaleModel.getLinearDomain(options.axis.value.domain, dataRows, options),
            range: {
                start: 0,
                end: ScaleModel.getRangePeek(ScaleType.Value, options.orientation, canvasModel)
            },
            type: ScaleModel.getScaleValueType(options.charts)
        }
    }

    public static getRangePeek(scaleType: ScaleType, chartOrientation: string, canvasModel: CanvasModel): number {
        if (chartOrientation === 'vertical')
            return scaleType === ScaleType.Key
                ? canvasModel.getChartBlockWidth()
                : canvasModel.getChartBlockHeight();

        return scaleType === ScaleType.Key
            ? canvasModel.getChartBlockHeight()
            : canvasModel.getChartBlockWidth();
    }

    public static getDateValueDomain(data: MdtChartsDataSource, chart: IntervalChart, keyAxisPosition: AxisPosition, dataSource: string): [Date, Date] {
        const minMax = ModelHelper.getMinAndMaxOfIntervalData(data, dataSource, chart);
        let domainPeekMin = minMax[0];
        let domainPeekMax = minMax[1];

        if (keyAxisPosition === 'start')
            return [domainPeekMin, domainPeekMax];
        return [domainPeekMax, domainPeekMin];
    }

    public static getLinearDomain(configDomain: NumberDomain, dataRows: MdtChartsDataRow[], configOptions: MdtChartsTwoDimensionalOptions): [number, number] {
        let domainPeekMin: number;
        let domainPeekMax: number;
        if (configDomain.start === -1)
            domainPeekMin = this.getScaleMinValue(configOptions.charts, dataRows)
        else
            domainPeekMin = configDomain.start;

        if (configDomain.end === -1)
            domainPeekMax = this.getScaleMaxValue(configOptions.charts, dataRows);
        else
            domainPeekMax = configDomain.end;

        if (configOptions.axis.key.position === 'start')
            return [domainPeekMin, domainPeekMax];
        return [domainPeekMax, domainPeekMin];
    }

    public static getScaleKeyType(charts: MdtChartsTwoDimensionalChart[]): ScaleKeyType {
        if (charts.findIndex((chart: MdtChartsTwoDimensionalChart) => chart.type === 'bar') === -1)
            return 'point';

        return 'band';
    }

    public static getScaleValueType(charts: MdtChartsTwoDimensionalChart[] | IntervalChart[]): ScaleValueType {
        if (charts.findIndex((chart: MdtChartsTwoDimensionalChart | IntervalChart) => chart.type === 'gantt') !== -1)
            return 'datetime';

        return 'linear';
    }

    public static getElementsAmount(barCharts: MdtChartsTwoDimensionalChart[]): number {
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

    public static getScaleMaxValue(charts: MdtChartsTwoDimensionalChart[], dataRows: MdtChartsDataRow[]): number {
        let max: number = 0;

        charts.forEach(chart => {
            dataRows.forEach(dataRow => {
                let sumInRow = 0;
                chart.data.valueFields.forEach(field => {
                    if (chart.isSegmented && dataRow[field.name] > 0)
                        sumInRow += dataRow[field.name];
                    else if (dataRow[field.name] > sumInRow)
                        sumInRow = dataRow[field.name];
                });
                if (max < sumInRow)
                    max = sumInRow;
            });
        });

        return max;
    }

    public static getScaleMinValue(charts: MdtChartsTwoDimensionalChart[], dataRows: MdtChartsDataRow[]) {
        let min: number = 0;

        charts.forEach(chart => {
            dataRows.forEach(dataRow => {
                let sumInRow = 0;
                chart.data.valueFields.forEach(field => {
                    if (chart.isSegmented && dataRow[field.name] < 0) {
                        sumInRow += dataRow[field.name];
                    } else if (dataRow[field.name] < sumInRow)
                        sumInRow = dataRow[field.name];
                });
                if (min > sumInRow)
                    min = sumInRow;
            });
        });

        return min;
    }
}