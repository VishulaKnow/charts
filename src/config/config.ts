type DataType = string;
export type MdtChartsIconElement = () => HTMLElement;

export type AxisPosition = 'start' | 'end';
export type ChartOrientation = 'vertical' | 'horizontal';
export type ChartNotation = '2d' | 'polar' | 'interval';
export type ChartType = 'bar' | 'line' | 'area' | 'donut' | 'gantt';
export type TwoDimensionalChartType = 'line' | 'bar' | 'area';
export type PolarChartType = 'donut';
export type IntervalChartType = 'gantt';
export type EmbeddedLabelType = 'none' | 'key' | 'value';
export type MdtChartsDataRow = {
    [field: string]: any
}

export type MdtChartsColorName = string;
export interface MdtChartsColorRangeItem {
    color: MdtChartsColorName;
    value?: number;
}

export interface MdtChartsDataSource {
    [source: string]: MdtChartsDataRow[];
}
export type AxisLabelPosition = "straight" | "rotated";

export type MdtChartsConfigOptions = MdtChartsPolarOptions | MdtChartsTwoDimensionalOptions | MdtChartsIntervalOptions;
export interface MdtChartsConfig {
    canvas: ChartBlockCanvas;
    options: MdtChartsConfigOptions;
}


//====================================================== ChartBlockCanvas
export interface ChartBlockCanvas {
    size: Size;
    class: string;
}
export interface Size {
    width: number;
    height: number;
}
export interface NewSize {
    width?: number;
    height?: number;
}


//====================================================== Options
interface BasicOptions {
    tooltip?: TooltipOptions;
    data: MdtChartsBasicDataOptions;
}

interface GraphicNotationOptions extends BasicOptions {
    data: DataOptions;
    legend: Legend;
    title?: Title;
    selectable: boolean;
}

export interface MdtChartsTwoDimensionalOptions extends GraphicNotationOptions {
    type: '2d';
    axis: TwoDimensionalAxis;
    additionalElements: AdditionalElements;
    charts: MdtChartsTwoDimensionalChart[];
    orientation: ChartOrientation;
}

export interface MdtChartsPolarOptions extends GraphicNotationOptions {
    type: 'polar';
    chart: PolarChart;
}

export interface MdtChartsIntervalOptions extends GraphicNotationOptions {
    type: 'interval';
    axis: IntervalAxis;
    chart: IntervalChart;
    additionalElements: AdditionalElements;
    orientation: ChartOrientation;
}


//====================================================== Options
export interface Legend {
    show: boolean;
}
export interface TitleFunctionParams {
    data: MdtChartsDataRow[]
}

export interface TitleFunction {
    (params: TitleFunctionParams): string;
}

export type Title = string | TitleFunction;

export interface MdtChartsBasicDataOptions {
    dataSource: string;
}

export interface DataOptions {
    dataSource: string;
    keyField: MdtChartsField;
    maxRecordsAmount?: number;
}

export type MdtChartsFieldName = string;

export interface MdtChartsField {
    name: MdtChartsFieldName;
    format: DataType;
}

export interface MdtChartsValueField extends MdtChartsField {
    title: string;
}

export interface TwoDimValueField extends MdtChartsValueField {
    color?: string;
}

export interface TooltipOptions {
    html?: TooltipHtml;
    aggregator?: TooltipAggregator
    formatValue?: TooltipFormatValue
}

export type TooltipHtml = (dataRow: MdtChartsDataRow) => string;

export interface TooltipAggregator {
    content: (options: { row: MdtChartsDataRow }) => TooltipAggregatorContent;
    position?: "underKey" | "underValues";
}

export type TooltipAggregatorContent =
  | { type: "plainText", textContent: string; }
  | { type: "captionValue", caption: string; value: any; };

export type TooltipFormatValue = (params: { rawValue: number | null | undefined; autoFormattedValue: string }) => string


//====================================================== TwoDimensionalOptions & IntervalOptions
export interface AdditionalElements {
    gridLine: GridLineOptions;
}

interface GridLineOptions {
    flag: GridLineFlag;
}

