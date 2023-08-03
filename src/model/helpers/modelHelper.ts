import { MdtChartsDataSource, IntervalChart } from "../../config/config";


export class ModelHelper {
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
        // lower case letter width ~ 0.74 from upper case width.
        // Number width == lower case letter width

        let score = 0;
        const upperLetterScore = 1;
        const lowerLetterScore = 0.8;
        const digitAndSymbolScore = 0.67;
        const specialSmallSymbols = [",", ".", " "]
        for (let i = 0; i < word.length; i++) {
            if (parseFloat(word[i]).toString() !== word[i] && !specialSmallSymbols.includes(word[i]) && word[i].trim().length > 0) {
                if (word[i].toUpperCase() === word[i]) score += upperLetterScore;
                else score += lowerLetterScore;
            } else score += digitAndSymbolScore;
        }

        return score;
    }
}