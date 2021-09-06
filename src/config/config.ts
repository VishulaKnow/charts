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

export interface MdtChartsConfig {
    canvas: ChartBlockCanvas;
    options: PolarOptions | TwoDimensionalOptions | IntervalOptions;
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
    title: string;
    selectable: boolean;
    tooltip?: TooltipOptions;
}

export interface TwoDimensionalOptions extends Options {
    type: '2d';
    axis: TwoDimensionalAxis;
    additionalElements: AdditionalElements;
    charts: TwoDimensionalChart[];
    orientation: ChartOrientation;
}

export interface PolarOptions extends Options {
    type: 'polar';
    chart: PolarChart;
}

export interface IntervalOptions extends Options {
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
}

export interface MdtChartsField {
    name: string;
    format: DataType;
}

export interface ValueField extends MdtChartsField {
    title: string;
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

export interface DiscreteAxisOptions extends AxisOptions { }


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

export interface TwoDimensionalChart extends ChartSettings {
    type: TwoDimensionalChartType;
    data: TwoDimensionalChartData;
    embeddedLabels: EmbeddedLabelType;
    isSegmented: boolean;
    markers: MarkersOptions;
}

export interface PolarChart extends ChartSettings {
    type: PolarChartType;
    data: PolarChartData;
}

export interface IntervalChart extends ChartSettings {
    type: IntervalChartType;
    data: IntervalChartData;
}


//====================================================== TwoDimensionalChart
export interface TwoDimensionalChartData {
    valueFields: ValueField[];
}

interface MarkersOptions {
    show: boolean;
}


//====================================================== PolarChart
export interface PolarChartData {
    valueField: ValueField;
}


//====================================================== IntervalChart
interface IntervalChartData {
    valueField1: ValueField;
    valueField2: ValueField;
}