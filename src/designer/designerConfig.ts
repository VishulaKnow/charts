export type DataType = 'integer' | 'decimal' | 'date' | 'money' | 'string';
export type DataTypeOptions = {
    [option: string]: any
}

export type Formatter = (value: any, options?: any) => string;

export interface DesignerConfig {
    canvas: Canvas;
    dataFormat: DataFormat;
    chartStyle: ChartStyleConfig;
    elementsOptions: ElementsOptions;
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
    aggregatorPad: number;
}


// ========================================================================================= DataFormat
interface DataFormat {
    formatters: Formatter;
}


// ========================================================================================= ChartStyle
export interface ChartStyleConfig {
    baseColors: string[];
}


// ========================================================================================= ElementsOptions
export interface ElementsOptions {
    tooltip: TooltipOptions;
}

export interface TooltipOptions {
    position: 'cursor' | 'fixed';
}


// ========================================================================================= Transitions
export interface Transitions {
    chartUpdate?: number;
    elementFadeOut?: number;
    tooltipSlide?: number;
    donutHover?: number;
    markerHover?: number;
}