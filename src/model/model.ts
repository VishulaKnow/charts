import {
	ChartOrientation,
	MdtChartsColorField,
	PolarChartType,
	Size,
	TooltipOptions,
	TwoDimensionalChartType,
	AxisLabelPosition,
	ShowTickFn,
	MdtChartsDataRow,
	TwoDimensionalValueGroup,
	ValueLabelsCollisionMode,
	ValueLabelsRotationOptions,
	ValueLabelsHandleElement,
	MdtChartsFieldName,
	ValueLabelsContentSetter
} from "../config/config";
import {
	DataType,
	DonutOptionsCanvas,
	Formatter,
	StaticLegendBlockCanvas,
	TooltipSettings,
	Transitions
} from "../designer/designerConfig";
import { BoundingRect } from "../engine/features/valueLabelsCollision/valueLabelsCollision";

type AxisType = "key" | "value";

export type Orient = "top" | "bottom" | "left" | "right";
export type ScaleKeyType = "band" | "point";
export type ScaleValueType = "linear";
export type LegendPosition = "off" | "top" | "bottom" | "left" | "right";
export type EmbeddedLabelTypeModel = "none" | "key" | "value";
export type DataOptions = {
	[option: string]: any;
};
export type UnitsFromConfig = "%" | "px";
export type ValueLabelAnchor = "start" | "middle" | "end";
export type ValueLabelDominantBaseline = "hanging" | "middle" | "auto";
export type GradientId = string;

export type OptionsModel = TwoDimensionalOptionsModel | PolarOptionsModel;

export interface Model<O = OptionsModel> {
	blockCanvas: BlockCanvas;
	chartBlock: ChartBlockModel;
	options: O;
	otherComponents: OtherCommonComponents;
	dataSettings: DataSettings;
	transitions?: Transitions;
}

//====================================================== Canvas
export interface BlockCanvas {
	size: Size;
	cssClass: string;
}

export interface ChartBlockModel {
	margin: BlockMargin;
}
export interface BlockMargin {
	top: number;
	bottom: number;
	left: number;
	right: number;
}

//====================================================== Options

export interface TooltipBasicModel {
	getContent: (keyFieldValue: string) => TooltipContent;
}

export type TooltipMarkerModel = ChartLegendMarkerModel & {
	color: string;
};

export type TooltipContent =
	| {
			type: "html";
			htmlContent: string;
	  }
	| TooltipContentWithRows;

export interface TooltipContentWithRows {
	type: "rows";
	rows: TooltipContentRow[];
}

export interface TooltipContentRow {
	marker?: TooltipMarkerModel;
	textContent: {
		caption: string;
		value?: string | number;
	};
	wrapper?: {
		cssClassName?: string;
	};
}

interface BasicOptionsModel {
	tooltip: TooltipBasicModel;
}
interface GraphicNotationOptionsModel extends BasicOptionsModel {
	legend: ILegendModel;
	data: OptionsModelData;
	title: OptionsModelTitle;
	selectable: boolean;
	defs: OptionsModelGradients;
	recordOverflowAlert: RecordOverflowAlertModel;
}
export interface TwoDimensionalOptionsModel extends GraphicNotationOptionsModel {
	type: "2d";
	scale: IScaleModel;
	axis: IAxisModel;
	charts: TwoDimensionalChartModel[];
	additionalElements: AdditionalElementsOptions;
	orient: ChartOrientation;
	chartSettings: TwoDimChartElementsSettings;
	valueLabels: TwoDimensionalValueLabels;
}
export interface PolarOptionsModel extends GraphicNotationOptionsModel {
	type: "polar";
	charts: PolarChartModel[];
	chartCanvas: DonutChartSettings;
}

//====================================================== Options Model Common
export interface ILegendModel {
	position: LegendPosition;
}
export interface BasicOptionsModelData {
	dataSource: string;
}
export interface OptionsModelData extends BasicOptionsModelData {
	keyField: Field;
}
export interface Field {
	name: string;
	format: DataType;
}

export interface OptionsModelTitle {
	textContent: string;
	fontSize: number;
}

