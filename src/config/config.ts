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

export interface ChartBlockCanvas {
    size: Size;
    class: string;
}

interface Options {
    legend: Legend;
    data: DataOptions;
}

interface DataOptions {
    dataSource: string;
    keyField: Field;
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

interface Chart {
    title: string;
    tooltip: Tooltip;
}

export interface IntervalChart extends Chart { 
    type: IntervalChartType;
    data: IntervalChartData;
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

export interface NumberDomain {
    start: number;
    end: number;
}

export interface DateDomain {
    start: Date;
    end: Date;
}

export interface TwoDimensionalAxis {
    keyAxis: DiscreteAxisOptions;
    valueAxis: NumberAxisOptions;
}

export interface IntervalAxis {
    keyAxis: DiscreteAxisOptions;
    valueAxis: DateAxisOptions;
}

interface TwoDimensionalChartData {
    valueFields: TwoDimensionalValueField[];
}

interface PolarChartData {
    valueField: Field;
}

interface IntervalChartData {
    valueField1: Field;
    valueField2: Field;
}

interface Field {
    name: string;
    format: DataType;
}

export interface TwoDimensionalValueField extends Field {
    title: string;
}

interface Tooltip {
    show: boolean;
}

interface TooltipData {
    fields: Field[];
}

interface Legend {
    show: boolean;
}

interface Size {
    width: number;
    height: number;
}

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

interface AxisOptions {
    position: AxisPosition;
    ticks: AxisTicks;
}

interface NumberAxisOptions extends AxisOptions {
    domain: NumberDomain;
}

interface DiscreteAxisOptions extends AxisOptions {}

interface DateAxisOptions extends AxisOptions {}

interface AxisTicks {
    flag: boolean;
}
