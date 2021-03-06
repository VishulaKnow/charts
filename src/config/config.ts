type DataType = 'integer' | 'decimal' | 'date' | 'money' | 'string';

export type AxisPosition = 'start' | 'end';
export type ChartOrientation = 'vertical' | 'horizontal';
export type ChartNotation = '2d' | 'polar' | 'interval';
export type ChartType = 'bar' | 'line' | 'area' | 'donut' | 'gantt';
export type TwoDimensionalChartType = 'line' | 'bar' | 'area';
export type PolarChartType = 'donut';
export type IntervalChartType = 'gantt';
export type EmbeddedLabelType = 'none' | 'key' | 'value';

export interface Config {
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


//====================================================== Options
interface Options {
    legend: Legend;
    data: DataOptions;
    title: string;
}

export interface Legend {
    show: boolean;
}

export interface DataOptions {
    dataSource: string;
    keyField: Field;
}

interface Field {
    name: string;
    format: DataType;
}

export interface ValueField extends Field {
    title: string;
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
    charts: PolarChart[];
}

export interface IntervalOptions extends Options {
    type: 'interval';
    axis: IntervalAxis;
    charts: IntervalChart[];
    additionalElements: AdditionalElements;
    orientation: ChartOrientation;
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
    keyAxis: DiscreteAxisOptions;
    valueAxis: NumberAxisOptions;
}

export interface AxisOptions {
    visibility: boolean;
    position: AxisPosition;
    ticks: AxisTicks;
}

interface AxisTicks {
    flag: boolean;
}

interface NumberAxisOptions extends AxisOptions {
    domain: NumberDomain;
}

export interface NumberDomain {
    start: number;
    end: number;
}

interface DiscreteAxisOptions extends AxisOptions { }


//====================================================== IntervalOptions
export interface IntervalAxis {
    keyAxis: DiscreteAxisOptions;
    valueAxis: DateAxisOptions;
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
    valueField1: Field;
    valueField2: Field;
}