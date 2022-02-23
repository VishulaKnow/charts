import { MdtChartsConfig, MdtChartsDataSource, Size } from '../config/config';
import { Model, BlockCanvas, ChartBlockModel, TwoDimensionalOptionsModel, PolarOptionsModel, DataSettings, DataFormat, DataScope, IntervalOptionsModel, OptionsModel } from './model';
import { MarginModel } from './margin/marginModel';
import { TwoDimensionalModel } from './notations/twoDimensionalModel';
import { PolarModel } from './notations/polar/polarModel';
import { DataManagerModel } from './dataManagerModel/dataManagerModel';
import { DesignerConfig, Transitions } from '../designer/designerConfig';
import { IntervalModel } from './notations/intervalModel';
import { OtherComponentsModel } from './featuresModel/otherComponents';
import { ConfigValidator } from './configsValidator/configValidator';
import { ModelInstance } from './modelInstance/modelInstance';
import { CardsModelInstance } from './notations/cards/cardsModel';


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

function getOptions(config: MdtChartsConfig, designerConfig: DesignerConfig, modelInstance: ModelInstance): OptionsModel {
    //TODO: migrate to polymorphism
    if (config.options.type === '2d') {
        return TwoDimensionalModel.getOptions(config.options, designerConfig, modelInstance);
    } else if (config.options.type === 'polar') {
        return PolarModel.getOptions(config.options, designerConfig, modelInstance);
    } else if (config.options.type === 'interval') {
        return IntervalModel.getOptions(config.options, designerConfig, modelInstance)
    } else if (config.options.type === "card") {
        return CardsModelInstance.getOptions(config.options, modelInstance);
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
    const modelInstance = ModelInstance.create(config, data);

    if (!data || Object.keys(data).length === 0)
        return {
            blockCanvas: getBlockCanvas(config, modelInstance),
            chartBlock: null,
            otherComponents: null,
            options: null,
            dataSettings: null
        }

    resetFalsyValues(data);

    const otherComponents = OtherComponentsModel.getOtherComponentsModel({ elementsOptions: designerConfig.elementsOptions, title: config.options.title }, modelInstance);
    const marginModel = new MarginModel();
    marginModel.initMargin(designerConfig, config, otherComponents, data, modelInstance);
    DataManagerModel.initDataScope(config, data, designerConfig, otherComponents.legendBlock, modelInstance);

    if (config.options.type === '2d' && config.options.axis.key.visibility)
        marginModel.recalcMarginByVerticalAxisLabel(modelInstance, config.options, designerConfig);

    const blockCanvas = getBlockCanvas(config, modelInstance);
    const chartBlock = getChartBlockModel(modelInstance);
    const options = getOptions(config, designerConfig, modelInstance);
    const dataSettings = getDataSettings(modelInstance.dataModel.getScope(), designerConfig);
    const transitions = getTransitions(designerConfig);

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

function resetFalsyValues(data: MdtChartsDataSource): void {
    for (let setName in data) {
        data[setName].forEach(dataRow => {
            for (let fieldName in dataRow) {
                if (dataRow[fieldName] == null) {
                    dataRow[fieldName] = 0;
                }
            }
        });
    }
}

export function getPreparedData(model: Model, data: MdtChartsDataSource, config: MdtChartsConfig): MdtChartsDataSource {
    resetFalsyValues(data);

    const isModelOrDataEmpty = !model || Object.keys(model).length === 0 || !data || Object.keys(data).length === 0;
    if (isModelOrDataEmpty)
        return null;

    const preparedData = DataManagerModel.getPreparedData(data, model.dataSettings.scope.allowableKeys, config);
    return preparedData;
}