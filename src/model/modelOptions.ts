import { Config } from '../config/config';
import { Model, BlockCanvas, ChartBlock, TwoDimensionalOptionsModel, PolarOptionsModel, BlockMargin, LegendBlockModel, DataSettings, ChartSettings, DataFormat, DataScope, DataSource, IntervalOptionsModel } from './model';
import { MarginModel } from './marginModel';
import { TwoDimensionalModel } from './twoDimensionalModel';
import { PolarModel } from './polarModel';
import '../style/main.css'

import designerConfig from '../designer/designerConfigOptions';
import { DataManagerModel } from './dataManagerModel';
import { DesignerConfig } from '../designer/designerConfig';
import { IntervalModel } from './intervalModel';
import { LegendModel } from './legendModel/legendModel';


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
        return PolarModel.getOptions(config, designerConfig.chart.style.palette, data, dataScope);
    } else if(config.options.type === 'interval') {
        return IntervalModel.getOptions(config, designerConfig, margin, dataScope, data)
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
            barDistance: designerConfig.canvas.chartOptions.bar.barDistance,
            barMaxSize: designerConfig.canvas.chartOptions.bar.maxBarWidth
        }
    }
}

function getDataFormat(designerConfig: DesignerConfig): DataFormat {
    return {
        formatters: designerConfig.dataFormat.formatters
    }
}

export function assembleModel(config: Config, data: DataSource): Model {
    const legendBlock: LegendBlockModel = LegendModel.getBaseLegendBlockModel();
    const margin = MarginModel.getMargin(designerConfig, config, legendBlock, data);
    const dataScope = DataManagerModel.getDataScope(config, margin, data, designerConfig);
    const preparedData = DataManagerModel.getPreparedData(data, dataScope.allowableKeys, config);    
    
    // if(config.options.type === 'polar')
    //     MarginModel.recalcPolarMarginWithScopedData(margin, designerConfig, config, legendBlock, dataScope); 
    MarginModel.recalcMargnWitVerticalAxisLabel(margin, data, config, designerConfig);

    const blockCanvas = getBlockCanvas(config);
    const chartBlock = getChartBlock(margin);
    const options = getOptions(config, designerConfig, margin, dataScope, preparedData);
    const dataSettings = getDataSettings(dataScope);
    const chartSettings = getChartSettings(designerConfig);
    const dataFormat = getDataFormat(designerConfig);
    console.log(margin);
    
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

export function getPreparedData(model: Model, data: DataSource, config: Config): DataSource {
    const preparedData = DataManagerModel.getPreparedData(data, model.dataSettings.scope.allowableKeys, config);
    return preparedData;
}

export function getUpdatedModel(config: Config, data: DataSource): Model {
    return assembleModel(config, data);
}