import { AxisScale } from "d3-axis";
import { BarChartSettings, BlockMargin, DataRow, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Scale, Scales } from "../../features/scale/scale";
import { Helper } from "../../helpers/helper";
import { Size } from "../../../config/config";

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

        this.setBarAttrsByKey(attrs, keyAxisOrient, scales.key, margin, keyField, barIndex, barsAmount, barSettings, false);
        this.setGroupedBarAttrsByValue(attrs, keyAxisOrient, margin, scales.value, valueFieldName, blockSize);

        return attrs;
    }

    public static getStackedBarAttr(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, blockSize: Size, barIndex: number, barsAmount: number, barSettings: BarChartSettings): BarAttrsHelper {
        const attrs: BarAttrsHelper = {
            x: null,
            y: null,
            width: null,
            height: null
        }

        this.setBarAttrsByKey(attrs, keyAxisOrient, scales.key, margin, keyField, barIndex, barsAmount, barSettings, true);
        this.setSegmentedBarAttrsByValue(attrs, keyAxisOrient, scales.value, margin, blockSize);

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

    private static setBarAttrsByKey(attrs: BarAttrsHelper, keyAxisOrient: Orient, scaleKey: AxisScale<any>, margin: BlockMargin, keyField: string, barIndex: number, barsAmount: number, barSettings: BarChartSettings, isSegmented: boolean): void {
        const barStep = (Scale.getScaleBandWidth(scaleKey) - barSettings.barDistance * (barsAmount - 1)) / barsAmount; // Space for one bar
        const barSize = barStep > barSettings.maxBarWidth ? barSettings.maxBarWidth : barStep;
        const barDiff = (barStep - barSize) * barsAmount / 2; // if bar bigger than maxWidth, diff for x coordinate
        const barPad = barSize * barIndex + barSettings.barDistance * barIndex + barDiff; // Отступ бара от края. Зависит от количества баров в одной группе и порядке текущего бара

        if (keyAxisOrient === 'top' || keyAxisOrient === 'bottom') {
            attrs.x = d => scaleKey(Helper.getKeyFieldValue(d, keyField, isSegmented)) + margin.left + barPad;
            attrs.width = d => barSize;
        }
        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            attrs.y = d => scaleKey(Helper.getKeyFieldValue(d, keyField, isSegmented)) + margin.top + barPad;
            attrs.height = d => barSize;
        }
    }

    private static setGroupedBarAttrsByValue(attrs: BarAttrsHelper, keyAxisOrient: Orient, margin: BlockMargin, scaleValue: AxisScale<any>, valueFieldName: string, blockSize: Size): void {
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

    private static setSegmentedBarAttrsByValue(attrs: BarAttrsHelper, keyAxisOrient: Orient, scaleValue: AxisScale<any>, margin: BlockMargin, blockSize: Size): void {
        if (keyAxisOrient === 'top') {
            attrs.y = d => margin.top + scaleValue(d[0]);
            attrs.height = d => Helper.getValueOrZero(scaleValue(d[1] - d[0]));
        }
        if (keyAxisOrient === 'bottom') {
            attrs.y = d => scaleValue(d[1]) + margin.top;
            attrs.height = d => Helper.getValueOrZero(blockSize.height - margin.top - margin.bottom - scaleValue(d[1] - d[0]));
        }
        if (keyAxisOrient === 'left') {
            attrs.x = d => margin.left + scaleValue(d[0]) + 1;
            attrs.width = d => Helper.getValueOrZero(scaleValue(d[1] - d[0]));
        }
        if (keyAxisOrient === 'right') {
            attrs.x = d => scaleValue(d[1]) + margin.left;
            attrs.width = d => Helper.getValueOrZero(blockSize.width - margin.left - margin.right - scaleValue(d[1] - d[0]));
        }
    }
}