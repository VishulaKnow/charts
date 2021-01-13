type DataType = 'integer' | 'decimal' | 'date' | 'money' | 'string';

export type AxisPosition = 'start' | 'end';
export type ChartOrientation = 'vertical' | 'horizontal';
export type ChartNotation = '2d' | 'polar';
export type ChartType = 'bar' | 'line' | 'area' | 'donut';
export type TwoDimensionalChartType = 'line' | 'bar' | 'area';
export type LegendPosition = 'off' | 'top' | 'left' | 'right' | 'bottom';

export interface Config {
    canvas: Canvas;
    options: PolarOptions | TwoDimensionalOptions;
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
    type: 'donut';
    data: ChartData;
    legend: Legend;
    tooltip: Tooltip;
    appearanceOptions: PolarChartAppearanceOptions;
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


export interface TwoDimensionalOptions {
    type: '2d';
    axis: Axis;
    additionalElements: TwoDimensionalAdditionalElements;
    charts: TwoDimensionalChart[];
}
interface TwoDimensionalAdditionalElements {
    gridLine: GridLineOptions;
}
interface GridLineOptions {
    flag: GridLineFlag;
}
interface GridLineFlag {
    vertical: boolean;
    horizontal: boolean;
}



export interface PolarOptions {
    type: 'polar';
    charts: PolarChart[];
}

interface Canvas {
    size: Size;
    class: string;
}
export interface Axis {
    keyAxis: AxisOptions;
    valueAxis: AxisOptions;
}
interface AxisOptions {
    domain: Domain;
    position: 'start' | 'end'; 
}
export interface Domain {
    start: number;
    end: number;
}