export interface OptionsModelGradients {
	gradients: GradientDef[];
}

export interface GradientDef {
	id: GradientId;
	position: {
		x1: number;
		x2: number;
		y1: number;
		y2: number;
	};
	items: {
		id: string;
		color: string;
		offset: number;
		opacity: number;
	}[];
}

//====================================================== TwoDimensionalOptionsModel
export interface IScaleModel {
	key: ScaleKeyModel;
	value: ScaleValueModel;
	valueSecondary?: ScaleValueModel;
}
export interface ScaleKeyModel {
	domain: any[];
	range: RangeModel;
	type: ScaleKeyType;
	elementsAmount: number;
}
export interface ScaleValueModel {
	domain: any[];
	range: RangeModel;
	type: ScaleValueType;
	formatter: ((v: number) => string) | null;
}
export interface RangeModel {
	start: number;
	end: number;
}

export interface IAxisModel {
	key: AxisModelOptions;
	value: AxisModelOptions;
	valueSecondary?: AxisModelOptions;
}
export interface AxisModelOptions {
	visibility: boolean;
	type: AxisType;
	orient: Orient;
	translate: TranslateModel;
	cssClass: string;
	ticks: AxisTicksModel;
	labels: AxisLabelModel;
	line: AxisLineModel;
	browserTooltip: AxisBrowserTooltipModel;
}

export interface AxisBrowserTooltipModel {
	format: (value: number | string) => string | number;
}

export interface AxisLineModel {
	visible: boolean;
}

export interface TranslateModel {
	translateX: number;
	translateY: number;
}
interface AxisTicksModel {
	flag: boolean;
}
export interface AxisLabelModel {
	maxSize: number;
	position: AxisLabelPosition;
	visible: boolean;
	defaultTooltip: boolean;
	showTick: ShowTickFn;
	linearTickStep: number;
	tickAmountSettings: TickAmountModel;
}

interface TickAmountModel {
	policy: TickAmountPolicy;
}

export type TickAmountPolicy =
	| { type: "auto" }
	| { type: "amount"; amount: number }
	| { type: "constant"; values: number[] };

export interface AdditionalElementsOptions {
	gridLine: GridLineOptions;
}
export interface GridLineOptions {
	flag: GridLineFlag;
	styles: GridLineStyles;
}
export interface GridLineFlag {
	key: boolean;
	value: boolean;
}

interface GridLineStyles {
	dash: GridLineStylesDash;
}

interface GridLineStylesDash {
	on: boolean;
}

export interface TwoDimChartElementsSettings {
	bar: BarChartSettings;
	lineLike: LineLikeChartSettings;
}
export interface BarChartSettings {
	groupMaxDistance: number;
	groupMinDistance: number;
	barDistance: number;
	maxBarWidth: number;
	minBarWidth: number;
}
export interface LineLikeChartSettings {
	shape: LineLikeChartShapeOptions;
}

export interface LineLikeChartShapeOptions {
	curve: LineLikeChartCurveOptions;
}

export interface LineLikeChartDashOptions {
	on: boolean;
	dashSize: number;
	gapSize: number;
}

export enum LineCurveType {
	monotoneX,
	monotoneY,
	basis,
	none
}

interface LineLikeChartCurveOptions {
	type: LineCurveType;
}

interface BarLikeChartHatchOptions {
	on: boolean;
}

export interface BarLikeChartBorderRadius {
	grouped: BarBorderRadius;
	segmented: SegmentedBarBorderRadius;
}

export interface BarBorderRadius {
	topLeft: number;
	topRight: number;
	bottomLeft: number;
	bottomRight: number;
}

interface SegmentedBarBorderRadius {
	handle: (segmentIndex: number) => BarBorderRadius;
}

export interface TwoDimensionalValueLabels {
	collision: ValueLabelsCollision;
	style: ValueLabelsStyleModel;
}

export interface ValueLabelsCollision {
	otherValueLables: OtherValueLables;
	chartBlock: ValueLabelsChartBlock;
}

