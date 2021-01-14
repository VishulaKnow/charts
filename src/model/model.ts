import { Color } from "d3";
import { ChartOrientation, LegendPosition, TwoDimensionalChartType } from "../config/config";
import { DataType, Formatter } from "../designer/designerConfig";

export type Orient = 'top' | 'bottom' | 'left' | 'right';
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

interface ScaleModel {
    scaleKey: ScaleOptions;
    scaleValue: ScaleOptions;
}
export interface ScaleOptions {
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
export interface AxisModelOptions {
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
    type: TwoDimensionalChartType;
    orient: ChartOrientation;
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
    position: LegendPosition;
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
    additionalElements: TwoDimensionalAdditionalElementsOptions
}
export interface TwoDimensionalAdditionalElementsOptions {
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
interface ChartDataModel {
    dataSource: string;
    keyField: Field;
    valueField: Field;
}
export interface Field {
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
