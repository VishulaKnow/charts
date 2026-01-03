type DataType = string;
export type MdtChartsIconElement = () => HTMLElement;

export type ItemPositionByOrientation = "start" | "end";
export type ChartOrientation = "vertical" | "horizontal";
export type ChartNotation = "2d" | "polar";
export type TwoDimensionalChartType = "line" | "bar" | "area" | "dot";
export type MdtChartsDataRow = {
	[field: string]: any;
};

export type MdtChartsColorName = string;
export interface MdtChartsColorRangeItem {
	color: MdtChartsColorName;
	value?: number;
}

export interface MdtChartsDataSource {
	[source: string]: MdtChartsDataRow[];
}
export type AxisLabelPosition = "straight" | "rotated";

export type MdtChartsConfigOptions = MdtChartsPolarOptions | MdtChartsTwoDimensionalOptions;
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
interface GraphicNotationOptions {
	data: DataOptions;
	legend: MdtChartsTwoDimLegend;
	title?: Title;
	selectable: boolean;
	tooltip?: TooltipOptions;
	recordOverflowAlert?: RecordOverflowAlertOptions;
}

export interface MdtChartsTwoDimensionalOptions extends GraphicNotationOptions {
	type: "2d";
	axis: TwoDimensionalAxis;
	additionalElements: AdditionalElements;
	charts: MdtChartsTwoDimensionalChart[];
	orientation: ChartOrientation;
	valueLabels?: MdtChartsTwoDimensionalValueLabels;
	grouping?: TwoDimGroupingOptions;
	events?: TwoDimensionalEvents;
}

interface TwoDimensionalEvents {
	drawComplete?: (event: TwoDimensionalDrawCompleteEvent) => void;
}

interface TwoDimensionalDrawCompleteEvent {
	canvas: {
		keyItems: CanvasKeyItemOptions[];
		plotAreaMargin: BlockMargin;
	};
}

export interface BlockMargin {
	top: number;
	bottom: number;
	left: number;
	right: number;
}

export interface CanvasKeyItemOptions {
	totalSize: number;
}

type MdtChartsPolarChart = DonutChart;

export type PolarChartType = MdtChartsPolarChart["type"];

export interface MdtChartsPolarOptions extends GraphicNotationOptions {
	type: "polar";
	chart: MdtChartsPolarChart;
}

//====================================================== Options
export interface Legend {
	show: boolean;
}

export type TwoDimLegendPosition = "top" | "bottom";

export interface MdtChartsTwoDimLegend extends Legend {
	position?: TwoDimLegendPosition;
}

export interface RecordOverflowAlertOptions {
	textContent: RecordOverflowBlockTextContent;
}

export interface RecordOverflowVariationTextContent {
	one: string;
	twoToFour: string;
	tenToTwenty: string;
	other: string;
}

export interface RecordOverflowFunctionTextContent {
	create: (overflowRecordsAmount: number) => string;
}

export type RecordOverflowBlockTextContent = RecordOverflowVariationTextContent | RecordOverflowFunctionTextContent;

export interface TitleFunctionParams {
	data: MdtChartsDataRow[];
}

export interface TitleFunc {
	(params: TitleFunctionParams): string;
}

export interface TitleObj {
	text: string | TitleFunc;
	fontSize?: number;
}

export type Title = string | TitleFunc | TitleObj;

export interface MdtChartsBasicDataOptions {
	dataSource: string;
}

export interface DataOptions {
	dataSource: string;
	keyField: MdtChartsField;
	maxRecordsAmount?: number;
}

export type MdtChartsFieldName = string;

export interface MdtChartsBaseField {
	name: MdtChartsFieldName;
}

export interface MdtChartsField extends MdtChartsBaseField {
	format: DataType;
}

export interface MdtChartsValueField extends MdtChartsField {
	title: string;
}

export interface TwoDimValueField extends MdtChartsValueField {
	color?: string;
}

export interface TooltipOptions {
	html?: TooltipHtml;
	aggregator?: TooltipAggregator;
	formatValue?: TooltipFormatValue;
	rows?: {
		filterPredicate?: (row: TooltipPublicDataRow) => boolean;
		sortCompareFn?: (aRow: TooltipPublicDataRow, bRow: TooltipPublicDataRow) => number;
	};
}

