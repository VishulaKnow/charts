export type DataType = 'integer' | 'decimal' | 'date' | 'money' | 'string';
export type DataTypeOptions = {
    [option: string]: any
}

export type Formatter = (value: any, options?: any) => string;

export interface DesignerConfig {
    canvas: Canvas;
    dataFormat: DataFormat;
    chartStyle: ChartStyleConfig;
    transitions?: Transitions;
}


// ========================================================================================= Canvas
interface Canvas {
    axisLabel: AxisLabelCanvas;
    chartBlockMargin: BlockMargin;
    legendBlock: LegendBlockCanvas;
    chartOptions: ChartOptionsCanvas;
}

export interface AxisLabelCanvas {
    maxSize: AxisLabelSize;
}
interface AxisLabelSize {
    main: number;
    orthogonal: number;
}

interface BlockMargin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

interface LegendBlockCanvas {
    maxWidth: number;
}

interface ChartOptionsCanvas {
    bar: BarOptionsCanvas;
    donut: DonutOptionsCanvas;
}

export interface BarOptionsCanvas {
    minBarWidth: number;
    maxBarWidth: number;
    groupMinDistance: number;
    groupMaxDistance: number;
    barDistance: number;
}

export interface DonutOptionsCanvas {
    padAngle: number;
    minThickness: number;
    maxThickness: number;
}


// ========================================================================================= DataFormat
interface DataFormat {
    formatters: Formatter;
}


// ========================================================================================= ChartStyle
export interface ChartStyleConfig {
    baseColor: string;
    step: number;
}


// ========================================================================================= Transitions
export interface Transitions {
    chartUpdate?: number;
    elementFadeOut?: number;
    tooltipSlide?: number;
    donutHover?: number;
    markerHover?: number;
}