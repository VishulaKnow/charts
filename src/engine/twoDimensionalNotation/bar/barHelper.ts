import { AxisScale } from "d3-axis";
import { BarChartSettings, BlockMargin, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Scale, Scales } from "../../features/scale/scale";
import { Helper } from "../../helpers/helper";
import { MdtChartsDataRow, Size } from "../../../config/config";
import { Pipeline } from "../../helpers/pipeline/Pipeline";
import { BaseType, Selection } from "d3-selection";
import { HatchPatternDef } from "../../block/defs/hatchPattern";

export interface BarAttrsHelper {
    x: (dataRow: MdtChartsDataRow) => number;
    y: (dataRow: MdtChartsDataRow) => number;
    width: (dataRow: MdtChartsDataRow) => number;
    height: (dataRow: MdtChartsDataRow) => number;
}

interface BandLikeChartSettingsStore {
    getBandItemSize(): number;
    getBandItemPad(bandItemIndex: number): number;
}

export class DotChartSettingsStore implements BandLikeChartSettingsStore {
    constructor(private readonly canvasConfig: { scaleBandWidth: number; }) { }
    getBandItemSize(): number {
        return this.canvasConfig.scaleBandWidth;
    }

    getBandItemPad(): number {
        return 0;
    }
}

export class BarSettingsStore {
    constructor(private readonly modelSettings: BarChartSettings, private readonly canvasConfig: { scaleBandWidth: number; barsAmount: number }) { }

    getBandItemSize() {
        const barSize = this.getBarStep() > this.modelSettings.maxBarWidth ? this.modelSettings.maxBarWidth : this.getBarStep();
        return barSize;
    }

    getBandItemPad(barIndex: number) {
        const barDiff = (this.getBarStep() - this.getBandItemSize()) * this.canvasConfig.barsAmount / 2; // if bar bigger than maxWidth, diff for x coordinate
        const barPad = this.getBandItemSize() * barIndex + this.modelSettings.barDistance * barIndex + barDiff; // Отступ бара от края. Зависит от количества баров в одной группе и порядке текущего бара
        return barPad;
    }

    private getBarStep() {
        return (this.canvasConfig.scaleBandWidth - this.modelSettings.barDistance * (this.canvasConfig.barsAmount - 1)) / this.canvasConfig.barsAmount; // Space for one bar
    }
}

export class BarHelper {
    public static getGroupedBarAttrs(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueFieldName: string, barIndex: number, barsAmount: number, barSettings: BarChartSettings): BarAttrsHelper {
        const attrs: BarAttrsHelper = {
            x: null,
            y: null,
            width: null,
            height: null
        }

        this.setBarAttrsByKey(attrs, keyAxisOrient, scales.key, margin, keyField, barIndex, new BarSettingsStore(barSettings, { scaleBandWidth: Scale.getScaleBandWidth(scales.key), barsAmount }), false);
        this.setGroupedBarAttrsByValue(attrs, keyAxisOrient, margin, scales.value, valueFieldName);

        return attrs;
    }

    public static getStackedBarAttr(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, barIndex: number, barsAmount: number, barSettings: BarChartSettings): BarAttrsHelper {
        const attrs: BarAttrsHelper = {
            x: null,
            y: null,
            width: null,
            height: null
        }

        this.setBarAttrsByKey(attrs, keyAxisOrient, scales.key, margin, keyField, barIndex, new BarSettingsStore(barSettings, { scaleBandWidth: Scale.getScaleBandWidth(scales.key), barsAmount }), true);
        this.setSegmentedBarAttrsByValue(attrs, keyAxisOrient, scales.value, margin);

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

    static setBarAttrsByKey(attrs: BarAttrsHelper, keyAxisOrient: Orient, scaleKey: AxisScale<any>, margin: BlockMargin, keyField: string, barIndex: number, settingsStore: BandLikeChartSettingsStore, isSegmented: boolean): void {
        if (keyAxisOrient === 'top' || keyAxisOrient === 'bottom') {
            attrs.x = d => scaleKey(Helper.getKeyFieldValue(d, keyField, isSegmented)) + margin.left + settingsStore.getBandItemPad(barIndex);
            attrs.width = d => settingsStore.getBandItemSize();
        }
        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            attrs.y = d => scaleKey(Helper.getKeyFieldValue(d, keyField, isSegmented)) + margin.top + settingsStore.getBandItemPad(barIndex);
            attrs.height = d => settingsStore.getBandItemSize();
        }
    }

