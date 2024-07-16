import { MdtChartsDataSource, IntervalChart } from "../../config/config";
import { DomHelper } from "../../engine/helpers/domHelper";


export class ModelHelper {
    private static baseFontSize: number

    private static getBaseFontSize() {
        if (!this.baseFontSize) this.baseFontSize = parseInt(DomHelper.getCssPropertyValue(document.documentElement, '--chart-base-font-size'))
        return this.baseFontSize
    }

    public static getSum(items: number[]): number {
        return items.reduce((acc, item) => acc + item, 0);
    }

    public static getMinAndMaxOfIntervalData(data: MdtChartsDataSource, dataSource: string, chart: IntervalChart): [Date, Date] {
        let min = data[dataSource][0][chart.data.valueField1.name];
        let max = data[dataSource][0][chart.data.valueField1.name];

        const chartData = data[dataSource];
        const valueField1 = chart.data.valueField1.name;
        const valueField2 = chart.data.valueField2.name;
        chartData.forEach(dataRow => {
            if (dataRow[valueField1] > max)
                max = dataRow[valueField1];
            if (dataRow[valueField1] < min)
                min = dataRow[valueField1];

            if (dataRow[valueField2] > max)
                max = dataRow[valueField2];
            if (dataRow[valueField2] < min)
                min = dataRow[valueField2];
        });

        return [min, max];
    }

    public static getUniqueValues(values: string[]): string[] {
        const uniqueValues = values.filter((keyValue, index, self) => self.indexOf(keyValue) === index);

        return uniqueValues;
    }

    public static getStringScore(word: string): number {
        // lower case letter width ~ 0.8 from upper case width.
        // Number width == lower case letter width

        const fontSize = this.getBaseFontSize()
        let score = 0;
        const upperLetterScore = fontSize / 13;
        const lowerLetterScore = fontSize / 15;
        const digitScore = fontSize / 15;
        const otherSymbolScore = fontSize / 23;
        const specialSmallSymbols = [",", ".", " "]
        for (let i = 0; i < word.length; i++) {
            if (parseFloat(word[i]).toString() !== word[i] && !specialSmallSymbols.includes(word[i]) && word[i].trim().length > 0) {
                if (word[i].toUpperCase() === word[i]) score += upperLetterScore;
                else score += lowerLetterScore;
            } else if (word[i] == parseInt(word[i]).toString()) score += digitScore;
            else score += otherSymbolScore;
        }

        return score;
    }
}