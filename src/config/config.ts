type DataType = 'integer' | 'decimal' | 'date' | 'money' | 'string';

export type AxisPosition = 'start' | 'end';
export type ChartOrientation = 'vertical' | 'horizontal';
export type ChartNotation = '2d' | 'polar' | 'interval';
export type ChartType = 'bar' | 'line' | 'area' | 'donut' | 'gantt';
export type TwoDimensionalChartType = 'line' | 'bar' | 'area';
export type PolarChartType = 'donut';
export type IntervalChartType = 'gantt';
export type LegendPosition = 'off' | 'top' | 'bottom' | 'left' | 'right';

export interface Config {
    canvas: Canvas;
    options: PolarOptions | TwoDimensionalOptions | IntervalOptions;
}

export interface TwoDimensionalOptions {
    type: '2d';
    axis: TwoDimensionalAxis;
    additionalElements: TwoDimensionalAdditionalElements;
    charts: TwoDimensionalChart[];
}

export interface PolarOptions {
    type: 'polar';
    charts: PolarChart[];
}

export interface IntervalOptions {
    type: 'interval';
    axis: IntervalAxis;
    charts: IntervalChart[];
    additionalElements: TwoDimensionalAdditionalElements;
}

export interface IntervalChart {
    title: string;
    type: IntervalChartType;
    data: IntervalChartData;
    legend: Legend;
    tooltip: Tooltip;
    orientation: ChartOrientation;
}

export interface TwoDimensionalChart {
    title: string;
    type: TwoDimensionalChartType;
    data: ChartData;
    legend: Legend;
    tooltip: Tooltip;
    orientation: ChartOrientation;
}

export interface PolarChart {
    title: string;
    type: PolarChartType;
    data: ChartData;
    legend: Legend;
    tooltip: Tooltip;
    appearanceOptions: PolarChartAppearanceOptions;
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

interface PolarChartAppearanceOptions {
    innerRadius: number;
    padAngle: number;
}

interface ChartData {
    dataSource: string;
    keyField: Field;
    valueField: Field;
}

interface IntervalChartData {
    dataSource: string;
    keyField: Field;
    valueField1: Field;
    valueField2: Field;
}

interface Field {
    name: string;
    format: DataType;
}

interface Tooltip {
    data: TooltipData;
}

interface TooltipData {
    fields: Field[];
}

interface Legend {
    position: LegendPosition;
}

interface Size {
    width: number;
    height: number;
}

interface TwoDimensionalAdditionalElements {
    gridLine: GridLineOptions;
}

interface GridLineOptions {
    flag: GridLineFlag;
}

interface GridLineFlag {
    key: boolean;
    value: boolean;
}

interface Canvas {
    size: Size;
    class: string;
}

interface NumberAxisOptions {
    domain: NumberDomain;
    position: AxisPosition; 
}

interface DiscreteAxisOptions {
    position: AxisPosition;
}

interface DateAxisOptions {
    position: AxisPosition;
}
