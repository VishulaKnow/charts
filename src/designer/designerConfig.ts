import { Color } from "d3";

export type DataType = 'integer' | 'decimal' | 'date' | 'money' | 'string';
export type DataOptions = {
    [option: string]: any
}

export interface Formatter {
    [type: string]: (options: DataOptions, value: any) => string
}

export interface DesignerConfig {
    canvas: Canvas;
    chart: ChartOptions;
    additionalElements: Elements;
    dataFormat: DataFormat;
}

export interface BarOptionsCanvas {
    minBarWidth: number;
    maxBarWidth: number;
    groupDistance: number;
    barDistance: number;
}

export interface AxisLabelCanvas {
    maxSize: AxisLabelSize;
}

interface Elements {
    gridLine: GridLineOptions;
}

interface GridLineOptions {
    flag: GridLineFlag;
}

interface GridLineFlag {
    key: boolean;
    value: boolean;
}

interface BlockMargin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

interface Canvas {
    axisLabel: AxisLabelCanvas;
    chartBlockMargin: BlockMargin;
    legendBlock: LegendBlockCanvas;
    chartOptions: ChartOptionsCanvas;
}

interface ChartOptionsCanvas {
    bar: BarOptionsCanvas;
    donut: DonutOptionsCanvas;
}

interface DonutOptionsCanvas {
    minPartSize: number;
}

interface LegendBlockCanvas {
    maxWidth: number;
}

interface AxisLabelSize {
    main: number;
    orthogonal: number;
}

interface ChartOptions {
    style: ChartStyle;
}

interface ChartStyle {
    palette: Color[];
}

interface DataFormat {
    formatters: Formatter;
}