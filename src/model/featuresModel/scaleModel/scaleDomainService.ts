import {
    AxisNumberDomain,
    MdtChartsDataRow,
    MdtChartsTwoDimensionalChart,
    MdtChartsTwoDimensionalOptions,
    TwoDimensionalValueGroup
} from "../../../config/config";

export function getResolvedDomain(domain: AxisNumberDomain, dataRows: MdtChartsDataRow[]) {
    return typeof domain === "function" ? domain({ data: dataRows }) : domain;
}

export function getScaleLinearDomain(
    configDomain: AxisNumberDomain,
    dataRows: MdtChartsDataRow[],
    configOptions: MdtChartsTwoDimensionalOptions,
    valueGroup: TwoDimensionalValueGroup = "main"
) {
    const calculator = new ScaleDomainCalculator();

    let domainPeekMin: number;
    let domainPeekMax: number;

    const resolvedConfigDomain = getResolvedDomain(configDomain, dataRows);

    const charts = configOptions.charts.filter((chart) => {
        return (chart.data.valueGroup ?? "main") === valueGroup;
    });

    if (resolvedConfigDomain.start === -1) domainPeekMin = calculator.getScaleMinValue(configOptions.charts, dataRows);
    else domainPeekMin = resolvedConfigDomain.start;

    if (resolvedConfigDomain.end === -1) domainPeekMax = calculator.getScaleMaxValue(charts, dataRows);
    else domainPeekMax = resolvedConfigDomain.end;

    if (configOptions.axis.key.position === "start") return [domainPeekMin, domainPeekMax];
    return [domainPeekMax, domainPeekMin];
}

export class ScaleDomainCalculator {
    getScaleMinValue(charts: MdtChartsTwoDimensionalChart[], dataRows: MdtChartsDataRow[]) {
        let min: number = 0;

        charts.forEach((chart) => {
            dataRows.forEach((dataRow) => {
                let sumInRow = 0;
                chart.data.valueFields.forEach((field) => {
                    if (chart.isSegmented && dataRow[field.name] < 0) {
                        sumInRow += dataRow[field.name];
                    } else if (dataRow[field.name] < sumInRow) sumInRow = dataRow[field.name];
                });
                if (min > sumInRow) min = sumInRow;
            });
        });
        return min;
    }

    getScaleMaxValue(charts: MdtChartsTwoDimensionalChart[], dataRows: MdtChartsDataRow[]): number {
        let max: number = 0;

        charts.forEach((chart) => {
            dataRows.forEach((dataRow) => {
                let sumInRow = 0;
                chart.data.valueFields.forEach((field) => {
                    if (chart.isSegmented && dataRow[field.name] > 0) sumInRow += dataRow[field.name];
                    else if (dataRow[field.name] > sumInRow) sumInRow = dataRow[field.name];
                });
                if (max < sumInRow) max = sumInRow;
            });
        });
        return max;
    }
}
