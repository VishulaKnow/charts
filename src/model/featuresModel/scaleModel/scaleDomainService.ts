import { MdtChartsDataRow, MdtChartsTwoDimensionalChart, MdtChartsTwoDimensionalOptions, NumberDomain } from "../../../config/config";

export function getScaleLinearDomain(configDomain: NumberDomain, dataRows: MdtChartsDataRow[], configOptions: MdtChartsTwoDimensionalOptions) {
    const calculator = new ScaleDomainCalculator();

    let domainPeekMin: number;
    let domainPeekMax: number;
    if (configDomain.start === -1)
        domainPeekMin = calculator.getScaleMinValue(configOptions.charts, dataRows)
    else
        domainPeekMin = configDomain.start;

    if (configDomain.end === -1)
        domainPeekMax = calculator.getScaleMaxValue(configOptions.charts, dataRows);
    else
        domainPeekMax = configDomain.end;

    if (configOptions.axis.key.position === 'start')
        return [domainPeekMin, domainPeekMax];
    return [domainPeekMax, domainPeekMin];
}

export class ScaleDomainCalculator {
    getScaleMinValue(charts: MdtChartsTwoDimensionalChart[], dataRows: MdtChartsDataRow[]) {
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

    getScaleMaxValue(charts: MdtChartsTwoDimensionalChart[], dataRows: MdtChartsDataRow[]): number {
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
}