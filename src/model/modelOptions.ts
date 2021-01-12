import * as d3 from 'd3'

import { PolarOptions, PolarChart, Config } from '../config/config';
import { Model, BlockCanvas, ChartBlock, TwoDimensionalOptionsModel, PolarOptionsModel, PolarChartModel, BlockMargin, LegendBlockModel, DataSettings, ChartSettings, DataFormat, Size } from './model';
import { BarOptionsCanvas, DesignerConfig } from '../designer/designerConfig'

import config from '../config/configOptions';
import designerConfig from '../designer/designerConfigOptions';
import { Color } from 'd3';
import '../style/main.css'
import { MarginModel } from './marginModel/marginModel';
import { AxisModel } from './axisModel/axisModel';
import { ChartStyleModel } from './chartStyleModel/chartStyleModel';
import { TwoDimensionalModel } from './twoDimensionalModel/twoDimensionalModel';
import { PolarModel } from './polarModel/polarModel';

type DataRow = {
    [field: string]: any
}
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

function getDataLimitByBarSize(chartsAmount: number, dataLength: number, axisLength: number, barOptions: BarOptionsCanvas): number {
    let sumSize = dataLength * (chartsAmount * barOptions.minBarWidth + (chartsAmount - 1) * barOptions.barDistance + barOptions.groupDistance);
    while(dataLength !== 0 && axisLength < sumSize) {
        dataLength--;
        sumSize = dataLength * (chartsAmount * barOptions.minBarWidth + (chartsAmount - 1) * barOptions.barDistance + barOptions.groupDistance);
    }
    return dataLength;
}

function getValuesSum(values: number[]): number {
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
    }
    return sum;
}

function getDonutRadius(margin: BlockMargin, blockSize: Size): number {
    return Math.min(blockSize.height - margin.top - margin.bottom, blockSize.width - margin.left - margin.right) / 2;
}

function getAngleByValue(value: number, valuesSum: number): number {
    return value / valuesSum * 360;
}

function getMinAngleByLength(minLength: number, radius: number): number {
    return minLength * 360 / (2 * Math.PI * radius);
}

function getAllowableKeys(margin: BlockMargin, data: any): string[] {
    if(config.options.type === '2d') {
        const barCharts = config.options.charts.filter(chart => chart.type === 'bar');
        if(barCharts.length !== 0) {
            const axisLength = AxisModel.getAxisLength(barCharts[0].orientation, margin, config.canvas.size);
            const dataLength = data[barCharts[0].data.dataSource].length;
            
            const limit = getDataLimitByBarSize(config.options.charts.filter(chart => chart.type === 'bar').length,
                dataLength, 
                axisLength, 
                designerConfig.canvas.chartOptions.bar);

            return data[barCharts[0].data.dataSource].slice(0, limit).map((d: DataRow) => d[barCharts[0].data.keyField.name]);
        }
    } else {
        const dataset = data[config.options.charts[0].data.dataSource];
        const valueField = config.options.charts[0].data.valueField.name;
        const keyField = config.options.charts[0].data.keyField.name;
        
        const values = dataset.map((dataRow: DataRow) => dataRow[valueField]);
        let sum = getValuesSum(values);
        const radius = getDonutRadius(margin, config.canvas.size);
        const minAngle = getMinAngleByLength(designerConfig.canvas.chartOptions.donut.minPartSize, radius);
        
        const allowableKeys: string[] = [];
        dataset.forEach((dataRow: DataRow) => {
            const angle = getAngleByValue(dataRow[valueField], sum);
            if(angle > minAngle)
                allowableKeys.push(dataRow[keyField])
        });
        return allowableKeys;
    }
    return data[config.options.charts[0].data.dataSource].map((d: DataRow) => d[config.options.charts[0].data.keyField.name]);
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

function getPolarOptions(configOptions: PolarOptions, chartPalette: Color[]): PolarOptionsModel {
    return {
        type: configOptions.type,
        charts: PolarModel.getPolarChartsModel(configOptions.charts, chartPalette),
    }
}

function getOptions(config: Config, designerConfig: DesignerConfig, margin: BlockMargin, allowableKeys: string[], data: any): TwoDimensionalOptionsModel | PolarOptionsModel {
    if(config.options.type === '2d') {
        return TwoDimensionalModel.get2DOptions(config, designerConfig, config.options, designerConfig.canvas.axisLabel, designerConfig.chart.style.palette, margin, allowableKeys, data);
    } else {
        return getPolarOptions(config.options, designerConfig.chart.style.palette);
    }
} 

function getDataSettings(allowableKeys: string[]): DataSettings {
    return {
        allowableKeys
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
    const allowableKeys = getAllowableKeys(margin, data);

    const blockCanvas = getBlockCanvas(config);
    const chartBlock = getChartBlock(margin);
    const options = getOptions(config, designerConfig, margin, allowableKeys, data);
    const dataSettings = getDataSettings(allowableKeys);
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