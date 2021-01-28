import { sum } from "d3";
import { AxisPosition, NumberDomain, IntervalChart, TwoDimensionalChart, TwoDimensionalOptions } from "../config/config";
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

    public static getScaleDateValueDomain(data: DataSource, charts: IntervalChart[], keyAxisPosition: AxisPosition, allowableKeys: string[]): [Date, Date] {
        const minMax = ModelHelper.getMinAndMaxOfIntervalData(data, charts);
        let domainPeekMin = minMax[0];
        let domainPeekMax = minMax[1];

        if(keyAxisPosition === 'start')
            return [domainPeekMin, domainPeekMax]; 
        return [domainPeekMax, domainPeekMin];
    }
    
    public static getScaleLinearValueDomain(configDomain: NumberDomain, data: DataSource, configOptions: TwoDimensionalOptions): [number, number] {
        let domainPeekMin: number;
        let domainPeekMax: number;
        if(configDomain.start === -1)
            domainPeekMin = 0;
        else
            domainPeekMin = configDomain.start;
        if(configDomain.end === -1)
            domainPeekMax = this.getScaleMaxValue(configOptions, data);
        else
            domainPeekMax = configDomain.end;
            
        if(configOptions.axis.keyAxis.position === 'start')
            return [domainPeekMin, domainPeekMax];
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

    private static getScaleMaxValue(configOptions: TwoDimensionalOptions, data: DataSource): number {
        let max: number = 0;

        configOptions.charts.forEach(chart => {
            data[chart.data.dataSource].forEach(dataRow => {
                let sumInRow = 0;
                chart.data.valueField.forEach(field => {
                    if(configOptions.isSegmented)
                        sumInRow += dataRow[field.name];
                    else
                        if(dataRow[field.name] > sumInRow)
                            sumInRow = dataRow[field.name];
                });
                if(max < sumInRow)
                    max = sumInRow;
            });
        });
        
        return max;
    }

    private static getChartMaxValue(valueField: string, data: DataRow[]): number {
        let maxValue: number = data[0][valueField];
        const maxOfDim = ModelHelper.getMaxNumberValue(data.map(d => d[valueField]));
        if(maxOfDim > maxValue)
            maxValue = maxOfDim;
        return maxValue;
    }
}