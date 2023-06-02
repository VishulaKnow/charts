export type DataType = string;
export type DataTypeOptions = {
    [option: string]: any
}

export type Formatter = (value: any, options?: { type?: string; title?: string; empty?: string; }) => string;
export type TooltipPosition = 'followCursor' | 'fixed';

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
}

interface BlockMargin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface LegendBlockCanvas {
    maxWidth: number | string;
}

export interface ChartOptionsCanvas {
    bar: BarOptionsCanvas;
    donut: DonutOptionsCanvas;
    line?: LineOptionsCanvas;
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
    aggregatorPad: number;
    thickness: MdtChartsDonutThicknessOptions;
}

export interface MdtChartsDonutThicknessOptions {
    min: number | string;
    max: number | string;
    value?: number | string;
}

interface LineOptionsCanvas {
    shape?: MdtChartsLineLikeChartShape;
}

export type MdtChartsLineLikeChartCurveType = "monotone" | "none";

export interface MdtChartsLineLikeChartShape {
    curve?: { type?: MdtChartsLineLikeChartCurveType; }
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
    tooltip: TooltipSettings;
}
export interface TooltipSettings {
    position: TooltipPosition;
}


// ========================================================================================= Transitions
export interface Transitions {
    chartUpdate?: number;
    elementFadeOut?: number;
    tooltipSlide?: number;
    higlightedScale?: number;
    markerHover?: number;
}