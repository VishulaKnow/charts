import { Config } from '../config/config';
import { Model, BlockCanvas, ChartBlock, TwoDimensionalOptionsModel, PolarOptionsModel, BlockMargin, LegendBlockModel, DataSettings, ChartSettings, DataFormat, DataScope, DataRow, DataSource } from './model';
import { MarginModel } from './marginModel';
import { TwoDimensionalModel } from './twoDimensionalModel';
import { PolarModel } from './polarModel';
import '../style/main.css'

import config from '../config/configOptions';
import designerConfig from '../designer/designerConfigOptions';
import { DataManagerModel } from './dataManagerModel';
import { DesignerConfig } from '../designer/designerConfig';


export enum AxisType {
    Key, Value
}

export const CLASSES = {
    mainWrapper: 'main-wrapper',

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
        class: config.canvas.class
    }
}

function getChartBlock(margin: BlockMargin): ChartBlock {
    return {
        margin
    }
}

function getOptions(config: Config, designerConfig: DesignerConfig, margin: BlockMargin, dataScope: DataScope, data: DataSource): TwoDimensionalOptionsModel | PolarOptionsModel {
    if(config.options.type === '2d') {
        return TwoDimensionalModel.get2DOptions(config, designerConfig, config.options, designerConfig.canvas.axisLabel, designerConfig.chart.style.palette, margin, dataScope.allowableKeys, data);
    } else {
        return PolarModel.getPolarOptions(config.options, designerConfig.chart.style.palette, data, dataScope);
    }
} 

function getDataSettings(dataScope: DataScope): DataSettings {
    return {
        scope: dataScope
    }
}

function getChartSettings(designerConfig: DesignerConfig): ChartSettings {
    return {
        bar: {
            groupDistance: designerConfig.canvas.chartOptions.bar.groupDistance,
            barDistance: designerConfig.canvas.chartOptions.bar.barDistance
        }
    }
}

function getDataFormat(designerConfig: DesignerConfig): DataFormat {
    return {
        formatters: designerConfig.dataFormat.formatters
    }
}

function assembleModel(data: any = null): Model {
    if(!data)
        data = require('../assets/dataSet.json');

    const legendBlock: LegendBlockModel = {
        bottom: { size: 0 },
        left: { size: 0 },
        right: { size: 0 },
        top: { size: 0 }
    }
    const margin = MarginModel.getMargin(designerConfig, config, legendBlock, data);
    const dataScope = DataManagerModel.getDataScope(config, margin, data, designerConfig);

    const blockCanvas = getBlockCanvas(config);
    const chartBlock = getChartBlock(margin);
    const options = getOptions(config, designerConfig, margin, dataScope, data);
    const dataSettings = getDataSettings(dataScope);
    const chartSettings = getChartSettings(designerConfig);
    const dataFormat = getDataFormat(designerConfig);
    
    return {
        blockCanvas,
        chartBlock,
        legendBlock,
        options,
        dataSettings,
        chartSettings, 
        dataFormat
    }
}

export const model = assembleModel();
export function getUpdatedModel(data: any = null): Model {
    return assembleModel(data);
}