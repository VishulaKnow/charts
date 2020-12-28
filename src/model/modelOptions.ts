import * as d3 from 'd3'

import { Domain, TwoDimensionalOptions, PolarOptions, TwoDimensionalChart, PolarChart, Axis } from '../config/config';
import { Model, TwoDimensionalChartModel, BlockCanvas, ChartBlock, TwoDimensionalOptionsModel, PolarOptionsModel, PolarChartModel, BlockMargin } from './model';
import { AxisLabelCanvas } from '../designer/designerConfig'

const data = require('../assets/dataSet.json');
import config from '../config/configOptions';
import designerConfig from '../designer/designerConfigOptions';

type DataRow = {
    [field: string]: any
}
type Orient = 'top' | 'bottom' | 'left' | 'right'
enum AxisType {
    Key, Value
}
enum ScaleType {
    Key, Value
}

const CLASSES = {
    dataLabel: 'data-label'
}
const AXISLABELPADDING = 9;

const margin = getMargin();

function getMargin(): BlockMargin {
    const margin = {
        top: designerConfig.canvas.chartBlockMargin.top,
        bottom: designerConfig.canvas.chartBlockMargin.bottom,
        left: designerConfig.canvas.chartBlockMargin.left,
        right: designerConfig.canvas.chartBlockMargin.right
    }
    recalcMarginWithLegend(margin, config.options.charts, designerConfig.canvas.legendBlock.maxWidth);
    if(config.options.type === '2d') {
        recalcMarginWithAxisLabelWidth(margin, config.options.charts, designerConfig.canvas.axisLabel.maxSize.main, config.options.axis);
    }
        
    return margin;
}

function recalcMarginWithLegend(margin: BlockMargin, charts: PolarChart[] | TwoDimensionalChart[], legendMaxWidth: number): void {
    charts.forEach((chart: PolarChart | TwoDimensionalChart) => {
        if(chart.legend.position !== 'off')
            margin[chart.legend.position] += legendMaxWidth;
    });
}

function recalcMarginWithAxisLabelWidth(margin: BlockMargin, charts: TwoDimensionalChart[], labelsMaxWidth: number, axis: Axis): void {
    const keyAxisOrient = getAxisOrient(AxisType.Key, charts[0].orientation, axis.keyAxis.position);
    if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
        const labelTexts = data[charts[0].data.dataSource].map((dataSet: DataRow) => dataSet[charts[0].data.keyField]);
        margin[keyAxisOrient] += getLabelTextMaxWidth(labelsMaxWidth, labelTexts) + AXISLABELPADDING;
    } else {
        const valueAxisOrient = getAxisOrient(AxisType.Value, charts[0].orientation, axis.valueAxis.position);
        const labelTexts = data[charts[0].data.dataSource].map((dataSet: DataRow) => dataSet[charts[0].data.valueField]);
        margin[valueAxisOrient] += getLabelTextMaxWidth(labelsMaxWidth, labelTexts) + AXISLABELPADDING;
    }
}

function getLabelTextMaxWidth(legendMaxWidth: number, labelTexts: any[]): number {
    const textBlock = document.createElement('span');
    textBlock.classList.add(CLASSES.dataLabel);
    let maxWidth = 0;
    labelTexts.forEach((text: string) => {
        textBlock.textContent = text;
        document.body.append(textBlock);
        if(textBlock.getBoundingClientRect().width > maxWidth) {
            maxWidth = textBlock.getBoundingClientRect().width;
        }
    });
    textBlock.remove();
    return maxWidth > legendMaxWidth ? legendMaxWidth : maxWidth;
}

function getScaleRangePeek(scaleType: ScaleType, chartOrientation: string, blockWidth: number, blockHeight: number): number {
    if(chartOrientation === 'vertical')
        return scaleType === ScaleType.Key 
            ? blockWidth - margin.left - margin.right
            : blockHeight - margin.top - margin.bottom;
    return scaleType === ScaleType.Key 
        ? blockHeight - margin.top - margin.bottom
        : blockWidth - margin.left - margin.right;
}

function getScaleDomain(scaleType: ScaleType, configDomain: Domain, data: DataRow[], chart: TwoDimensionalChart, keyAxisPosition: string = null): any[] {
    if(scaleType === ScaleType.Key) {
        return data.map(d => d[chart.data.keyField]);
    } else {
        let domainPeekMin: number;
        let domainPeekMax: number;
        if(configDomain.start === -1)
            domainPeekMin = 0;
        else
            domainPeekMin = configDomain.start;
        if(configDomain.end === -1)
            domainPeekMax = d3.max(data, d => d[chart.data.valueField]);
        else
            domainPeekMax = configDomain.end;
        if(chart.orientation === 'horizontal')
            if(keyAxisPosition === 'start')
                return [domainPeekMin, domainPeekMax];
            else 
                return [domainPeekMax, domainPeekMin]
        else 
            if(keyAxisPosition === 'start')
                return [domainPeekMin, domainPeekMax];
            else 
                return [domainPeekMax, domainPeekMin];
    }
}

function getAxisOrient(axisType: AxisType, chartOrientation: string, axisPosition: string): Orient {
    if(chartOrientation === 'vertical') {
        if(axisPosition === 'start')
            return axisType === AxisType.Key ? 'top' : 'left';
        else
            return axisType === AxisType.Key ? 'bottom' : 'right'
    } else {
        if(axisPosition === 'start')
            return axisType === AxisType.Key ? 'left' : 'top';
        else
            return axisType === AxisType.Key ? 'right' : 'bottom'
    }
}