export type TooltipHtml = (dataRow: MdtChartsDataRow) => string;

export interface TooltipAggregator {
	content: (options: { row: MdtChartsDataRow }) => TooltipAggregatorContent | TooltipAggregatorContent[];
	position?: "underKey" | "underValues";
}

export type TooltipAggregatorContent =
	| { type: "plainText"; textContent: string }
	| { type: "captionValue"; caption: string; value: any };

export type TooltipFormatValue = (params: {
	rawValue: number | null | undefined;
	autoFormattedValue: string;
}) => string;

export interface TooltipPublicDataRow {
	textContent: {
		caption: string;
		value?: number;
	};
	valueField: MdtChartsValueField;
}

//====================================================== TwoDimensionalOptions
export interface AdditionalElements {
	gridLine: GridLineOptions;
}

interface GridLineOptions {
	flag: GridLineFlag;
	styles?: GridLineStyles;
}

interface GridLineFlag {
	key: boolean;
	value: boolean;
}

interface GridLineStyles {
	dash?: GridLineStylesDash;
}

interface GridLineStylesDash {
	on?: boolean;
}

export interface TwoDimensionalAxis {
	key: DiscreteAxisOptions;
	value: NumberAxisOptions;
	valueSecondary?: NumberSecondaryAxisOptions;
}

export type NumberSecondaryAxisOptions = Omit<NumberAxisOptions, "position">;

export interface AxisOptions {
	visibility: boolean;
	position: ItemPositionByOrientation;
	ticks: AxisTicks;
	line?: AxisLineOptions;
}

interface AxisTicks {
	flag: boolean;
}

interface AxisLineOptions {
	/** @default true */
	visible?: boolean;
}

export interface NumberAxisOptions extends AxisOptions {
	domain: AxisNumberDomain;
	labels?: NumberAxisLabel;
}

export interface NumberDomain {
	start: number;
	end: number;
}

export interface AxisDomainFunctionParams {
	data: MdtChartsDataRow[];
}

export type AxisDomainFunction = (params: AxisDomainFunctionParams) => NumberDomain;

export type AxisNumberDomain = NumberDomain | AxisDomainFunction;

export interface NumberAxisLabel {
	format: (v: number) => string;
	stepSize?: number;
}

export type AxisLabelFormatter = (v: number | string) => string;

export interface DiscreteAxisOptions extends AxisOptions {
	labels?: MdtChartsDiscreteAxisLabel;
}

export interface MdtChartsDiscreteAxisLabel {
	position?: AxisLabelPosition;
	showRule?: MdtChartsShowAxisLabelRule;
	format?: DiscreteAxisLabelFormatter;
}

export type DiscreteAxisLabelFormatter = (options: { key: string; dataRow: MdtChartsDataRow }) => string;

export type ShowTickFn = (dataKey: string, index: number) => boolean;

export interface MdtChartsShowAxisLabelRule {
	spaceForOneLabel?: number;
	showTickFn?: ShowTickFn;
}

export interface MdtChartsTwoDimensionalValueLabels {
	collision?: ValueLabelsCollision;
	style?: ValueLabelsStyleOptions;
}

export interface ValueLabelsCollision {
	otherValueLabels: OtherValueLabels;
}

export type ValueLabelsCollisionMode = "none" | "hide";

export interface OtherValueLabels {
	mode: ValueLabelsCollisionMode;
}

export interface ValueLabelsStyleOptions {
	cssClassName?: string;
	fontSize?: number;
	color?: string;
}

export interface TwoDimGroupingOptions {
	items: TwoDimGroupingItem[];
}

export interface TwoDimGroupingItem {
	data: TwoDimGroupingItemData;
	labels?: TwoDimGroupingItemLabels;
}

interface TwoDimGroupingItemData {
	field: MdtChartsBaseField;
}

interface TwoDimGroupingItemLabels {
	position?: ItemPositionByOrientation;
}

