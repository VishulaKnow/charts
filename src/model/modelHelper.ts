import { IntervalChart } from "../config/config";
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

    public static getMinAndMaxOfIntervalData(data: DataSource, dataSource: string, charts: IntervalChart[]): [Date, Date] {
        let min = data[dataSource][0][charts[0].data.valueField1.name];
        let max = data[dataSource][0][charts[0].data.valueField1.name];

        charts.forEach(chart => {
            const chartData = data[dataSource];
            const valueField1 = chart.data.valueField1.name;
            const valueField2 = chart.data.valueField2.name;
            chartData.forEach(dataRow => {
                if(dataRow[valueField1] > max)
                    max = dataRow[valueField1];
                if(dataRow[valueField1] < min)
                    min = dataRow[valueField1];

                if(dataRow[valueField2] > max)
                    max = dataRow[valueField2];
                if(dataRow[valueField2] < min)
                    min = dataRow[valueField2];
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

    public static getUniqueValues(values: string[]): string[] {
        const uniqueValues = values.filter((keyValue, index, self) => self.indexOf(keyValue) === index);
       
        return uniqueValues;
    }

    public static getUniqueValuesLength(values: string[]): number {
        return this.getUniqueValues(values).length;
    }

    public static getStringScore(word: string): number {
        // lower case letter width ~ 0.74 from upper case width.
        // Number width == lower case letter width

        let score = 0;
        const upperLetterScore = 1;
        const lowerLetterScore = 0.74; 
        for(let i = 0; i < word.length; i++) {
            if(word[i].toUpperCase() === word[i] && parseFloat(word[i]).toString() !== word[i])
                score += upperLetterScore;
            else
                score += lowerLetterScore;
        }

        return score;
    }
}