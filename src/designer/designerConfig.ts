import { Color } from "d3";

export type DataType = 'integer' | 'decimal' | 'date' | 'money' | 'string';
export type DataOptions = {
    [option: string]: any
}

export interface DesignerConfig {
    canvas: Canvas;
    chart: ChartOptions;
    additionalElements: Elements;
    dataFormat: DataFormat;
}
interface Elements {
    gridLine: GridLineOptions;
}
interface GridLineOptions {
    flag: GridLineFlag;
}
interface GridLineFlag {
    vertical: boolean;
    horizontal: boolean;
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
export interface BarOptionsCanvas {
    minBarWidth: number;
    groupDistance: number;
    barDistance: number;
}
interface DonutOptionsCanvas {
    minPartSize: number;
}
interface LegendBlockCanvas {
    maxWidth: number;
}
export interface AxisLabelCanvas {
    maxSize: AxisLabelSize;
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
    formatters: {
        [type: string]: (options: DataOptions, value: any) => string
    }
}