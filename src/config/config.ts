type DataType = string;
export type MdtChartsIconElement = () => HTMLElement;

export type AxisPosition = 'start' | 'end';
export type ChartOrientation = 'vertical' | 'horizontal';
export type ChartNotation = '2d' | 'polar' | 'interval' | 'card';
export type ChartType = 'bar' | 'line' | 'area' | 'donut' | 'gantt';
export type TwoDimensionalChartType = 'line' | 'bar' | 'area';
export type PolarChartType = 'donut';
export type IntervalChartType = 'gantt';
export type EmbeddedLabelType = 'none' | 'key' | 'value';
export type TooltipHtml = (dataRow: MdtChartsDataRow) => string;
export type MdtChartsDataRow = {
    [field: string]: any
}

export type MdtChartsColorName = string;
export interface MdtChartsColorRangeItem {
    color: MdtChartsColorName;
    value?: number;
}

export interface MdtChartsDataSource {
    [source: string]: MdtChartsDataRow[];
}
export type AxisLabelPosition = "straight" | "rotated";

export type MdtChartsConfigOptions = MdtChartsPolarOptions | MdtChartsTwoDimensionalOptions | MdtChartsIntervalOptions | MdtChartsCardsOptions;
export interface MdtChartsConfig {
    canvas: ChartBlockCanvas;
    options: MdtChartsConfigOptions;
}


//====================================================== ChartBlockCanvas
export interface ChartBlockCanvas {
    size: Size;
    class: string;
}
export interface Size {
    width: number;
    height: number;
}
export interface NewSize {
    width?: number;
    height?: number;
}


//====================================================== Options
interface BasicOptions {
    tooltip?: TooltipOptions;
    data: MdtChartsBasicDataOptions;
}

interface GraphicNotationOptions extends BasicOptions {
    data: DataOptions;
    legend: Legend;
    title?: string;
    selectable: boolean;
}

export interface MdtChartsTwoDimensionalOptions extends GraphicNotationOptions {
    type: '2d';
    axis: TwoDimensionalAxis;
    additionalElements: AdditionalElements;
    charts: MdtChartsTwoDimensionalChart[];
    orientation: ChartOrientation;
}

export interface MdtChartsPolarOptions extends GraphicNotationOptions {
    type: 'polar';
    chart: PolarChart;
}

export interface MdtChartsIntervalOptions extends GraphicNotationOptions {
    type: 'interval';
    axis: IntervalAxis;
    chart: IntervalChart;
    additionalElements: AdditionalElements;
    orientation: ChartOrientation;
}

export interface MdtChartsCardsOptions extends BasicOptions {
    type: 'card';
    title: string;
    description?: string;
    icon?: MdtChartsIconElement;
    color?: MdtChartsColorRangeItem[];
    value: MdtChartsCardValue;
    change?: MdtChartsCardsChange;
}


//====================================================== Options
export interface Legend {
    show: boolean;
}

export interface MdtChartsBasicDataOptions {
    dataSource: string;
}

export interface DataOptions {
    dataSource: string;
    keyField: MdtChartsField;
    maxRecordsAmount?: number;
}

export interface MdtChartsField {
    name: string;
    format: DataType;
}

export interface MdtChartsValueField extends MdtChartsField {
    title: string;
}

export interface TwoDimValueField extends MdtChartsValueField {
    color?: string;
}

export interface TooltipOptions {
    html: TooltipHtml;
}


//====================================================== TwoDimensionalOptions & IntervalOptions
export interface AdditionalElements {
    gridLine: GridLineOptions;
}

interface GridLineOptions {
    flag: GridLineFlag;
}

interface GridLineFlag {
    key: boolean;
    value: boolean;
}


//====================================================== TwoDimensionalOptions
export interface TwoDimensionalAxis {
    key: DiscreteAxisOptions;
    value: NumberAxisOptions;
}

export interface AxisOptions {
    visibility: boolean;
    position: AxisPosition;
    ticks: AxisTicks;
}

interface AxisTicks {
    flag: boolean;
}

export interface NumberAxisOptions extends AxisOptions {
    domain: NumberDomain;
}

export interface NumberDomain {
    start: number;
    end: number;
}

export interface DiscreteAxisOptions extends AxisOptions {
    labels?: MdtChartsDiscreteAxisLabel;
}

export interface MdtChartsDiscreteAxisLabel {
    position?: AxisLabelPosition;
}


//====================================================== IntervalOptions
export interface IntervalAxis {
    key: DiscreteAxisOptions;
    value: DateAxisOptions;
}

interface DateAxisOptions extends AxisOptions { }


//====================================================== CardsOptions
export interface MdtChartsCardValue {
    field: string;
    dataType?: DataType;
}

export interface MdtChartsCardsChange {
    value: MdtChartsCardValue;
    color?: MdtChartsColorRangeItem[];
    description?: string;
    icon?: MdtChartsCardsChangeIcon;
}

export interface MdtChartsCardOptionByValue<T> {
    belowZero?: T;
    equalZero?: T;
    aboveZero?: T;
}

export interface MdtChartsCardsChangeIcon extends MdtChartsCardOptionByValue<MdtChartsIconElement> { }


//====================================================== Charts
interface ChartSettings {
    tooltip: Tooltip;
}

interface Tooltip {
    show: boolean;
}

interface MdtChartsLineLikeChart {
    markers: MarkersOptions;
}

export interface MdtChartsTwoDimensionalChart extends ChartSettings, MdtChartsLineLikeChart {
    type: TwoDimensionalChartType;
    data: TwoDimensionalChartData;
    embeddedLabels: EmbeddedLabelType;
    isSegmented: boolean;
}

export interface PolarChart extends ChartSettings {
    type: PolarChartType;
    data: PolarChartData;
    aggregator?: MdtChartsDonutAggregator;
}

export interface IntervalChart extends ChartSettings {
    type: IntervalChartType;
    data: IntervalChartData;
}


//====================================================== TwoDimensionalChart
export interface TwoDimensionalChartData {
    valueFields: TwoDimValueField[];
}

interface MarkersOptions {
    show: boolean;
}

//====================================================== PolarChart
export type MdtChartsColorField = string;
export interface PolarChartData {
    valueField: MdtChartsValueField;
    colorField?: MdtChartsColorField
}

export interface MdtChartsDonutAggregator {
    content?: (model: MdtChartsAggregatorModel) => MdtChartsAggregatorContent;
}

export interface MdtChartsAggregatorModel {
    data: MdtChartsDataRow[];
}

export interface MdtChartsAggregatorContent {
    value?: string | number;
    title?: string;
}


//====================================================== IntervalChart
interface IntervalChartData {
    valueField1: MdtChartsValueField;
    valueField2: MdtChartsValueField;
}