function getTranslateX(axisType: AxisType, chartOrientation: string, axisPosition: string, blockWidth: number, blockHeight: number): number {
    const orient = getAxisOrient(axisType, chartOrientation, axisPosition);
    if(orient === 'top' || orient === 'left')
        return margin.left;
    else if(orient === 'bottom') 
        return margin.left;
    else
        return blockWidth - margin.right;
}

function getTranslateY(axisType: AxisType, chartOrientation: string, axisPosition: string, blockWidth: number, blockHeight: number): number {
    const orient = getAxisOrient(axisType, chartOrientation, axisPosition);
    if(orient === 'top' || orient === 'left')
        return margin.top;
    else if(orient === 'bottom') 
        return blockHeight - margin.bottom;
    else
        return margin.top;
}

function get2DChartsModel(charts: TwoDimensionalChart[]): TwoDimensionalChartModel[] {
    const chartsModel: TwoDimensionalChartModel[] = [];
    charts.forEach(chart => {
        chartsModel.push({
            type: chart.type,
            data: {
                dataSource: chart.data.dataSource,
                keyField: chart.data.keyField,
                valueField: chart.data.valueField
            }
        });
    });
    return chartsModel;
}

function getPolarChartsModel(charts: PolarChart[], blockWidth: number, blockHeight: number): PolarChartModel[] {
    const chartsModel: PolarChartModel[] = [];
    charts.forEach(chart => {
        chartsModel.push({
            type: chart.type,
            data: {
                dataSource: chart.data.dataSource,
                keyField: chart.data.keyField,
                valueField: chart.data.valueField
            },
            appearanceOptions: {
                innerRadius: chart.appearanceOptions.innerRadius,
                padAngle: chart.appearanceOptions.padAngle
            }
        });
    });
    return chartsModel;
}

function getBlockCanvas(): BlockCanvas {
    return {
        size: {
            width: config.canvas.size.width,
            height: config.canvas.size.height
        },
        class: config.canvas.class
    }
}

function getChartBlock(): ChartBlock {
    return {
        margin
    }
}

function get2DOptions(configOptions: TwoDimensionalOptions, axisLabelDesignerOptions: AxisLabelCanvas): TwoDimensionalOptionsModel {
    return {
        scale: {
            scaleKey: {
                domain: getScaleDomain(ScaleType.Key, configOptions.axis.keyAxis.domain, data[configOptions.charts[0].data.dataSource], configOptions.charts[0]),
                range: {
                    start: 0,
                    end: getScaleRangePeek(ScaleType.Key, configOptions.charts[0].orientation, config.canvas.size.width, config.canvas.size.height)
                }
            },
            scaleValue: {
                domain: getScaleDomain(ScaleType.Value, configOptions.axis.valueAxis.domain, data[configOptions.charts[0].data.dataSource], configOptions.charts[0], configOptions.axis.keyAxis.position),
                range: {
                    start: 0,
                    end: getScaleRangePeek(ScaleType.Value, configOptions.charts[0].orientation, config.canvas.size.width, config.canvas.size.height)
                }
            }
        },
        axis: {
            keyAxis: {
                orient: getAxisOrient(AxisType.Key, configOptions.charts[0].orientation, configOptions.axis.keyAxis.position),
                translate: {
                    translateX: getTranslateX(AxisType.Key, configOptions.charts[0].orientation, configOptions.axis.keyAxis.position, config.canvas.size.width, config.canvas.size.height),
                    translateY: getTranslateY(AxisType.Key, configOptions.charts[0].orientation, configOptions.axis.keyAxis.position, config.canvas.size.width, config.canvas.size.height)
                },
                class: 'key-axis',
                maxLabelSize: axisLabelDesignerOptions.maxSize.main
            },
            valueAxis: {
                orient: getAxisOrient(AxisType.Value, configOptions.charts[0].orientation, configOptions.axis.valueAxis.position),
                translate: {
                    translateX: getTranslateX(AxisType.Value, configOptions.charts[0].orientation, configOptions.axis.valueAxis.position, config.canvas.size.width, config.canvas.size.height),
                    translateY: getTranslateY(AxisType.Value, configOptions.charts[0].orientation, configOptions.axis.valueAxis.position, config.canvas.size.width, config.canvas.size.height)
                },          
                class: 'value-axis',
                maxLabelSize: axisLabelDesignerOptions.maxSize.main
            }
        },
        type: configOptions.type,
        charts: get2DChartsModel(configOptions.charts)
    }
}

function getPolarOptions(configOptions: PolarOptions, blockWidth: number, blockHeight: number): PolarOptionsModel {
    return {
        type: configOptions.type,
        charts: getPolarChartsModel(configOptions.charts, blockWidth, blockHeight),
    }
}

function getOptions(): TwoDimensionalOptionsModel | PolarOptionsModel {
    if(config.options.type === '2d') {
        return get2DOptions(config.options, designerConfig.canvas.axisLabel);
    } else {
        return getPolarOptions(config.options, config.canvas.size.width, config.canvas.size.height);
    }
} 

export function assembleModel(): Model {
    const blockCanvas = getBlockCanvas();
    const chartBlock = getChartBlock();
    const options = getOptions();
    return {
        blockCanvas,
        chartBlock,
        options
    }
}

console.log(margin);

export const model = assembleModel();
export function getUpdatedModel(): Model {
    return assembleModel();
}