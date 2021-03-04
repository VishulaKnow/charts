export type DataType = 'integer' | 'decimal' | 'date' | 'money' | 'string';
export type DataTypeOptions = {
    [option: string]: any
}

export type Formatter = (value: any, options?: any) => string;

export interface DesignerConfig {
    canvas: Canvas;
    additionalElements: Elements;
    dataFormat: DataFormat;
    chartStyle: ChartStyleConfig;
}

export interface ChartStyleConfig {
    baseColor: string;
    step: number;
}

export interface BarOptionsCanvas {
    minBarWidth: number;
    maxBarWidth: number;
    groupMinDistance: number;
    groupMaxDistance: number;
    barDistance: number;
}

export interface DonutOptionsCanvas {
    minPartSize: number;
    padAngle: number;
    minThickness: number;
    maxThickness: number;
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

interface LegendBlockCanvas {
    maxWidth: number;
}

interface AxisLabelSize {
    main: number;
    orthogonal: number;
}

interface DataFormat {
    formatters: Formatter;
}