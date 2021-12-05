import { MdtChartsConfig, MdtChartsDataSource, Size } from '../config/config';
import { Model, BlockCanvas, ChartBlockModel, TwoDimensionalOptionsModel, PolarOptionsModel, BlockMargin, DataSettings, TwoDimChartElementsSettings, DataFormat, DataScope, IntervalOptionsModel } from './model';
import { MarginModel } from './marginModel';
import { TwoDimensionalModel } from './notations/twoDimensionalModel';
import { PolarModel } from './notations/polarModel';
import { DataManagerModel } from './dataManagerModel';
import { BarOptionsCanvas, DesignerConfig, DonutOptionsCanvas, Transitions } from '../designer/designerConfig';
import { IntervalModel } from './notations/intervalModel';
import { OtherComponentsModel } from './featuresModel/otherComponents';
import { ConfigValidator } from './configsValidator/configValidator';
import { ModelInstance } from './modelInstance/modelInstance';


export enum AxisType {
    Key, Value
}

export const CLASSES = {
    dataLabel: 'data-label',
    legendLabel: 'legend-label',
    legendColor: 'legend-circle',
    legendItem: 'legend-item',
}

function getBlockCanvas(config: MdtChartsConfig, modelInstance: ModelInstance): BlockCanvas {
    const emptyBlockParams: Size = { width: 0, height: 0 };
    const size: Size = ConfigValidator.validateCanvasSize(modelInstance.canvasModel.getBlockSize()) ? { ...modelInstance.canvasModel.getBlockSize() } : emptyBlockParams
    return {
        size,
        cssClass: config.canvas.class
    }
}

function getChartBlockModel(modelInstance: ModelInstance): ChartBlockModel {
    return {
        margin: modelInstance.canvasModel.getMargin()
    }
}

function getOptions(config: MdtChartsConfig, designerConfig: DesignerConfig, modelInstance: ModelInstance, dataScope: DataScope, data: MdtChartsDataSource): TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel {
    //TODO: migrate to polymorphism
    if (config.options.type === '2d') {
        return TwoDimensionalModel.getOptions(config.options, designerConfig, dataScope, data, modelInstance);
    } else if (config.options.type === 'polar') {
        return PolarModel.getOptions(config.options, data, designerConfig, modelInstance);
    } else if (config.options.type === 'interval') {
        return IntervalModel.getOptions(config, designerConfig, modelInstance.canvasModel.getMargin(), dataScope, data, modelInstance)
    }
}

function getDataSettings(dataScope: DataScope, designerConfig: DesignerConfig): DataSettings {
    return {
        scope: dataScope,
        format: getDataFormat(designerConfig)
    }
}

function getDataFormat(designerConfig: DesignerConfig): DataFormat {
    return {
        formatters: designerConfig.dataFormat.formatters
    }
}

function getTransitions(designerConfig: DesignerConfig): Transitions {
    return designerConfig.transitions;
}

export function assembleModel(config: MdtChartsConfig, data: MdtChartsDataSource, designerConfig: DesignerConfig): Model {
    const modelInstance = new ModelInstance();
    modelInstance.canvasModel.initBlockSize(config.canvas.size);

    if (!data || Object.keys(data).length === 0)
        return {
            blockCanvas: getBlockCanvas(config, modelInstance),
            chartBlock: null,
            otherComponents: null,
            options: null,
            dataSettings: null
        }

    resetFalsyValues(data, config.options.data.keyField.name);

    const otherComponents = OtherComponentsModel.getOtherComponentsModel({ elementsOptions: designerConfig.elementsOptions, notation: config.options.type, title: config.options.title });
    MarginModel.initMargin(designerConfig, config, otherComponents, data, modelInstance);
    const dataScope = DataManagerModel.getDataScope(config, data, designerConfig, otherComponents.legendBlock, modelInstance);
    const preparedData = DataManagerModel.getPreparedData(data, dataScope.allowableKeys, config);

    if (config.options.type === '2d' && config.options.axis.key.visibility)
        MarginModel.recalcMarginByVerticalAxisLabel(modelInstance, config, designerConfig, dataScope);

    const blockCanvas = getBlockCanvas(config, modelInstance);
    const chartBlock = getChartBlockModel(modelInstance);
    const options = getOptions(config, designerConfig, modelInstance, dataScope, preparedData);
    const dataSettings = getDataSettings(dataScope, designerConfig);
    const transitions = getTransitions(designerConfig);

    if (options.type === 'polar')
        MarginModel.recalcPolarMarginWithScopedData(modelInstance, config.canvas.size, designerConfig, config, otherComponents.legendBlock, dataScope, options);

    modelInstance.canvasModel.roundMargin();

    return {
        blockCanvas,
        chartBlock,
        otherComponents,
        options,
        dataSettings,
        transitions
    }
}

function resetFalsyValues(data: MdtChartsDataSource, keyFieldName: string): void {
    for (let setName in data) {
        data[setName].forEach(dataRow => {
            for (let fieldName in dataRow) {
                if (fieldName === keyFieldName && !dataRow[fieldName]) {
                    dataRow[fieldName] = '';
                } else if (dataRow[fieldName] !== 0 && !dataRow[fieldName]) {
                    dataRow[fieldName] = 0;
                }
            }
        });
    }
}

export function getPreparedData(model: Model, data: MdtChartsDataSource, config: MdtChartsConfig): MdtChartsDataSource {
    resetFalsyValues(data, config.options.data.keyField.name);

    const isModelOrDataEmpty = !model || Object.keys(model).length === 0 || !data || Object.keys(data).length === 0;
    if (isModelOrDataEmpty)
        return null;

    const preparedData = DataManagerModel.getPreparedData(data, model.dataSettings.scope.allowableKeys, config);
    return preparedData;
}

export function getUpdatedModel(config: MdtChartsConfig, data: MdtChartsDataSource, designerConfig: DesignerConfig): Model {
    return assembleModel(config, data, designerConfig);
}