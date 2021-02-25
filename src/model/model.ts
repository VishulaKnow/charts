import { Color } from "d3-color";
import { ChartOrientation, IntervalChartType, PolarChartType, TwoDimensionalChartType } from "../config/config";
import { DataType, Formatter } from "../designer/designerConfig";

export type Orient = 'top' | 'bottom' | 'left' | 'right';
export type ScaleKeyType = 'band' | 'point';
export type ScaleValueType = 'linear' | 'datetime';
export type AxisLabelPosition = 'straight' | 'rotated';
export type LegendPosition = 'off' | 'top' | 'bottom' | 'left' | 'right';
export type DataOptions = {
    [option: string]: any
}
export type DataRow = {
    [field: string]: any
}
export type EmbeddedLabelTypeModel = 'none' | 'key' | 'value';
type AxisType = 'key' | 'value';

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
    elementsAmount: number;
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
    ticks: AxisTicksModel;
    labels: AxisLabelModel;
}

export interface AxisLabelModel {
    maxSize: number;
    positition: AxisLabelPosition;
    visible: boolean;
}

interface AxisTicksModel {
    flag: boolean;
}

export interface DataFormat {
    formatters: Formatter;
}
export interface DataSettings {
    scope: DataScope;
    format: DataFormat;
}
export interface DataScope {
    hidedRecordsAmount: number;
    allowableKeys: string[];
}
interface OptionsModel {
    legend: ILegendModel;
    data: OptionsModelData;
}
export interface TwoDimensionalOptionsModel extends OptionsModel {
    type: '2d';
    scale: IScaleModel;
    axis: IAxisModel;
    charts: TwoDimensionalChartModel[];
    additionalElements: AdditionalElementsOptions;
    orient: ChartOrientation;
}
export interface PolarOptionsModel extends OptionsModel {
    type: 'polar';
    charts: PolarChartModel[];
}
export interface IntervalOptionsModel extends OptionsModel {
    type: 'interval';
    scale: IScaleModel;
    axis: IAxisModel;
    charts: IntervalChartModel[];
    additionalElements: AdditionalElementsOptions;
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
export interface DonutChartSettings {
    maxThickness: number;
    minThickness: number;
    padAngle: number;
}

interface ChartModel {
    title: string;
    tooltip: TooltipModel;
    cssClasses: string[];
    style: ChartStyle;
}

export interface ChartStyle {
    elementColors: Color[];
    opacity: number;
}

export interface TwoDimensionalChartModel extends ChartModel {
    index: number;
    type: TwoDimensionalChartType;
    data: TwoDimensionalChartDataModel;
    embeddedLabels: EmbeddedLabelTypeModel;
    isSegmented: boolean;
}
export interface IntervalChartModel extends ChartModel {
    type: IntervalChartType;
    data: IntervalChartDataModel;
}
export interface PolarChartModel extends ChartModel {
    type: PolarChartType;
    data: PolarChartDataModel;
}
export interface Model {
    blockCanvas: BlockCanvas;
    chartBlock: ChartBlock;
    otherComponents: OtherComponents;
    options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel;
    dataSettings: DataSettings;
    chartSettings: ChartSettings;
}

export interface OtherComponents {
    legendBlock: LegendBlockModel;
    titleBlock: TitleBlockModel;
}
export interface TitleBlockModel {
    margin: BlockMargin;
    size: number;
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
    donut: DonutChartSettings;
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
    show: boolean;
}

interface TooltipDataModel {
    fields: Field[];
}

export interface ILegendModel {
    position: LegendPosition;
}

export interface OptionsModelData {
    dataSource: string;
    keyField: Field;
}

export interface TwoDimensionalChartDataModel {
    valueFields: TwoDimensionalValueField[];
}

interface PolarChartDataModel {
    valueField: Field;
}

interface IntervalChartDataModel {
    valueField1: Field;
    valueField2: Field;
}

export interface BarChartSettings {
    groupMaxDistance: number;
    groupMinDistance: number;
    barDistance: number;
    maxBarWidth: number;
    minBarWidth: number;
}

interface LegendBlockCanvas {
    size: number;
    margin: BlockMargin;
}
