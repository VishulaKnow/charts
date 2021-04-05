import { ChartOrientation, IntervalChartType, PolarChartType, Size, TwoDimensionalChartType } from "../config/config";
import { DataType, DonutOptionsCanvas, Formatter, TooltipOptions, Transitions } from "../designer/designerConfig";

type AxisType = 'key' | 'value';

export type Orient = 'top' | 'bottom' | 'left' | 'right';
export type ScaleKeyType = 'band' | 'point';
export type ScaleValueType = 'linear' | 'datetime';
export type AxisLabelPosition = 'straight' | 'rotated';
export type LegendPosition = 'off' | 'top' | 'bottom' | 'left' | 'right';
export type EmbeddedLabelTypeModel = 'none' | 'key' | 'value';
export type DataOptions = {
    [option: string]: any
}
export type DataRow = {
    [field: string]: any
}

export interface DataSource {
    [source: string]: DataRow[];
}

export interface Model {
    blockCanvas: BlockCanvas;
    chartBlock: ChartBlock;
    options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel;
    otherComponents: OtherComponents;
    dataSettings: DataSettings;
    chartSettings: ChartElementsSettings;
    transitions?: Transitions;
}


//====================================================== Canvas
export interface BlockCanvas {
    size: Size;
    cssClass: string;
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


//====================================================== Options
interface OptionsModel {
    legend: ILegendModel;
    data: OptionsModelData;
    title: string;
    selectable: boolean;
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


//====================================================== Options Model Common
export interface ILegendModel {
    position: LegendPosition;
}
export interface OptionsModelData {
    dataSource: string;
    keyField: Field;
}
export interface Field {
    name: string;
    format: DataType;
}


//====================================================== TwoDimensionalOptionsModel & IntervalOptionsModel
export interface IScaleModel {
    key: ScaleKeyModel;
    value: ScaleValueModel;
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

export interface IAxisModel {
    key: AxisModelOptions;
    value: AxisModelOptions;
}
export interface AxisModelOptions {
    visibility: boolean;
    type: AxisType;
    orient: Orient;
    translate: TranslateModel;
    cssClass: string;
    ticks: AxisTicksModel;
    labels: AxisLabelModel;
}
interface TranslateModel {
    translateX: number;
    translateY: number;
}
interface AxisTicksModel {
    flag: boolean;
}
export interface AxisLabelModel {
    maxSize: number;
    position: AxisLabelPosition;
    visible: boolean;
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


//====================================================== Charts
interface ChartModel {
    tooltip: TooltipModel;
    cssClasses: string[];
    style: ChartStyle;
}
interface TooltipModel {
    show: boolean;
}
export interface ChartStyle {
    elementColors: string[];
    opacity: number;
}

export interface TwoDimensionalChartModel extends ChartModel {
    type: TwoDimensionalChartType;
    data: TwoDimensionalChartDataModel;
    index: number;
    embeddedLabels: EmbeddedLabelTypeModel;
    isSegmented: boolean;
    markersOptions: MarkersOptions;
}
export interface IntervalChartModel extends ChartModel {
    type: IntervalChartType;
    data: IntervalChartDataModel;
}
export interface PolarChartModel extends ChartModel {
    type: PolarChartType;
    data: PolarChartDataModel;
}


//====================================================== TwoDimensionalChartModel
export interface TwoDimensionalChartDataModel {
    valueFields: ValueField[];
}
export interface ValueField extends Field {
    title: string;
}

export interface MarkersOptions {
    show: boolean;
}


//====================================================== IntervalChartModel
interface IntervalChartDataModel {
    valueField1: Field;
    valueField2: Field;
}


//====================================================== PolarChartModel
interface PolarChartDataModel {
    valueField: ValueField;
}


//====================================================== DataSettings
export interface DataSettings {
    scope: DataScope;
    format: DataFormat;
}
export interface DataScope {
    hidedRecordsAmount: number;
    allowableKeys: string[];
}
export interface DataFormat {
    formatters: Formatter;
}


//====================================================== ChartElementsSettings
export interface ChartElementsSettings {
    bar: BarChartSettings;
    donut: DonutChartSettings;
}
export interface BarChartSettings {
    groupMaxDistance: number;
    groupMinDistance: number;
    barDistance: number;
    maxBarWidth: number;
    minBarWidth: number;
}
export interface DonutChartSettings extends DonutOptionsCanvas { }


//====================================================== OtherComponents
export interface OtherComponents {
    legendBlock: LegendBlockModel;
    titleBlock: TitleBlockModel;
    tooltipBlock: TooltipOptions;
}
interface ComponentBlockModel {
    margin: BlockMargin;
    size: number;
    pad: number;
}
export interface LegendBlockModel {
    coordinate: LegendCoordinate;
    standartTooltip: boolean;
}
export interface LegendCoordinate {
    top: LegendCanvasCoordinate;
    bottom: LegendCanvasCoordinate;
    left: LegendCanvasCoordinate;
    right: LegendCanvasCoordinate;
}

export interface TitleBlockModel extends ComponentBlockModel { }
interface LegendCanvasCoordinate extends ComponentBlockModel { }