export interface OtherValueLables {
	mode: ValueLabelsCollisionMode;
}

export interface ValueLabelsStyleModel {
	cssClassName?: string;
	fontSize: number;
	color: string;
}

export interface ValueLabelsChartBlock {
	left: ValueLabelsChartBlockSide;
	right: ValueLabelsChartBlockSide;
	top: ValueLabelsChartBlockSide;
	bottom: ValueLabelsChartBlockSide;
}

export type ValueLabelsChartBlockSide =
	| {
			mode: "shift";
			hasCollision: (labelClientRect: BoundingRect) => boolean;
			shiftCoordinate: (labelClientRect: BoundingRect) => void;
	  }
	| {
			mode: "none";
	  };

//====================================================== PolarOptionsModel
export interface DonutChartSettings extends Omit<DonutOptionsCanvas, "aggregatorPad" | "thickness"> {
	aggregator: DonutAggregatorModel;
	thickness: DonutThicknessOptions;
}
export interface DonutAggregatorModel {
	margin: number;
	content: DonutAggregatorContent;
}
export interface DonutAggregatorContent {
	value: string | number;
	title: string;
}

export type DonutThicknessUnit = UnitsFromConfig;
export interface DonutThicknessOptions {
	min: number;
	max: number;
	value: number;
	unit: DonutThicknessUnit;
}

//====================================================== Charts
interface ChartModel {
	cssClasses: string[];
	style: ChartStyle;
}

export interface ChartStyle {
	elementColors: string[];
	opacity: number;
}

export type ChartLegendMarkerModel =
	| { markerShape: "circle" }
	| { markerShape: "bar"; barViewOptions: TwoDimensionalChartLegendBarModel }
	| {
			markerShape: "line";
			lineViewOptions: TwoDimensionalChartLegendLineModel;
	  };

export type LegendMarkerShape = ChartLegendMarkerModel["markerShape"];

export interface TwoDimensionalChartLegendBarModel {
	hatch: BarLikeChartHatchOptions;
	borderRadius: BarBorderRadius;
	width: number;
}

export interface TwoDimensionalChartLegendLineModel extends Omit<TwoDimensionalLineLikeChartViewModel, "renderForKey"> {
	length: number;
}

interface TwoDimensionalLineLikeChartModel {
	lineLikeViewOptions: TwoDimensionalLineLikeChartViewModel;
	markersOptions: MarkersOptions;
}

interface TwoDimensionalLineLikeChartViewModel {
	dashedStyles: LineLikeChartDashOptions;
	strokeWidth: number;
	renderForKey: LineLikeChartRenderFn;
}

export type LineLikeChartRenderFn = (dataRow: MdtChartsDataRow, valueFieldName: string) => boolean;

interface TwoDimensionalBarLikeChartModel {
	barViewOptions: TwoDimensionalBarLikeChartViewModel;
}

export interface TwoDimensionalBarLikeChartViewModel {
	hatch: BarLikeChartHatchOptions;
	borderRadius: BarLikeChartBorderRadius;
	barIndexes: number[];
}

interface TwoDimensionalAreaChartModel {
	areaViewOptions: AreaChartViewOptions;
}

export interface AreaChartViewOptions {
	fill: AreaViewFill;
	borderLine: AreaViewBorderLine;
}

export type AreaViewFill = { type: "paletteColor" } | { type: "gradient"; ids: GradientId[] };

export interface AreaViewBorderLine {
	on: boolean;
	colorStyle: ChartStyle;
}

export interface DotChartModel {
	dotViewOptions: DotChartViewModel;
}
export interface DotChartViewModel {
	shape: DotChartShapeOptions;
}
interface DotChartShapeOptions {
	type: "line";
	handleStartCoordinate: (calculatedBandItemStartCoordinate: number) => number;
	handleEndCoordinate: (calculatedBandItemSize: number) => number;
	width: number;
}

