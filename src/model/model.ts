type CssStyle = {
    [cssProp: string]: string | number;
}
type Orient = 'top' | 'bottom' | 'left' | 'right'

export interface BlockCanvas {
    size: Size;
    class: string;
    style: CssStyle;
}
interface Size {
    width: number;
    height: number;
}

export interface ChartBlock {
    margin: BlockMargin
}
interface BlockMargin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

interface ScaleModel {
    scaleKey: ScaleOptions;
    scaleValue: ScaleOptions;
}
interface ScaleOptions {
    domain: any[];
    range: RangeModel;
}
interface RangeModel {
    start: number;
    end: number;
}

interface AxisModel {
    keyAxis: AxisModelOptions;
    valueAxis: AxisModelOptions;
}
interface AxisModelOptions {
    orient: Orient;
    translate: TranslateModel;
    class: string;
}
interface TranslateModel {
    translateX: number;
    translateY: number;
}

export interface TwoDimensionalChartModel {
    type: 'bar' | 'line' | 'area';
    data: ChartDataModel;
    style: CssStyle;
}
export interface PolarChartModel {
    type: 'donut';
    data: ChartDataModel;
    style: CssStyle;
    appearanceOptions: PolarChartAppearanceModel;
}
export interface Model {
    blockCanvas: BlockCanvas;
    chartBlock: ChartBlock;
    options: TwoDimensionalOptionsModel | PolarOptionsModel;
}
export interface TwoDimensionalOptionsModel {
    type: '2d';
    scale: ScaleModel;
    axis: AxisModel;
    charts: TwoDimensionalChartModel[];
}
export interface PolarOptionsModel {
    type: 'polar';
    charts: PolarChartModel[];
}
interface PolarChartAppearanceModel {
    innerRadius: number;
    padAngle: number
}
interface ChartDataModel {
    dataSource: string;
    keyField: string;
    valueField: string;
}
