import {
    ChartOrientation,
    MdtChartsColorField,
    IntervalChartType,
    PolarChartType,
    Size,
    TooltipOptions,
    TwoDimensionalChartType,
    AxisLabelPosition,
    ShowTickFn,
} from "../config/config";
import { DataType, DonutOptionsCanvas, Formatter, StaticLegendBlockCanvas, TooltipSettings, Transitions } from "../designer/designerConfig";

type AxisType = "key" | "value";

export type Orient = "top" | "bottom" | "left" | "right";
export type ScaleKeyType = "band" | "point";
export type ScaleValueType = "linear" | "datetime";
export type LegendPosition = "off" | "top" | "bottom" | "left" | "right";
export type EmbeddedLabelTypeModel = "none" | "key" | "value";
export type DataOptions = {
    [option: string]: any;
};
export type UnitsFromConfig = "%" | "px";

export type OptionsModel = TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel;

export interface Model<O = OptionsModel> {
    blockCanvas: BlockCanvas;
    chartBlock: ChartBlockModel;
    options: O;
    otherComponents: OtherCommonComponents;
    dataSettings: DataSettings;
    transitions?: Transitions;
}

//====================================================== Canvas
export interface BlockCanvas {
    size: Size;
    cssClass: string;
}

export interface ChartBlockModel {
    margin: BlockMargin;
}
export interface BlockMargin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

//====================================================== Options
interface BasicOptionsModel {
    tooltip: TooltipOptions;
}
interface GraphicNotationOptionsModel extends BasicOptionsModel {
    legend: ILegendModel;
    data: OptionsModelData;
    title: string;
    selectable: boolean;
}
export interface TwoDimensionalOptionsModel extends GraphicNotationOptionsModel {
    type: "2d";
    scale: IScaleModel;
    axis: IAxisModel;
    charts: TwoDimensionalChartModel[];
    additionalElements: AdditionalElementsOptions;
    orient: ChartOrientation;
    chartSettings: TwoDimChartElementsSettings;
}
export interface PolarOptionsModel extends GraphicNotationOptionsModel {
    type: "polar";
    charts: PolarChartModel[];
    chartCanvas: DonutChartSettings;
}
export interface IntervalOptionsModel extends GraphicNotationOptionsModel {
    type: "interval";
    scale: IScaleModel;
    axis: IAxisModel;
    charts: IntervalChartModel[];
    additionalElements: AdditionalElementsOptions;
    orient: ChartOrientation;
    chartSettings: TwoDimChartElementsSettings;
}

//====================================================== Options Model Common
export interface ILegendModel {
    position: LegendPosition;
}
export interface BasicOptionsModelData {
    dataSource: string;
}
export interface OptionsModelData extends BasicOptionsModelData {
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
    formatter: ((v: number) => string) | null;
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
export interface TranslateModel {
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
    defaultTooltip: boolean;
    showTick: ShowTickFn;
    linearTickStep: number;
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

export interface TwoDimChartElementsSettings {
    bar: BarChartSettings;
    lineLike: LineLikeChartSettings;
}
export interface BarChartSettings {
    groupMaxDistance: number;
    groupMinDistance: number;
    barDistance: number;
    maxBarWidth: number;
    minBarWidth: number;
}
export interface LineLikeChartSettings {
    shape: LineLikeChartShapeOptions;
}

export interface LineLikeChartShapeOptions {
    curve: LineLikeChartCurveOptions;
}

export interface LineLikeChartDashOptions {
    on: boolean;
    dashSize: number;
    gapSize: number;
}

export enum LineCurveType {
    monotoneX,
    monotoneY,
    basis,
    none
}

interface LineLikeChartCurveOptions {
    type: LineCurveType;
}

interface BarLikeChartHatchOptions {
    on: boolean;
}

//====================================================== PolarOptionsModel
export interface DonutChartSettings extends Omit<DonutOptionsCanvas, "aggregatorPad" | "thickness"> {
    aggregator: DonutAggregatorModel;
    thickness: DonutThicknessOptions;
}
export interface DonutAggregatorModel {
    margin: number;
    content: DonutAggregatorContent;
}
export interface DonutAggregatorContent {
    value: string | number;
    title: string;
}

export type DonutThicknessUnit = UnitsFromConfig;
export interface DonutThicknessOptions {
    min: number;
    max: number;
    value: number;
    unit: DonutThicknessUnit;
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

export interface ChartLegendModel {
    markerShape: LegendMarkerShape;
    barViewOptions: TwoDimensionalChartLegendBarModel;
    lineViewOptions: TwoDimensionalChartLegendLineModel;
}

export type LegendMarkerShape = "default" | "bar" | "line";

export interface TwoDimensionalChartLegendBarModel extends TwoDimensionalBarLikeChartViewModel {
    width: number;
}

export interface TwoDimensionalChartLegendLineModel extends TwoDimensionalLineLikeChartViewModel {
    width: number;
}

interface TwoDimensionalLineLikeChartModel {
    lineViewOptions: TwoDimensionalLineLikeChartViewModel;
    markersOptions: MarkersOptions;
}

interface TwoDimensionalLineLikeChartViewModel {
    dashedStyles: LineLikeChartDashOptions;
}

interface TwoDimensionalBarLikeChartModel {
    barViewOptions: TwoDimensionalBarLikeChartViewModel;
}

interface TwoDimensionalBarLikeChartViewModel {
    hatch: BarLikeChartHatchOptions;
}

export interface TwoDimensionalChartModel extends ChartModel, TwoDimensionalLineLikeChartModel, TwoDimensionalBarLikeChartModel {
    type: TwoDimensionalChartType;
    data: TwoDimensionalChartDataModel;
    index: number;
    embeddedLabels: EmbeddedLabelTypeModel;
    isSegmented: boolean;
    legend: ChartLegendModel;
}
export interface IntervalChartModel extends Omit<ChartModel, "legend"> { //TODO: remove
    type: IntervalChartType;
    data: IntervalChartDataModel;
}
export interface PolarChartModel extends ChartModel {
    type: PolarChartType;
    data: PolarChartDataModel;
    legend: ChartLegendModel;
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
    styles: MarkersStyleOptions;
}

export interface MarkersStyleOptions {
    highlighted: MarkerStyle;
    normal: MarkerStyle;
}

interface MarkerStyle {
    size: MarkersBaseSizeOptions;
}

interface MarkersBaseSizeOptions {
    radius: number;
    borderSize: string;
}

//====================================================== IntervalChartModel
interface IntervalChartDataModel {
    valueField1: ValueField;
    valueField2: ValueField;
}

//====================================================== PolarChartModel
export interface PolarChartDataModel {
    valueField: ValueField;
    colorField?: MdtChartsColorField;
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

//====================================================== OtherComponents
export interface OtherCommonComponents {
    legendBlock: LegendBlockModel;
    titleBlock: TitleBlockModel;
    tooltipBlock: TooltipSettings;
}
interface ComponentBlockModel {
    margin: BlockMargin;
    size: number;
    pad: number;
}
export interface LegendBlockModel {
    coordinate: LegendCoordinate;
    static: StaticLegendBlockCanvas;
}
export interface LegendCoordinate {
    top: LegendCanvasCoordinate;
    bottom: LegendCanvasCoordinate;
    left: LegendCanvasCoordinate;
    right: LegendCanvasCoordinate;
}

export interface TitleBlockModel extends ComponentBlockModel { }
interface LegendCanvasCoordinate extends ComponentBlockModel { }
