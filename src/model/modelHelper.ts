import { IntervalChart, TwoDimensionalChart } from "../config/config";
import { BlockMargin, DataSource, Size } from "./model";

export class ModelHelper
{
    public static getValuesSum(values: number[]): number {
        let sum = 0;
        for (let i = 0; i < values.length; i++) {
            sum += values[i];
        }
        return sum;
    }

    public static getMaxNumberValue(values: number[]): number {
        let max = values[0];
        for(let i = 0; i < values.length; i++) {
            if(max < values[i])
                max = values[i];
        }
        return max;
    }

    public static getMinAndMaxOfIntervalData(data: DataSource, charts: IntervalChart[]): [Date, Date] {
        let min = data[charts[0].data.dataSource][0][charts[0].data.valueField1.name];
        let max = data[charts[0].data.dataSource][0][charts[0].data.valueField1.name];

        charts.forEach(chart => {
            const chartData = data[chart.data.dataSource];
            const value1 = chart.data.valueField1.name;
            const value2 = chart.data.valueField2.name;
            chartData.forEach(dataRow => {
                if(dataRow[value1] > max)
                    max = dataRow[value1];
                if(dataRow[value1] < min)
                    min = dataRow[value1];

                if(dataRow[value2] > max)
                    max = dataRow[value2];
                if(dataRow[value2] < min)
                    min = dataRow[value2];
            });
        });

        return [min, max];
    }
    
    public static getDonutRadius(margin: BlockMargin, blockSize: Size): number {
        return Math.min(blockSize.height - margin.top - margin.bottom, blockSize.width - margin.left - margin.right) / 2;
    }
    
    public static getAngleByValue(value: number, valuesSum: number): number {
        return value / valuesSum * 360;
    }
    
    public static getMinAngleByLength(minLength: number, radius: number): number {
        return minLength * 360 / (2 * Math.PI * radius);
    }
}