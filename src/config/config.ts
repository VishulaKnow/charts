import config from "./configOptions";

type CssStyle = {
    [cssProp: string]: string | number;
}

export interface Chart {
    title: string;
    type: 'bar' | 'line' | 'area';
    data: ChartData;
    style: CssStyle;
    legend: Legend;
    orientation: 'vertical' | 'horizontal';
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
    axis: Axis;
    charts: Chart[];
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