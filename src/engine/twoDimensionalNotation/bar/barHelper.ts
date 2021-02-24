import { AxisScale } from "d3-axis";
import { BarChartSettings, BlockMargin, DataRow, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Scale, Scales } from "../../features/scale/scale";
import { Helper } from "../../helper";
import { ValueFormatter } from "../../valueFormatter";

export interface BarAttrs {
    x: (dataRow: DataRow) => number;
    y: (dataRow: DataRow) => number;
    width: (dataRow: DataRow) => number;
    height: (dataRow: DataRow) => number;
}

export class BarHelper {
    public static getGroupedBarAttrs(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueFieldName: string, blockSize: Size, barIndex: number, barsAmount: number, barSettings: BarChartSettings): BarAttrs {
        const attrs: BarAttrs = {
            x: null,
            y: null,
            width: null,
            height: null
        }

        this.setGroupedBarAttrsByKeyAxis(attrs, keyAxisOrient, scales, margin, keyField, barIndex, barsAmount, barSettings, false);
        this.setGroupedBarAttrsByValueAxis(attrs, keyAxisOrient, margin, scales.scaleValue, valueFieldName, blockSize);

        return attrs;
    }

    public static setGroupedBarAttrsByValueAxis(attrs: BarAttrs, keyAxisOrient: Orient, margin: BlockMargin, scaleValue: AxisScale<any>, valueFieldName: string, blockSize: Size): void {
        if (keyAxisOrient === 'top') {
            attrs.y = () => margin.top;
            attrs.height = d => Helper.getValueWithLimiter(ValueFormatter.getValueOrZero(scaleValue(d[valueFieldName])), blockSize.height - margin.top - margin.bottom, true);
        }
        else if (keyAxisOrient === 'bottom') {
            attrs.y = d => scaleValue(d[valueFieldName]) + margin.top;
            attrs.height = d => ValueFormatter.getValueOrZero(blockSize.height - margin.top - margin.bottom - scaleValue(d[valueFieldName]));
        }
        else if (keyAxisOrient === 'left') {
            attrs.x = () => margin.left + 1;
            attrs.width = d => ValueFormatter.getValueOrZero(scaleValue(d[valueFieldName]));
        }
        else if (keyAxisOrient === 'right') {
            attrs.x = d => scaleValue(d[valueFieldName]) + margin.left;
            attrs.width = d => ValueFormatter.getValueOrZero(blockSize.width - margin.left - margin.right - scaleValue(d[valueFieldName]));
        }
    }

    public static getStackedBarAttr(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, blockSize: Size, barIndex: number, barsAmount: number, barSettings: BarChartSettings): BarAttrs {
        const barDistance = barSettings.barDistance;
        const barStep = (Scale.getScaleBandWidth(scales.scaleKey) - barDistance * (barsAmount - 1)) / barsAmount; // Space for one bar
        const barSize = barStep > barSettings.maxBarWidth ? barSettings.maxBarWidth : barStep;
        const barDiff = (barStep - barSize) * barsAmount / 2; // if bar bigger than maxWidth, diff for x coordinate

        const attrs: BarAttrs = {
            x: null,
            y: null,
            width: null,
            height: null
        }

        this.setGroupedBarAttrsByKeyAxis(attrs, keyAxisOrient, scales, margin, keyField, barIndex, barsAmount, barSettings, true);

        if (keyAxisOrient === 'top') {
            attrs.y = d => margin.top + scales.scaleValue(d[0]);
            attrs.height = d => ValueFormatter.getValueOrZero(scales.scaleValue(d[1] - d[0]));
        }
        if (keyAxisOrient === 'bottom') {
            attrs.y = d => scales.scaleValue(d[1]) + margin.top;
            attrs.height = d => blockSize.height - margin.top - margin.bottom - scales.scaleValue(d[1] - d[0]);
        }
        if (keyAxisOrient === 'left') {
            attrs.x = d => margin.left + scales.scaleValue(d[0]) + 1;
            attrs.width = d => ValueFormatter.getValueOrZero(scales.scaleValue(d[1] - d[0]));
        }
        if (keyAxisOrient === 'right') {
            attrs.x = d => scales.scaleValue(d[1]) + margin.left;
            attrs.width = d => ValueFormatter.getValueOrZero(blockSize.width - margin.left - margin.right - scales.scaleValue(d[1] - d[0]));
        }

        return attrs;
    }

    public static getBarsInGroupAmount(charts: TwoDimensionalChartModel[]): number[] {
        let amounts: number[] = [];
        charts.forEach((chart) => {
            if (chart.type === 'bar' && chart.isSegmented)
                amounts.push(1) // Сегментированный бар содержит все свои valueFields в одном баре
            else if (chart.type === 'bar')
                amounts.push(chart.data.valueFields.length);
        });
        return amounts;
    }

    public static getBarIndex(barsAmounts: number[], chartIndex: number): number {
        if (barsAmounts.length < 2)
            return 0;

        let index = 0;
        barsAmounts.forEach((chartBars, i) => {
            if (i < chartIndex) {
                index += chartBars;
            }
        });
        return index;
    }

    private static setGroupedBarAttrsByKeyAxis(attrs: BarAttrs, keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, barIndex: number, barsAmount: number, barSettings: BarChartSettings, isSegmented: boolean): void {
        const barDistance = barSettings.barDistance;
        const barStep = (Scale.getScaleBandWidth(scales.scaleKey) - barDistance * (barsAmount - 1)) / barsAmount; // Space for one bar
        const barSize = barStep > barSettings.maxBarWidth ? barSettings.maxBarWidth : barStep;
        const barDiff = (barStep - barSize) * barsAmount / 2; // if bar bigger than maxWidth, diff for x coordinate

        // функция получения пути к значению key-филда. Если сегментированный, то данные хранятся в dataRow.data
        const keyValuePath = (d: DataRow, keyName: string, isSegmented: boolean) => isSegmented ? d.data[keyName] : d[keyName];

        if (keyAxisOrient === 'top' || keyAxisOrient === 'bottom') {
            attrs.x = d => scales.scaleKey(keyValuePath(d, keyField, isSegmented)) + margin.left + barSize * barIndex + barDistance * barIndex + barDiff;
            attrs.width = () => barSize;
        }
        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            attrs.y = d => scales.scaleKey(keyValuePath(d, keyField, isSegmented)) + margin.top + barSize * barIndex + barDistance * barIndex + barDiff;
            attrs.height = () => barSize;
        }
    }
}