import { MdtChartsConfig, MdtChartsDataSource, Size } from "../config/config";
import { Model, BlockCanvas, ChartBlockModel, DataSettings, DataFormat, DataScope, OptionsModel } from "./model";
import { MarginModel } from "./margin/marginModel";
import { TwoDimensionalModel } from "./notations/twoDimensionalModel";
import { PolarModel } from "./notations/polar/polarModel";
import { DataManagerModel } from "./dataManagerModel/dataManagerModel";
import { DesignerConfig, Transitions } from "../designer/designerConfig";
import { OtherComponentsModel } from "./featuresModel/otherComponents";
import { ConfigValidator } from "./configsValidator/configValidator";
import { ModelInstance } from "./modelInstance/modelInstance";
import { TwoDimConfigReader } from "./modelInstance/configReader/twoDimConfigReader/twoDimConfigReader";
import { TitleConfigReader } from "./modelInstance/titleConfigReader";

export enum AxisType {
	Key,
	Value
}

export const CLASSES = {
	dataLabel: "data-label",
	legendLabel: "legend-label",
	legendColor: "legend-circle",
	legendItem: "legend-item"
};

export const styledElementValues = {
	defaultLegendMarkerSizes: {
		widthPx: 11,
		heightPx: 11,
		marginRightPx: 6
	},
	legend: {
		inlineLegendOneLineHeightPx: 21,
		inlineItemWrapperMarginRightPx: 12,
		inlineDynamicItemWrapperMarginRightPx: 2
	}
};

function getBlockCanvas(config: MdtChartsConfig, modelInstance: ModelInstance): BlockCanvas {
	const emptyBlockParams: Size = { width: 0, height: 0 };
	const size: Size = ConfigValidator.validateCanvasSize(modelInstance.canvasModel.getBlockSize())
		? { ...modelInstance.canvasModel.getBlockSize() }
		: emptyBlockParams;
	return {
		size,
		cssClass: config.canvas.class
	};
}

function getChartBlockModel(modelInstance: ModelInstance): ChartBlockModel {
	return {
		margin: modelInstance.canvasModel.getMargin()
	};
}

function getOptions(
	config: MdtChartsConfig,
	designerConfig: DesignerConfig,
	modelInstance: ModelInstance
): OptionsModel {
	//TODO: migrate to polymorphism
	if (config.options.type === "2d") {
		return TwoDimensionalModel.getOptions(
			new TwoDimConfigReader(config, designerConfig),
			designerConfig,
			modelInstance
		);
	} else if (config.options.type === "polar") {
		return PolarModel.getOptions(config.options, designerConfig, modelInstance);
	}
	throw new Error("Unknown chart type");
}

function getDataSettings(dataScope: DataScope, designerConfig: DesignerConfig): DataSettings {
	return {
		scope: dataScope,
		format: getDataFormat(designerConfig)
	};
}

function getDataFormat(designerConfig: DesignerConfig): DataFormat {
	return {
		formatters: designerConfig.dataFormat.formatters
	};
}

export function assembleModel(
	config: MdtChartsConfig,
	data: MdtChartsDataSource,
	designerConfig: DesignerConfig,
	chartBlockVersion: number
): Model {
	const modelInstance = ModelInstance.create(config, data, designerConfig, chartBlockVersion);

	if (!data || Object.keys(data).length === 0)
		return {
			blockCanvas: getBlockCanvas(config, modelInstance),
			chartBlock: null,
			otherComponents: null,
			options: null,
			dataSettings: null
		};

	const otherComponents = OtherComponentsModel.getOtherComponentsModel(
		{
			elementsOptions: designerConfig.elementsOptions,
			legendConfig: designerConfig.canvas.legendBlock,
			titleConfig: TitleConfigReader.create(config.options.title, modelInstance)
		},
		modelInstance
	);
	const marginModel = new MarginModel(designerConfig, config);
	marginModel.initMargin(otherComponents, modelInstance);
	DataManagerModel.initDataScope(config, data, designerConfig, otherComponents.legendBlock, modelInstance);

	if (config.options.type === "2d" && config.options.axis.key.visibility)
		marginModel.recalcMarginByVerticalAxisLabel(modelInstance);

	const blockCanvas = getBlockCanvas(config, modelInstance);
	const chartBlock = getChartBlockModel(modelInstance);
	const options = getOptions(config, designerConfig, modelInstance);
	const dataSettings = getDataSettings(modelInstance.dataModel.getScope(), designerConfig);

	modelInstance.canvasModel.roundMargin();

	return {
		blockCanvas,
		chartBlock,
		otherComponents,
		options,
		dataSettings,
		transitions: designerConfig.transitions
	};
}

export function getPreparedData(
	model: Model,
	data: MdtChartsDataSource,
	config: MdtChartsConfig
): MdtChartsDataSource | null {
	const isModelOrDataEmpty = !model || Object.keys(model).length === 0 || !data || Object.keys(data).length === 0;
	if (isModelOrDataEmpty) return null;

	const preparedData: MdtChartsDataSource = {
		[config.options.data.dataSource]: model.dataSettings.scope.scopedRecords
	};
	return preparedData;
}
