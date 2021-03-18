import { AxisScale } from "d3-axis";
import { BarChartSettings, BlockMargin, DataRow, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Scale, Scales } from "../../features/scale/scale";
import { Helper } from "../../helpers/helper";

export interface BarAttrsHelper {
    x: (dataRow: DataRow) => number;
    y: (dataRow: DataRow) => number;
    width: (dataRow: DataRow) => number;
    height: (dataRow: DataRow) => number;
}

export class BarHelper {
    public static getGroupedBarAttrs(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueFieldName: string, blockSize: Size, barIndex: number, barsAmount: number, barSettings: BarChartSettings): BarAttrsHelper {
        const attrs: BarAttrsHelper = {
            x: null,
            y: null,
            width: null,
            height: null
        }

        this.setBarAttrsByKey(attrs, keyAxisOrient, scales, margin, keyField, barIndex, barsAmount, barSettings, false);
        this.setGroupedBarAttrsByValue(attrs, keyAxisOrient, margin, scales.scaleValue, valueFieldName, blockSize);

        return attrs;
    }

    public static setGroupedBarAttrsByValue(attrs: BarAttrsHelper, keyAxisOrient: Orient, margin: BlockMargin, scaleValue: AxisScale<any>, valueFieldName: string, blockSize: Size): void {
        if (keyAxisOrient === 'top') {
            attrs.y = d => margin.top;
            attrs.height = d => Helper.getValueOrZero(scaleValue(d[valueFieldName]));
        }
        if (keyAxisOrient === 'bottom') {
            attrs.y = d => scaleValue(d[valueFieldName]) + margin.top;
            attrs.height = d => Helper.getValueOrZero(blockSize.height - margin.top - margin.bottom - scaleValue(d[valueFieldName]));
        }
        if (keyAxisOrient === 'left') {
            attrs.x = d => margin.left + 1;
            attrs.width = d => Helper.getValueOrZero(scaleValue(d[valueFieldName]));
        }
        if (keyAxisOrient === 'right') {
            attrs.x = d => scaleValue(d[valueFieldName]) + margin.left;
            attrs.width = d => Helper.getValueOrZero(blockSize.width - margin.left - margin.right - scaleValue(d[valueFieldName]));
        }
    }

    public static getStackedBarAttr(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, blockSize: Size, barIndex: number, barsAmount: number, barSettings: BarChartSettings): BarAttrsHelper {
        const attrs: BarAttrsHelper = {
            x: null,
            y: null,
            width: null,
            height: null
        }

        this.setBarAttrsByKey(attrs, keyAxisOrient, scales, margin, keyField, barIndex, barsAmount, barSettings, true);
        this.setSegmentedBarAttrsByValue(attrs, keyAxisOrient, scales, margin, blockSize);

        return attrs;
    }

    public static getBarsInGroupAmount(charts: TwoDimensionalChartModel[]): number[] {
        let amounts: number[] = [];
        charts.forEach((chart) => {
            if (chart.type === 'bar' && chart.isSegmented)
                amounts.push(1); // Сегментированный бар содержит все свои valueFields в одном баре
            else if (chart.type === 'bar')
                amounts.push(chart.data.valueFields.length);
        });
        return amounts;
    }

    /**
     * Получение индекса бара среди всх графиков и value-филдов. Используется для того, чтобы узнать, какой по счету в группе 
     * этот бар идет (сегментированный всегда один, группированный - количество value-филдов).
     * @param barsAmounts 
     * @param chartIndex 
     */
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

    private static setSegmentedBarAttrsByValue(attrs: BarAttrsHelper, keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, blockSize: Size): void {
        if (keyAxisOrient === 'top') {
            attrs.y = d => margin.top + scales.scaleValue(d[0]);
            attrs.height = d => Helper.getValueOrZero(scales.scaleValue(d[1] - d[0]));
        }
        if (keyAxisOrient === 'bottom') {
            attrs.y = d => scales.scaleValue(d[1]) + margin.top;
            attrs.height = d => Helper.getValueOrZero(blockSize.height - margin.top - margin.bottom - scales.scaleValue(d[1] - d[0]));
        }
        if (keyAxisOrient === 'left') {
            attrs.x = d => margin.left + scales.scaleValue(d[0]) + 1;
            attrs.width = d => Helper.getValueOrZero(scales.scaleValue(d[1] - d[0]));
        }
        if (keyAxisOrient === 'right') {
            attrs.x = d => scales.scaleValue(d[1]) + margin.left;
            attrs.width = d => Helper.getValueOrZero(blockSize.width - margin.left - margin.right - scales.scaleValue(d[1] - d[0]));
        }
    }

    private static setBarAttrsByKey(attrs: BarAttrsHelper, keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, barIndex: number, barsAmount: number, barSettings: BarChartSettings, isSegmented: boolean): void {
        const barDistance = barSettings.barDistance;
        const barStep = (Scale.getScaleBandWidth(scales.scaleKey) - barDistance * (barsAmount - 1)) / barsAmount; // Space for one bar
        const barSize = barStep > barSettings.maxBarWidth ? barSettings.maxBarWidth : barStep;
        const barDiff = (barStep - barSize) * barsAmount / 2; // if bar bigger than maxWidth, diff for x coordinate

        if (keyAxisOrient === 'top' || keyAxisOrient === 'bottom') {
            attrs.x = d => scales.scaleKey(Helper.getKeyFieldValue(d, keyField, isSegmented)) + margin.left + barSize * barIndex + barDistance * barIndex + barDiff;
            attrs.width = d => barSize;
        }
        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            attrs.y = d => scales.scaleKey(Helper.getKeyFieldValue(d, keyField, isSegmented)) + margin.top + barSize * barIndex + barDistance * barIndex + barDiff;
            attrs.height = d => barSize;
        }
    }
}