type CssStyle = {
    [cssProp: string]: string | number;
}


export interface TwoDimensionalChart {
    title: string;
    type: 'bar' | 'line' | 'area';
    data: ChartData;
    style: CssStyle;
    legend: Legend;
    orientation: 'vertical' | 'horizontal';
}
export interface PolarChart {
    title: string;
    type: 'donut';
    data: ChartData;
    style: CssStyle;
    legend: Legend;
    appearanceOptions: PolarChartAppearanceOptions;
}

interface PolarChartAppearanceOptions {
    innerRadius: number;
    padAngle: number;
}

interface ChartData {
    dataSource: string;
    keyField: string;
    valueField: string;
}
interface Legend {
    position: 'off' | 'top' | 'left' | 'right' | 'bottom';
}

interface Size {
    width: number;
    height: number;
}
export interface Config {
    canvas: Canvas;
    options: PolarOptions | TwoDimensionalOptions;
}
export interface TwoDimensionalOptions {
    type: '2d';
    axis: Axis;
    charts: TwoDimensionalChart[];
}
export interface PolarOptions {
    type: 'polar';
    charts: PolarChart[];
}

interface Canvas {
    size: Size;
    class: string;
    style: CssStyle;
}
interface Axis {
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