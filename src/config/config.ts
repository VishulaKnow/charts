type DataType = string;

export type AxisPosition = 'start' | 'end';
export type ChartOrientation = 'vertical' | 'horizontal';
export type ChartNotation = '2d' | 'polar' | 'interval';
export type ChartType = 'bar' | 'line' | 'area' | 'donut' | 'gantt';
export type TwoDimensionalChartType = 'line' | 'bar' | 'area';
export type PolarChartType = 'donut';
export type IntervalChartType = 'gantt';
export type EmbeddedLabelType = 'none' | 'key' | 'value';
export type TooltipHtml = (dataRow: MdtChartsDataRow) => string;
export type MdtChartsDataRow = {
    [field: string]: any
}
export interface MdtChartsDataSource {
    [source: string]: MdtChartsDataRow[];
}
export type AxisLabelPosition = "straight" | "rotated";

export interface MdtChartsConfig {
    canvas: ChartBlockCanvas;
    options: MdtChartsPolarOptions | MdtChartsTwoDimensionalOptions | MdtChartsIntervalOptions;
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
interface Options {
    legend: Legend;
    data: DataOptions;
    title?: string;
    selectable: boolean;
    tooltip?: TooltipOptions;
}

export interface MdtChartsTwoDimensionalOptions extends Options {
    type: '2d';
    axis: TwoDimensionalAxis;
    additionalElements: AdditionalElements;
    charts: MdtChartsTwoDimensionalChart[];
    orientation: ChartOrientation;
}

export interface MdtChartsPolarOptions extends Options {
    type: 'polar';
    chart: PolarChart;
}

export interface MdtChartsIntervalOptions extends Options {
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

export interface DataOptions {
    dataSource: string;
    keyField: MdtChartsField;
    maxRecordsAmount?: number;
}

export interface MdtChartsField {
    name: string;
    format: DataType;
}

export interface MdtChartsValueField extends MdtChartsField {
    title: string;
}

export interface TwoDimValueField extends MdtChartsValueField {
    color?: string;
}

export interface TooltipOptions {
    html: TooltipHtml;
}


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
    domain: NumberDomain;
}

export interface NumberDomain {
    start: number;
    end: number;
}

export interface DiscreteAxisOptions extends AxisOptions {
    labels?: MdtChartsDiscreteAxisLabel;
}

export interface MdtChartsDiscreteAxisLabel {
    position?: AxisLabelPosition;
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

export interface MdtChartsTwoDimensionalChart extends ChartSettings {
    type: TwoDimensionalChartType;
    data: TwoDimensionalChartData;
    embeddedLabels: EmbeddedLabelType;
    isSegmented: boolean;
    markers: MarkersOptions;
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