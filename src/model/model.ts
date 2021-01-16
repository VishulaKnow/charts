import { Color } from "d3";
import { ChartOrientation, IntervalChartType, LegendPosition, PolarChartType, TwoDimensionalChartType } from "../config/config";
import { DataType, Formatter } from "../designer/designerConfig";

export type Orient = 'top' | 'bottom' | 'left' | 'right';
export type ScaleKeyType = 'band' | 'point';
export type ScaleValueType = 'linear' | 'datetime';
export type DataOptions = {
    [option: string]: any
}
export type DataRow = {
    [field: string]: any
}

export interface DataSource {
    [source: string]: DataRow[];
}

export interface BlockCanvas {
    size: Size;
    class: string;
}

export interface Size {
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

export interface ScaleKeyModel {
    domain: any[];
    range: RangeModel;
    type: ScaleKeyType;
}

export interface ScaleValueModel {
    domain: any[];
    range: RangeModel;
    type: ScaleValueType;
}

export interface RangeModel {
    start: number;
    end: number;
}

export interface AxisModelOptions {
    orient: Orient;
    translate: TranslateModel;
    class: string;
    maxLabelSize: number;
}

export interface DataFormat {
    formatters: Formatter;
}
export interface DataSettings {
    scope: DataScope;
}
export interface DataScope {
    hidedRecordsAmount: number;
    allowableKeys: string[];
}
export interface TwoDimensionalOptionsModel {
    type: '2d';
    scale: ScaleModel;
    axis: AxisModel;
    charts: TwoDimensionalChartModel[];
    additionalElements: AdditionalElementsOptions;
}
export interface IntervalOptionsModel {
    type: 'interval';
    scale: ScaleModel;
    axis: AxisModel;
    charts: IntervalChartModel[];
    additionalElements: AdditionalElementsOptions;
}
export interface AdditionalElementsOptions {
    gridLine: GridLineOptions;
}
export interface GridLineOptions {
    flag: GridLineFlag;
}
export interface GridLineFlag {
    key: boolean;
    value: boolean;
}
export interface PolarOptionsModel {
    type: 'polar';
    charts: PolarChartModel[];
}
export interface PolarChartAppearanceModel {
    innerRadius: number;
    padAngle: number
}

export interface TwoDimensionalChartModel {
    type: TwoDimensionalChartType;
    orient: ChartOrientation;
    data: ChartDataModel;
    legend: LegendModel;
    tooltip: TooltipModel;
    cssClasses: string[];
    elementColors: Color[];
}
export interface IntervalChartModel {
    type: IntervalChartType;
    orient: ChartOrientation;
    data: IntervalChartDataModel;
    legend: LegendModel;
    tooltip: TooltipModel;
    cssClasses: string[];
    elementColors: Color[];
}
export interface PolarChartModel {
    type: PolarChartType;
    data: ChartDataModel;
    appearanceOptions: PolarChartAppearanceModel;
    legend: LegendModel;
    tooltip: TooltipModel;
    cssClasses: string[];
    elementColors: Color[];
}
export interface Model {
    blockCanvas: BlockCanvas;
    chartBlock: ChartBlock;
    legendBlock: LegendBlockModel;
    options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel;
    dataSettings: DataSettings;
    chartSettings: ChartSettings;
    dataFormat: DataFormat;
}

export interface Field {
    name: string;
    format: DataType;
}

export interface ChartSettings {
    bar: BarChartSettings;
}

export interface LegendBlockModel {
    top: LegendBlockCanvas;
    bottom: LegendBlockCanvas;
    left: LegendBlockCanvas;
    right: LegendBlockCanvas;
}

interface AxisModel {
    keyAxis: AxisModelOptions;
    valueAxis: AxisModelOptions;
}

interface ScaleModel {
    scaleKey: ScaleKeyModel;
    scaleValue: ScaleValueModel;
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

interface LegendModel {
    position: LegendPosition;
}

interface ChartDataModel {
    dataSource: string;
    keyField: Field;
    valueField: Field;
}

interface IntervalChartDataModel {
    dataSource: string;
    keyField: Field;
    valueField1: Field;
    valueField2: Field;
}

interface BarChartSettings {
    groupDistance: number;
    barDistance: number;
}

interface LegendBlockCanvas {
    size: number;
}