export interface TwoDimensionalChartModel
	extends ChartModel,
		TwoDimensionalLineLikeChartModel,
		TwoDimensionalBarLikeChartModel,
		TwoDimensionalAreaChartModel,
		DotChartModel,
		DotChartModel {
	type: TwoDimensionalChartType;
	data: TwoDimensionalChartDataModel;
	index: number;
	embeddedLabels: EmbeddedLabelTypeModel;
	isSegmented: boolean;
	legend: ChartLegendMarkerModel;
	valueLabels: TwoDimChartValueLabelsOptions;
}

export interface PolarChartModel extends ChartModel {
	type: PolarChartType;
	data: PolarChartDataModel;
	legend: ChartLegendMarkerModel;
}

//====================================================== TwoDimensionalChartModel
export interface TwoDimensionalChartDataModel {
	valueFields: ValueField[];
	valueGroup?: TwoDimensionalValueGroup;
}

export interface ValueField extends Field {
	title: string;
}

export interface ValueLabelsInnerContentSetterOptions {
	dataRow: MdtChartsDataRow;
	fieldName: MdtChartsFieldName;
}

export type ValueLabelsInnerContentSetter = (options: ValueLabelsInnerContentSetterOptions) => {
	rows: (string | number)[];
};

export interface TwoDimChartValueLabelsOptions {
	enabled: boolean;
	handleX: (scaledValue: number) => number;
	handleY: (scaledValue: number) => number;
	textAnchor: ValueLabelAnchor;
	forFields: MdtChartsFieldName[];
	dominantBaseline: ValueLabelDominantBaseline;
	setContent: ValueLabelsInnerContentSetter;
	handleScaledValue: (dataRow: MdtChartsDataRow, datumField: string) => number;
	rotation?: ValueLabelsRotationOptions;
	handleElement?: ValueLabelsHandleElement;
}

export type ValueLabelsFormatter = (value: number) => string;

export interface MarkersOptions {
	shouldForceShow: MarkersVisibilityFn;
	shouldForceHide: MarkersVisibilityFn;
	styles: MarkersStyleOptions;
}

export type MarkDotDatumItem = MdtChartsDataRow | ({ "1": any } & Array<number>);

export interface MarkersVisibilityFnOptions {
	row: MarkDotDatumItem;
	valueFieldName: string;
}
export type MarkersVisibilityFn = (options: MarkersVisibilityFnOptions) => boolean;

export interface MarkersStyleOptions {
	highlighted: MarkerStyle;
	normal: MarkerStyle;
}

interface MarkerStyle {
	size: MarkersBaseSizeOptions;
}

interface MarkersBaseSizeOptions {
	radius: number;
	borderSize: string;
}

//====================================================== PolarChartModel
export interface PolarChartDataModel {
	valueField: ValueField;
	colorField?: MdtChartsColorField;
}

//====================================================== DataSettings
export interface DataSettings {
	scope: DataScope;
	format: DataFormat;
}
export interface DataScope {
	hidedRecordsAmount: number;
	allowableKeys: string[];
}
export interface DataFormat {
	formatters: Formatter;
}

//====================================================== OtherComponents
export interface OtherCommonComponents {
	legendBlock: LegendBlockModel;
	titleBlock: TitleBlockModel;
	tooltipBlock: TooltipSettings;
}
interface ComponentBlockModel {
	margin: BlockMargin;
	size: number;
	pad: number;
}
export interface LegendBlockModel {
	coordinate: LegendCoordinate;
	static: StaticLegendBlockCanvas;
}
export interface LegendCoordinate {
	top: LegendCanvasCoordinate;
	bottom: LegendCanvasCoordinate;
	left: LegendCanvasCoordinate;
	right: LegendCanvasCoordinate;
}

export interface TitleBlockModel extends ComponentBlockModel {}
interface LegendCanvasCoordinate extends ComponentBlockModel {}

export type RecordOverflowAlertModel =
	| {
			show: false;
	  }
	| {
			show: true;
			textContent: string;
			positionAttrs: RecordOverflowAlertPositionAttrs;
	  };

export interface RecordOverflowAlertPositionAttrs {
	top?: string;
	bottom?: string;
	right?: string;
	left?: string;
}
