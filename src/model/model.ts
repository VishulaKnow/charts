import { Color } from "d3";

type Orient = 'top' | 'bottom' | 'left' | 'right'
export type DataType = 'integer' | 'decimal' | 'date' | 'money' | 'string';
export type DataOptions = {
    [option: string]: any
}

export interface BlockCanvas {
    size: Size;
    class: string;
}
interface Size {
    width: number;
    height: number;
}

export interface ChartBlock {
    margin: BlockMargin;
}
export interface BlockMargin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

interface ScaleModel {
    scaleKey: ScaleOptions;
    scaleValue: ScaleOptions;
}
interface ScaleOptions {
    domain: any[];
    range: RangeModel;
}
interface RangeModel {
    start: number;
    end: number;
}

interface AxisModel {
    keyAxis: AxisModelOptions;
    valueAxis: AxisModelOptions;
}
interface AxisModelOptions {
    orient: Orient;
    translate: TranslateModel;
    class: string;
    maxLabelSize: number;
}
interface TranslateModel {
    translateX: number;
    translateY: number;
}

interface TooltipModel {
    data: TooltipDataModel;
}
interface TooltipDataModel {
    fields: Field[];
}

export interface TwoDimensionalChartModel {
    type: 'bar' | 'line' | 'area';
    orient: 'vertical' | 'horizontal';
    data: ChartDataModel;
    legend: LegendModel;
    tooltip: TooltipModel;
    cssClasses: string[];
    elementColors: Color[];
}
export interface PolarChartModel {
    type: 'donut';
    data: ChartDataModel;
    appearanceOptions: PolarChartAppearanceModel;
    legend: LegendModel;
    tooltip: TooltipModel;
    cssClasses: string[];
    elementColors: Color[];
}
interface LegendModel {
    position: 'off' | 'top' | 'bottom' | 'right' | 'left';
}
export interface Model {
    blockCanvas: BlockCanvas;
    chartBlock: ChartBlock;
    legendBlock: LegendBlockModel;
    options: TwoDimensionalOptionsModel | PolarOptionsModel;
    dataSettings: DataSettings;
    chartSettings: ChartSettings;
    dataFormat: DataFormat;
}
export interface DataFormat {
    formatters: {
        [type: string]: (options: DataOptions, value: any) => string
    }
}
export interface DataSettings {
    allowableKeys: string[];
}
export interface TwoDimensionalOptionsModel {
    type: '2d';
    scale: ScaleModel;
    axis: AxisModel;
    charts: TwoDimensionalChartModel[];
}
export interface PolarOptionsModel {
    type: 'polar';
    charts: PolarChartModel[];
}
interface PolarChartAppearanceModel {
    innerRadius: number;
    padAngle: number
}
interface ChartDataModel {
    dataSource: string;
    keyField: Field;
    valueField: Field;
}
interface Field {
    name: string;
    format: DataType;
}

export interface ChartSettings {
    bar: BarChartSettings;
}

interface BarChartSettings {
    groupDistance: number;
    barDistance: number;
}

export interface LegendBlockModel {
    top: LegendBlockCanvas;
    bottom: LegendBlockCanvas;
    left: LegendBlockCanvas;
    right: LegendBlockCanvas;
}

interface LegendBlockCanvas {
    size: number;
}
