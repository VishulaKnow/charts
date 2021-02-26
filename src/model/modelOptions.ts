import { Config } from '../config/config';
import { Model, BlockCanvas, ChartBlock, TwoDimensionalOptionsModel, PolarOptionsModel, BlockMargin, DataSettings, ChartSettings, DataFormat, DataScope, DataSource, IntervalOptionsModel } from './model';
import { MarginModel } from './marginModel';
import { TwoDimensionalModel } from './twoDimensionalModel';
import { PolarModel } from './polarModel';

import { DataManagerModel } from './dataManagerModel';
import { BarOptionsCanvas, DesignerConfig, DonutOptionsCanvas } from '../designer/designerConfig';
import { IntervalModel } from './intervalModel';
import { OtherComponentsModel } from './otherComponents';


export enum AxisType {
    Key, Value
}

export const CLASSES = {
    dataLabel: 'data-label',
    legendLabel: 'legend-label',
    legendColor: 'legend-circle',
    legendItem: 'legend-item',
}

function getBlockCanvas(config: Config): BlockCanvas {
    return {
        size: {
            width: config.canvas.size.width,
            height: config.canvas.size.height
        },
        cssClass: config.canvas.class
    }
}

function getChartBlock(margin: BlockMargin): ChartBlock {
    return {
        margin
    }
}

function getOptions(config: Config, designerConfig: DesignerConfig, margin: BlockMargin, dataScope: DataScope, data: DataSource): TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel {
    if(config.options.type === '2d') {
        return TwoDimensionalModel.getOptions(config, designerConfig, margin, dataScope, data);
    } else if(config.options.type === 'polar') {
        return PolarModel.getOptions(config, data, margin, designerConfig);
    } else if(config.options.type === 'interval') {
        return IntervalModel.getOptions(config, designerConfig, margin, dataScope, data)
    }
} 

function getDataSettings(dataScope: DataScope, designerConfig: DesignerConfig): DataSettings {
    return {
        scope: dataScope,
        format: getDataFormat(designerConfig)
    }
}

function getChartSettings(barSettings: BarOptionsCanvas, donutSettings: DonutOptionsCanvas): ChartSettings {
    return {
        bar: {...barSettings},
        donut: {
            padAngle: donutSettings.padAngle,
            maxThickness: donutSettings.maxThickness,
            minThickness: donutSettings.minThickness,
        }
    }
}

function getDataFormat(designerConfig: DesignerConfig): DataFormat {
    return {
        formatters: designerConfig.dataFormat.formatters
    }
}

function roundMargin(margin: BlockMargin): void {
    margin.top = Math.ceil(margin.top);
    margin.bottom = Math.ceil(margin.bottom);
    margin.left = Math.ceil(margin.left);
    margin.right = Math.ceil(margin.right);
}

export function assembleModel(config: Config, data: DataSource, designerConfig: DesignerConfig): Model {
    if(!data || Object.keys(data).length === 0)
        return {
            blockCanvas: getBlockCanvas(config),
            chartBlock: null,
            otherComponents: null,
            options: null,
            dataSettings: null,
            chartSettings: null
        }

    const otherComponents = OtherComponentsModel.getOtherComponentsModel();
    const margin = MarginModel.getMargin(designerConfig, config, otherComponents, data);
    const dataScope = DataManagerModel.getDataScope(config, margin, data, designerConfig, otherComponents.legendBlock);
    const preparedData = DataManagerModel.getPreparedData(data, dataScope.allowableKeys, config); 
    
    if(config.options.type === '2d' || config.options.type === 'interval')
        MarginModel.recalcMargnWitVerticalAxisLabel(margin, data, config, designerConfig, dataScope);

    const blockCanvas = getBlockCanvas(config);
    const chartBlock = getChartBlock(margin);
    const options = getOptions(config, designerConfig, margin, dataScope, preparedData);
    const dataSettings = getDataSettings(dataScope, designerConfig);
    const chartSettings = getChartSettings(designerConfig.canvas.chartOptions.bar, designerConfig.canvas.chartOptions.donut);

    if(options.type === 'polar')
        MarginModel.recalcPolarMarginWithScopedData(margin, config.canvas.size, designerConfig, config, otherComponents.legendBlock, dataScope, options);

    roundMargin(margin);

    return {
        blockCanvas,
        chartBlock,
        otherComponents,
        options,
        dataSettings,
        chartSettings
    }
}

export function getPreparedData(model: Model, data: DataSource, config: Config): DataSource {
    if(!model || Object.keys(model).length === 0 || !data || Object.keys(data).length === 0)
        return null;

    const preparedData = DataManagerModel.getPreparedData(data, model.dataSettings.scope.allowableKeys, config);
    return preparedData;
}

export function getUpdatedModel(config: Config, data: DataSource, designerConfig: DesignerConfig): Model {
    return assembleModel(config, data, designerConfig);
}