interface GridLineFlag {
    key: boolean;
    value: boolean;
}


//====================================================== TwoDimensionalOptions
export interface TwoDimensionalAxis {
    key: DiscreteAxisOptions;
    value: NumberAxisOptions;
}

export interface AxisOptions {
    visibility: boolean;
    position: AxisPosition;
    ticks: AxisTicks;
}

interface AxisTicks {
    flag: boolean;
}

export interface NumberAxisOptions extends AxisOptions {
    domain: AxisNumberDomain;
    labels?: NumberAxisLabel;
}

export interface NumberDomain {
    start: number;
    end: number;
}

export interface AxisDomainFunctionParams {
    data: MdtChartsDataRow[]
}

export type AxisDomainFunction = (params: AxisDomainFunctionParams) => NumberDomain;

export type AxisNumberDomain = NumberDomain | AxisDomainFunction

export interface NumberAxisLabel {
    format: (v: number) => string;
    stepSize?: number;
}

export type AxisLabelFormatter = (v: number) => string;

export interface DiscreteAxisOptions extends AxisOptions {
    labels?: MdtChartsDiscreteAxisLabel;
}

export interface MdtChartsDiscreteAxisLabel {
    position?: AxisLabelPosition;
    showRule?: MdtChartsShowAxisLabelRule;
}

export type ShowTickFn = (dataKey: string, index: number) => string | undefined;

export interface MdtChartsShowAxisLabelRule {
    spaceForOneLabel?: number;
    showTickFn?: ShowTickFn;
}


//====================================================== IntervalOptions
export interface IntervalAxis {
    key: DiscreteAxisOptions;
    value: DateAxisOptions;
}

interface DateAxisOptions extends AxisOptions { }

//====================================================== Charts
interface ChartSettings {
    tooltip: Tooltip;
}

interface Tooltip {
    show: boolean;
}

interface MdtChartsLineLikeChart {
    markers: MarkersOptions;
    lineStyles?: MdtChartsLineLikeChartStyles;
}

export interface MdtChartsLineLikeChartStyles {
    dash?: MdtChartsLineLikeChartDashedStyles;
}

export interface MdtChartsLineLikeChartDashedStyles {
    on: boolean;
    dashSize?: number;
    gapSize?: number;
}

interface MdtChartsBarLikeChart {
    barStyles?: MdtChartsBarLikeChartStyles;
}

interface MdtChartsBarLikeChartStyles {
    hatch?: MdtChartsBarLikeChartHatchedStyles;
}

interface MdtChartsBarLikeChartHatchedStyles {
    on: boolean;
}

export interface MdtChartsTwoDimensionalChart extends ChartSettings, MdtChartsLineLikeChart, MdtChartsBarLikeChart {
    type: TwoDimensionalChartType;
    data: TwoDimensionalChartData;
    embeddedLabels: EmbeddedLabelType;
    isSegmented: boolean;
}

export interface PolarChart extends ChartSettings {
    type: PolarChartType;
    data: PolarChartData;
    aggregator?: MdtChartsDonutAggregator;
}

export interface IntervalChart extends ChartSettings {
    type: IntervalChartType;
    data: IntervalChartData;
}


//====================================================== TwoDimensionalChart
export interface TwoDimensionalChartData {
    valueFields: TwoDimValueField[];
}

interface MarkersOptions {
    show: boolean;
}

//====================================================== PolarChart
export type MdtChartsColorField = string;
export interface PolarChartData {
    valueField: MdtChartsValueField;
    colorField?: MdtChartsColorField
}

export interface MdtChartsDonutAggregator {
    content?: (model: MdtChartsAggregatorModel) => MdtChartsAggregatorContent;
}

export interface MdtChartsAggregatorModel {
    data: MdtChartsDataRow[];
}

export interface MdtChartsAggregatorContent {
    value?: string | number;
    title?: string;
}


//====================================================== IntervalChart
interface IntervalChartData {
    valueField1: MdtChartsValueField;
    valueField2: MdtChartsValueField;
}