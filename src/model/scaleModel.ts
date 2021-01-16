import { AxisPosition, NumberDomain, IntervalChart, TwoDimensionalChart } from "../config/config";
import { DataManagerModel } from "./dataManagerModel";
import { BlockMargin, DataRow, DataSource, ScaleKeyType, ScaleValueType, Size } from "./model";
import { ModelHelper } from "./modelHelper";

export enum ScaleType {
    Key, Value
}

export class ScaleModel
{
    public static getScaleRangePeek(scaleType: ScaleType, chartOrientation: string, margin: BlockMargin, blockSize: Size): number {
        if(chartOrientation === 'vertical')
            return scaleType === ScaleType.Key 
                ? blockSize.width - margin.left - margin.right
                : blockSize.height - margin.top - margin.bottom;
        return scaleType === ScaleType.Key 
            ? blockSize.height - margin.top - margin.bottom
            : blockSize.width - margin.left - margin.right;
    }

    public static getScaleKeyDomain(allowableKeys: string[]): string[] {
        return allowableKeys;
    }

    public static getScaleDateValueDomain(data: DataSource, charts: TwoDimensionalChart[] | IntervalChart[], keyAxisPosition: AxisPosition, allowableKeys: string[]): [Date, Date] {
        return [new Date('2020-12-01'), new Date('2020-12-31')];
    }
    
    public static getScaleLinearValueDomain(configDomain: NumberDomain, data: DataSource, charts: TwoDimensionalChart[], keyAxisPosition: AxisPosition, allowableKeys: string[]): [number, number] {
        let domainPeekMin: number;
        let domainPeekMax: number;
        if(configDomain.start === -1)
            domainPeekMin = 0;
        else
            domainPeekMin = configDomain.start;
        if(configDomain.end === -1)
            domainPeekMax = this.getScopedScalesMaxValue(charts, data, allowableKeys);
        else
            domainPeekMax = configDomain.end;
            
        if(keyAxisPosition === 'start')
            return [domainPeekMin, domainPeekMax];
        else 
            return [domainPeekMax, domainPeekMin];
    }

    public static getScaleKeyType(charts: TwoDimensionalChart[] | IntervalChart[]): ScaleKeyType {
        if(charts.findIndex((chart: TwoDimensionalChart | IntervalChart) => chart.type === 'bar' || chart.type === 'gantt') === -1)
            return 'point';
        return 'band';
    }

    public static getScaleValueType(charts: TwoDimensionalChart[] | IntervalChart[]): ScaleValueType {
        if(charts.findIndex((chart: TwoDimensionalChart | IntervalChart) => chart.type === 'gantt') !== -1)
            return 'datetime';
        return 'linear';
    }

    private static getScopedScalesMaxValue(charts: TwoDimensionalChart[], data: DataSource, allowableKeys: string[]): number {
        let max: number = 0;
        charts.forEach(chart => {
            const scopedData = DataManagerModel.getScopedChartData(data[chart.data.dataSource], allowableKeys, chart.data.keyField.name);
            const chartMaxValue = this.getChartMaxValue(chart, scopedData);
            if(max < chartMaxValue)
                max = chartMaxValue;
        });
        return max;
    }

    private static getChartMaxValue(chart: TwoDimensionalChart, data: DataRow[]): number {
        return ModelHelper.getMaxValue(data.map(d => d[chart.data.valueField.name]));
    }
}