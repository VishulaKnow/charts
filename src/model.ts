type CssStyle = {
    [cssProp: string]: string | number;
}
type Orient = 'top' | 'bottom' | 'left' | 'right'

interface BlockCanvas {
    size: Size;
    class: string;
    style: CssStyle;
}
interface Size {
    width: number;
    height: number;
}

interface ChartBlock {
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

export interface ChartModel {
    type: 'bar' | 'line' | 'area';
    data: ChartDataModel;
    style: CssStyle;
}
export interface Model {
    blockCanvas: BlockCanvas;
    chartBlock: ChartBlock;
    scale: ScaleModel;
    axis: AxisModel;
    charts: ChartModel[];
}
interface ChartDataModel {
    dataSource: string;
    keyField: string;
    valueField: string;
}
