type Orient = 'top' | 'bottom' | 'left' | 'right'

export interface BlockCanvas {
    size: Size;
    class: string;
}
interface Size {
    width: number;
    height: number;
}

export interface ChartBlock {
    margin: BlockMargin
}
export interface BlockMargin {
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
    maxLabelSize: number;
}
interface TranslateModel {
    translateX: number;
    translateY: number;
}

export interface TwoDimensionalChartModel {
    type: 'bar' | 'line' | 'area';
    data: ChartDataModel;
}
export interface PolarChartModel {
    type: 'donut';
    data: ChartDataModel;
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
