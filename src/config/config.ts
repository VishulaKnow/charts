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
interface Size {
    width: number;
    height: number;
}


//====================================================== Options
interface Options {
    legend: Legend;
    data: DataOptions;
    title: string;
}

interface Legend {
    show: boolean;
}

interface DataOptions {
    dataSource: string;
    keyField: Field;
}

interface Field {
    name: string;
    format: DataType;
}

export interface TwoDimensionalOptions extends Options {
    type: '2d';
    axis: TwoDimensionalAxis;
    additionalElements: TwoDimensionalAdditionalElements;
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
interface AdditionalElements {
    gridLine: GridLineOptions;
}

interface GridLineOptions {
    flag: GridLineFlag;
}

interface GridLineFlag {
    key: boolean;
    value: boolean;
}

interface TwoDimensionalAdditionalElements extends AdditionalElements {
    marks: MarksOptions;
}

interface MarksOptions {
    flag: boolean;
}


//====================================================== TwoDimensionalOptions
export interface TwoDimensionalAxis {
    keyAxis: DiscreteAxisOptions;
    valueAxis: NumberAxisOptions;
}

interface AxisOptions {
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

interface DiscreteAxisOptions extends AxisOptions {}


//====================================================== IntervalOptions
export interface IntervalAxis {
    keyAxis: DiscreteAxisOptions;
    valueAxis: DateAxisOptions;
}

interface DateAxisOptions extends AxisOptions {}


//====================================================== Charts
interface Chart {
    title: string;
    tooltip: Tooltip;
}

interface Tooltip {
    show: boolean;
}

export interface TwoDimensionalChart extends Chart {
    type: TwoDimensionalChartType;
    data: TwoDimensionalChartData;
    embeddedLabels: EmbeddedLabelType;
    isSegmented: boolean;
}

export interface PolarChart extends Chart {
    type: PolarChartType;
    data: PolarChartData;
}

export interface IntervalChart extends Chart { 
    type: IntervalChartType;
    data: IntervalChartData;
}


//====================================================== TwoDimensionalChart
interface TwoDimensionalChartData {
    valueFields: TwoDimensionalValueField[];
}

export interface TwoDimensionalValueField extends Field {
    title: string;
}


//====================================================== PolarChart
interface PolarChartData {
    valueField: Field;
}


//====================================================== IntervalChart
interface IntervalChartData {
    valueField1: Field;
    valueField2: Field;
}