    private static setGroupedBarAttrsByValue(attrs: BarAttrsHelper, keyAxisOrient: Orient, margin: BlockMargin, scaleValue: AxisScale<any>, valueFieldName: string): void {
        this.setGroupedBandStartCoordinateAttr(attrs, keyAxisOrient, scaleValue, margin, valueFieldName);

        if (keyAxisOrient === 'top' || keyAxisOrient === 'bottom') {
            attrs.height = this.getBandItemValueStretch(scaleValue, valueFieldName);
        }
        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            attrs.width = this.getBandItemValueStretch(scaleValue, valueFieldName);
        }
    }

    static getBandItemValueStretch(scaleValue: AxisScale<any>, valueFieldName: string): (dataRow: MdtChartsDataRow) => number {
        return d => Math.abs(scaleValue(d[valueFieldName]) - scaleValue(0));
    }

    static setGroupedBandStartCoordinateAttr(attrs: BarAttrsHelper, keyAxisOrient: Orient, scaleValue: AxisScale<any>, margin: BlockMargin, valueFieldName: string) {
        if (keyAxisOrient === 'top') {
            attrs.y = d => scaleValue(Math.min(d[valueFieldName], 0)) + margin.top;
        }
        if (keyAxisOrient === 'bottom') {
            attrs.y = d => scaleValue(Math.max(d[valueFieldName], 0)) + margin.top;
        }
        if (keyAxisOrient === 'left') {
            attrs.x = d => scaleValue(Math.min(d[valueFieldName], 0)) + margin.left;
        }
        if (keyAxisOrient === 'right') {
            attrs.x = d => scaleValue(Math.max(d[valueFieldName], 0)) + margin.left;
        }
    }

    private static setSegmentedBarAttrsByValue(attrs: BarAttrsHelper, keyAxisOrient: Orient, scaleValue: AxisScale<any>, margin: BlockMargin): void {
        if (keyAxisOrient === 'top') {
            attrs.y = d => scaleValue(Math.min(d[1], d[0])) + margin.top;
            attrs.height = d => Math.abs(scaleValue(d[1]) - scaleValue(d[0]));
        }
        if (keyAxisOrient === 'bottom') {
            attrs.y = d => scaleValue(Math.max(d[1], d[0])) + margin.top;
            attrs.height = d => Math.abs(scaleValue(d[1]) - scaleValue(d[0]));
        }
        if (keyAxisOrient === 'left') {
            attrs.x = d => scaleValue(Math.min(d[1], d[0])) + margin.left;
            attrs.width = d => Math.abs(scaleValue(d[1]) - scaleValue(d[0]));
        }
        if (keyAxisOrient === 'right') {
            attrs.x = d => scaleValue(Math.max(d[1], d[0])) + margin.left;
            attrs.width = d => Math.abs(scaleValue(d[1]) - scaleValue(d[0]));
        }
    }
}

export function onBarChartInit(createBarPipeline: Pipeline<Selection<SVGRectElement, any, BaseType, any>, TwoDimensionalChartModel>) {
    createBarPipeline.push(hatchBar);
}

function hatchBar(bars: Selection<SVGRectElement, any, BaseType, any>, chart: TwoDimensionalChartModel) {
    if (chart.barViewOptions.hatch.on) bars.style("mask", HatchPatternDef.getMaskValue());
    return bars;
}