//====================================================== Charts
interface MdtChartsLineLikeChart {
	markers: MarkersOptions;
	lineStyles?: MdtChartsLineLikeChartStyles;
	areaStyles?: MdtChartsLineLikeChartAreaStyles;
}

export interface MdtChartsLineLikeChartStyles {
	dash?: MdtChartsLineLikeChartDashedStyles;
	/**
	 * @default 2
	 */
	width?: number;
}

export interface MdtChartsLineLikeChartDashedStyles {
	on: boolean;
	dashSize?: number;
	gapSize?: number;
}

export interface MdtChartsLineLikeChartAreaStyles {
	gradient?: AreaStylesGradient;
	borderLine?: AreaStylesBorderLine;
}

export interface AreaStylesGradient {
	on: boolean;
}

export interface AreaStylesBorderLine {
	on: boolean;
}

export type EmbeddedLabelType = "none" | "key" | "value";

interface MdtChartsBarLikeChart {
	barStyles?: MdtChartsBarLikeChartStyles;
	embeddedLabels: EmbeddedLabelType;
}

export interface MdtChartsBarLikeChartStyles {
	hatch?: MdtChartsBarLikeChartHatchedStyles;
	borderRadius?: MdtChartsBarLikeChartBorderRadius;
}

interface MdtChartsBarLikeChartBorderRadius {
	/**
	 * @default 2
	 */
	value?: number;
}

interface MdtChartsBarLikeChartHatchedStyles {
	on: boolean;
}

interface MdtChartsDotChart {
	/** @alpha */
	dotLikeStyles?: MdtChartsDotLikeChartStyles;
}

interface MdtChartsDotLikeChartStyles {
	shape?: MdtChartsDotLikeChartShape;
}

interface MdtChartsDotLikeChartShape {
	type: "line";
	width?: number;
}

export interface MdtChartsTwoDimensionalChart extends MdtChartsLineLikeChart, MdtChartsBarLikeChart, MdtChartsDotChart {
	/** @alpha dot type has no full support */
	type: TwoDimensionalChartType;
	data: TwoDimensionalChartData;
	isSegmented: boolean;
	valueLabels?: TwoDimensionalChartValueLabels;
}

export interface DonutChart {
	type: "donut";
	data: PolarChartData;
	aggregator?: MdtChartsDonutAggregator;
}

//====================================================== TwoDimensionalChart
export interface TwoDimensionalChartData {
	valueFields: TwoDimValueField[];
	valueGroup?: TwoDimensionalValueGroup;
}

export interface ValueLabelsWithOffsetOptions {
	/** @default 10 */
	offsetSize?: number;
}

export type ValueLabelsPositionOptions =
	| ({
			mode?: "afterHead" | "beforeHead" | "afterStart";
	  } & ValueLabelsWithOffsetOptions)
	| { mode?: "center" };

export type ValueLabelsPositionMode = ValueLabelsPositionOptions["mode"];

export interface ValueLabelsContentSetterOptions {
	dataRow: MdtChartsDataRow;
	field: MdtChartsValueField;
}

export type ValueLabelsContentSetter = (options: ValueLabelsContentSetterOptions) => { textContent: string | number };

export interface TwoDimensionalChartValueLabels {
	on: boolean;
	position?: ValueLabelsPositionOptions;
	format?: ValueLabelsFormatter;
	rotation?: ValueLabelsRotationOptions;
	handleElement?: ValueLabelsHandleElement;
	renderForFields?: MdtChartsFieldName[];
	setContent?: ValueLabelsContentSetter;
}

export type ValueLabelsHandleElement = (elInfo: {
	element: SVGTextElement;
	value: number;
	dataRow: MdtChartsDataRow;
}) => void;

export interface ValueLabelsRotationOptions {
	angle?: number;
}

export type ValueLabelsFormatter = (value: number) => string;

export type TwoDimensionalValueGroup = "main" | "secondary";

interface MarkersOptions {
	show: boolean;
}

//====================================================== PolarChart
export type MdtChartsColorField = string;
export interface PolarChartData {
	valueField: MdtChartsValueField;
	colorField?: MdtChartsColorField;
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
