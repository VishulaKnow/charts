import { Color } from "d3";
import { ChartOrientation, IntervalChartType, LegendPosition, PolarChartType, TwoDimensionalChartType } from "../config/config";
import { DataType, Formatter } from "../designer/designerConfig";

export type Orient = 'top' | 'bottom' | 'left' | 'right';
export type ScaleKeyType = 'band' | 'point';
export type ScaleValueType = 'linear' | 'datetime';
type AxisType = 'key' | 'value';
export type AxisLabelPosition = 'straight' | 'rotated';
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
    cssClass: string;
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
    type: AxisType;
    orient: Orient;
    translate: TranslateModel;
    cssClass: string;
    maxLabelSize: number;
    ticks: AxisTicksModel;
    labelPositition: AxisLabelPosition;
}

interface AxisTicksModel {
    flag: boolean;
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
    scale: IScaleModel;
    axis: IAxisModel;
    charts: TwoDimensionalChartModel[];
    additionalElements: AdditionalElementsOptions;
    legend: LegendModel;
    orient: ChartOrientation;
    isSegmented: boolean;
}
export interface IntervalOptionsModel {
    type: 'interval';
    scale: IScaleModel;
    axis: IAxisModel;
    charts: IntervalChartModel[];
    additionalElements: AdditionalElementsOptions;
    legend: LegendModel;
    orient: ChartOrientation;
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
    legend: LegendModel;
}
export interface PolarChartAppearanceModel {
    innerRadius: number;
    padAngle: number
}

interface ChartModel {
    tooltip: TooltipModel;
    cssClasses: string[];
    elementColors: Color[];
    title: string;
}

export interface TwoDimensionalChartModel extends ChartModel {
    index: number;
    type: TwoDimensionalChartType;
    data: TwoDimensionalChartDataModel;
}
export interface IntervalChartModel extends ChartModel {
    type: IntervalChartType;
    data: IntervalChartDataModel;
}
export interface PolarChartModel extends ChartModel {
    type: PolarChartType;
    data: PolarChartDataModel;
    appearanceOptions: PolarChartAppearanceModel;
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

export interface TwoDimensionalValueField extends Field {
    title: string;
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

export interface IAxisModel {
    keyAxis: AxisModelOptions;
    valueAxis: AxisModelOptions;
}

export interface IScaleModel {
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

interface TwoDimensionalChartDataModel {
    dataSource: string;
    keyField: Field;
    valueField: TwoDimensionalValueField[];
}

interface PolarChartDataModel {
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

export interface BarChartSettings {
    groupDistance: number;
    barDistance: number;
    barMaxSize: number;
}

interface LegendBlockCanvas {
    size: number;
    margin: BlockMargin;
}
