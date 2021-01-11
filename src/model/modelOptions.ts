import * as d3 from 'd3'

import { Domain, TwoDimensionalOptions, PolarOptions, TwoDimensionalChart, PolarChart, Axis } from '../config/config';
import { Model, TwoDimensionalChartModel, BlockCanvas, ChartBlock, TwoDimensionalOptionsModel, PolarOptionsModel, PolarChartModel, BlockMargin, LegendBlockModel, DataSettings, ChartSettings, DataFormat } from './model';
import { AxisLabelCanvas } from '../designer/designerConfig'

import config from '../config/configOptions';
import designerConfig from '../designer/designerConfigOptions';
import { Color, ValueFn } from 'd3';
import '../style/main.css'

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
    wrapper: 'wrapper',

    dataLabel: 'data-label',
    legendLabel: 'legend-label',
    legendColor: 'legend-circle',
    legendItem: 'legend-item',

    line: 'line',
    bar: 'bar',
    area: 'area',
    donut: 'donut'
}
const AXIS_LABEL_PADDING = 9;

function getMargin(legendBlockModel: LegendBlockModel, data: any): BlockMargin {
    const margin = {
        top: designerConfig.canvas.chartBlockMargin.top,
        bottom: designerConfig.canvas.chartBlockMargin.bottom,
        left: designerConfig.canvas.chartBlockMargin.left,
        right: designerConfig.canvas.chartBlockMargin.right
    }
    recalcMarginWithLegend(margin, config.options, designerConfig.canvas.legendBlock.maxWidth, legendBlockModel, data);
    if(config.options.type === '2d') {
        recalcMarginWithAxisLabelWidth(margin, config.options.charts, designerConfig.canvas.axisLabel.maxSize.main, config.options.axis, data);
        recalcMarginWithAxisLabelHeight(margin, config.options.charts, config.options.axis);
    }
        
    return margin;
}

function getDataLimitByBarSize(chartsAmount: number, dataLength: number, axisLength: number, minBarWidth: number, groupDistance: number, barDistance: number): number {
    let sumSize = dataLength * (chartsAmount * minBarWidth + (chartsAmount - 1) * barDistance + groupDistance);
    while(dataLength !== 0 && axisLength < sumSize) {
        dataLength--;
        sumSize = dataLength * (chartsAmount * minBarWidth + (chartsAmount - 1) * barDistance + groupDistance);
    }
    return dataLength;
}

function getAxisLength(orientation: 'horizontal' | 'vertical', margin: BlockMargin, blockWidth: number, blockHeight: number): number {
    if(orientation === 'horizontal') {
        return blockHeight - margin.top - margin.bottom;
    } else {
        return blockWidth - margin.left - margin.right;
    }
}

function getValuesSum(values: number[]): number {
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
    }
    return sum;
}

function getDonutRadius(margin: BlockMargin, blockWidth: number, blockHeight: number): number {
    return Math.min(blockHeight - margin.top - margin.bottom, blockWidth - margin.left - margin.right) / 2;
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
            const axisLength = getAxisLength(barCharts[0].orientation, margin, config.canvas.size.width, config.canvas.size.height);
            const dataLength = data[barCharts[0].data.dataSource].length;
            
            const limit = getDataLimitByBarSize(config.options.charts.filter(chart => chart.type === 'bar').length,
                dataLength, 
                axisLength, 
                designerConfig.canvas.chartOptions.bar.minBarWidth, 
                designerConfig.canvas.chartOptions.bar.groupDistance, 
                designerConfig.canvas.chartOptions.bar.barDistance);

            return data[barCharts[0].data.dataSource].slice(0, limit).map((d: DataRow) => d[barCharts[0].data.keyField.name]);
        }
    } else {
        const dataset = data[config.options.charts[0].data.dataSource];
        const valueField = config.options.charts[0].data.valueField.name;
        const keyField = config.options.charts[0].data.keyField.name;
        
        const values = dataset.map((dataRow: DataRow) => dataRow[valueField]);
        let sum = getValuesSum(values);
        const radius = getDonutRadius(margin, config.canvas.size.width, config.canvas.size.height);
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

function recalcMarginWithLegend(margin: BlockMargin, options: TwoDimensionalOptions | PolarOptions, legendMaxWidth: number, legendBlockModel: LegendBlockModel, data: any): void {
    //FIXME Make it better
    if(options.type === '2d') {
        const chartsWithLegendLeft = options.charts.filter((chart: TwoDimensionalChart) => chart.legend.position === 'left');        
        if(chartsWithLegendLeft.length !== 0) {
            const legendSize = getLegendWidth(chartsWithLegendLeft.map(chart => chart.data.dataSource), legendMaxWidth);
            margin.left += legendSize;
            legendBlockModel.left.size = legendSize;
        }

        const chartsWithLegendRight = options.charts.filter((chart: TwoDimensionalChart) => chart.legend.position === 'right');
        if(chartsWithLegendRight.length !== 0) {
            const legendSize = getLegendWidth(chartsWithLegendRight.map(chart => chart.data.dataSource), legendMaxWidth); 
            margin.right += legendSize;
            legendBlockModel.right.size = legendSize;
        }

        const chartsWithLegendBottom = options.charts.filter((chart: TwoDimensionalChart) => chart.legend.position === 'bottom');
        if(chartsWithLegendBottom.length !== 0) {
            const legendSize = getLegendHeight(chartsWithLegendBottom.map(chart => chart.data.dataSource)); 
            margin.bottom += legendSize;
            legendBlockModel.bottom.size = legendSize;
        }

        const chartsWithLegendTop = options.charts.filter((chart: TwoDimensionalChart) => chart.legend.position === 'top');
        if(chartsWithLegendTop.length !== 0) {
            const legendSize = getLegendHeight(chartsWithLegendTop.map(chart => chart.data.dataSource));
            margin.top += legendSize;
            legendBlockModel.top.size = legendSize;
        }
    } else {
        const chartsWithLegendLeft = options.charts.filter((chart: PolarChart) => chart.legend.position === 'left');        
        if(chartsWithLegendLeft.length !== 0) {
            const legendSize = getLegendWidth(chartsWithLegendLeft.map(chart => {
                return data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField.name])
            })[0], legendMaxWidth);
            margin.left += legendSize;
            legendBlockModel.left.size = legendSize;
        }  

        const chartsWithLegendRight = options.charts.filter((chart: PolarChart) => chart.legend.position === 'right');
        if(chartsWithLegendRight.length !== 0) {
            const legendSize = getLegendWidth(chartsWithLegendRight.map(chart => {
                return data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField.name])
            })[0], legendMaxWidth);
            margin.right += legendSize;
            legendBlockModel.right.size = legendSize
        }    

        const chartsWithLegendBottom = options.charts.filter((chart: PolarChart) => chart.legend.position === 'bottom');
        if(chartsWithLegendBottom.length !== 0) {
            const legendSize = getLegendHeight(chartsWithLegendBottom.map(chart => {
                return data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField.name])
            })[0]);
            margin.bottom += legendSize;
            legendBlockModel.bottom.size = legendSize;
        } 

        const chartsWithLegendTop = options.charts.filter((chart: PolarChart) => chart.legend.position === 'top');
        if(chartsWithLegendTop.length !== 0) {
            const legendSize = getLegendHeight(chartsWithLegendTop.map(chart => {
                return data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField.name])
            })[0]);
            margin.top += legendSize;
            legendBlockModel.top.size = legendSize;
        } 
    }
}

function getLegendWidth(texts: string[], legendMaxWidth: number): number {
    let longestText = '';
    texts.forEach(text => {
        if(text.length > longestText.length) 
            longestText = text;
    });
    const maxWidth = getLegendItemWidth(longestText);
    return maxWidth > legendMaxWidth ? legendMaxWidth : maxWidth;
}

function getLegendHeight(texts: string[]): number {
    const legendWrapper = document.createElement('div');
    legendWrapper.style.display = 'flex';
    legendWrapper.style.flexWrap = 'wrap';
    legendWrapper.style.width = config.canvas.size.width + 'px';
    texts.forEach(text => {
        const itemWrapper = document.createElement('div');
        const colorBlock = document.createElement('span');
        const textBlock = document.createElement('span');
        itemWrapper.classList.add(CLASSES.legendItem);
        colorBlock.classList.add(CLASSES.legendColor);
        textBlock.classList.add(CLASSES.legendLabel);
        textBlock.textContent = text;
        itemWrapper.append(colorBlock, textBlock);
        legendWrapper.append(itemWrapper)
    });
    document.querySelector(`.${CLASSES.wrapper}`).append(legendWrapper);
    const height = legendWrapper.offsetHeight;
    legendWrapper.remove();
    return height;
}

function getLegendItemWidth(text: string): number {
    const itemWrapper = document.createElement('div');
    const colorBlock = document.createElement('span');
    const textBlock = document.createElement('span');
    itemWrapper.style.display = 'inline-block';
    itemWrapper.classList.add(CLASSES.legendItem);
    colorBlock.classList.add(CLASSES.legendColor);
    textBlock.classList.add(CLASSES.legendLabel);
    textBlock.textContent = text;
    itemWrapper.append(colorBlock, textBlock);
    document.querySelector(`.${CLASSES.wrapper}`).append(itemWrapper);
    const sumWidth = itemWrapper.getBoundingClientRect().width 
        + parseFloat(window.getComputedStyle(itemWrapper, null).getPropertyValue('margin-left'))
        + parseFloat(window.getComputedStyle(itemWrapper, null).getPropertyValue('margin-right'));
    itemWrapper.remove();
    return sumWidth;
}

function recalcMarginWithAxisLabelWidth(margin: BlockMargin, charts: TwoDimensionalChart[], labelsMaxWidth: number, axis: Axis, data: any): void {
    const keyAxisOrient = getAxisOrient(AxisType.Key, charts[0].orientation, axis.keyAxis.position);
    if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
        const labelTexts = data[charts[0].data.dataSource].map((dataSet: DataRow) => dataSet[charts[0].data.keyField.name]);
        margin[keyAxisOrient] += getLabelTextMaxWidth(labelsMaxWidth, labelTexts) + AXIS_LABEL_PADDING;
    } else {
        const valueAxisOrient = getAxisOrient(AxisType.Value, charts[0].orientation, axis.valueAxis.position);
        const labelTexts = data[charts[0].data.dataSource].map((dataSet: DataRow) => dataSet[charts[0].data.valueField.name]);
        margin[valueAxisOrient] += getLabelTextMaxWidth(labelsMaxWidth, labelTexts) + AXIS_LABEL_PADDING;
    }
}

function recalcMarginWithAxisLabelHeight(margin: BlockMargin, charts: TwoDimensionalChart[], axis: Axis): void {
    let horizontalAxisPosition: string;
    if(charts[0].orientation === 'vertical') {
        horizontalAxisPosition = getAxisOrient(AxisType.Key, charts[0].orientation, axis.keyAxis.position);
    } else {
        horizontalAxisPosition = getAxisOrient(AxisType.Value, charts[0].orientation, axis.valueAxis.position);
    }
    if(horizontalAxisPosition === 'top') {
        console.log(getLabelHeight(CLASSES.dataLabel) + AXIS_LABEL_PADDING);
        
        margin.top += getLabelHeight(CLASSES.dataLabel) + AXIS_LABEL_PADDING;
    } else if(horizontalAxisPosition === 'bottom') {
        console.log(getLabelHeight(CLASSES.dataLabel) + AXIS_LABEL_PADDING);
        margin.bottom += getLabelHeight(CLASSES.dataLabel) + AXIS_LABEL_PADDING;
    }
}

function getLabelHeight(cssClass: string): number {
    const span = document.createElement('span');
    span.classList.add(cssClass);
    document.querySelector(`.${CLASSES.wrapper}`).append(span)    
    const size = parseFloat(window.getComputedStyle(span, null).getPropertyValue('font-size'));
    span.remove();
    return size;
}

function getLabelTextMaxWidth(legendMaxWidth: number, labelTexts: any[]): number {
    const textBlock = document.createElement('span');
    textBlock.classList.add(CLASSES.dataLabel);
    let maxWidth = 0;
    labelTexts.forEach((text: string) => {
        textBlock.textContent = text;
        document.querySelector(`.${CLASSES.wrapper}`).append(textBlock);
        if(textBlock.getBoundingClientRect().width > maxWidth) {
            maxWidth = textBlock.getBoundingClientRect().width;
        }
    });
    textBlock.remove();
    return maxWidth > legendMaxWidth ? legendMaxWidth : maxWidth;
}

function getScaleRangePeek(scaleType: ScaleType, chartOrientation: string, margin: BlockMargin, blockWidth: number, blockHeight: number): number {
    if(chartOrientation === 'vertical')
        return scaleType === ScaleType.Key 
            ? blockWidth - margin.left - margin.right
            : blockHeight - margin.top - margin.bottom;
    return scaleType === ScaleType.Key 
        ? blockHeight - margin.top - margin.bottom
        : blockWidth - margin.left - margin.right;
}

function getScaleDomain(scaleType: ScaleType, configDomain: Domain, data: DataRow[], chart: TwoDimensionalChart, keyAxisPosition: string = null, allowableKeys: string[] = []): any[] {
    if(scaleType === ScaleType.Key) {
        return allowableKeys;
    } else {
        let domainPeekMin: number;
        let domainPeekMax: number;
        if(configDomain.start === -1)
            domainPeekMin = 0;
        else
            domainPeekMin = configDomain.start;
        if(configDomain.end === -1)
            domainPeekMax = d3.max(data, d => d[chart.data.valueField.name]);
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

function getTranslateX(axisType: AxisType, chartOrientation: string, axisPosition: string, margin: BlockMargin, blockWidth: number, blockHeight: number): number {
    const orient = getAxisOrient(axisType, chartOrientation, axisPosition);
    if(orient === 'top' || orient === 'left')
        return margin.left;
    else if(orient === 'bottom') 
        return margin.left;
    else
        return blockWidth - margin.right;
}

function getTranslateY(axisType: AxisType, chartOrientation: string, axisPosition: string, margin: BlockMargin, blockWidth: number, blockHeight: number): number {
    const orient = getAxisOrient(axisType, chartOrientation, axisPosition);
    if(orient === 'top' || orient === 'left')
        return margin.top;
    else if(orient === 'bottom') 
        return blockHeight - margin.bottom;
    else
        return margin.top;
}

function getCssClasses(chartType: string, chartIndex: number): string[] {
    const cssClasses = [`chart-${chartIndex}`];
    if(chartType === 'line')
        cssClasses.concat([CLASSES.line]);
    if(chartType === 'bar')
        cssClasses.concat([CLASSES.bar]);
    if(chartType === 'area')
        cssClasses.concat([CLASSES.area]);
    if(chartType === 'donut')
        cssClasses.concat([CLASSES.donut]);
    return cssClasses
}

function getElementColorPallete(palette: Color[], notation: '2d' | 'polar', index: number = 0): Color[] {
    if(notation === '2d')
        return [palette[index % palette.length]];
    else
        return palette;
}

function get2DChartsModel(charts: TwoDimensionalChart[], chartPalette: Color[]): TwoDimensionalChartModel[] {
    const chartsModel: TwoDimensionalChartModel[] = [];
    charts.forEach((chart, index) => {
        chartsModel.push({
            type: chart.type,
            data: {
                dataSource: chart.data.dataSource,
                keyField: chart.data.keyField,
                valueField: chart.data.valueField
            },
            orient: chart.orientation,
            legend: chart.legend,
            tooltip: chart.tooltip,
            cssClasses: getCssClasses(chart.type, index),
            elementColors: getElementColorPallete(chartPalette, '2d', index)
        });
    });
    return chartsModel;
}

function getPolarChartsModel(charts: PolarChart[], chartPalette: Color[]): PolarChartModel[] {
    const chartsModel: PolarChartModel[] = [];
    charts.forEach((chart, index) => {
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
            },
            legend: chart.legend,
            tooltip: chart.tooltip,
            cssClasses: getCssClasses(chart.type, index),
            elementColors: getElementColorPallete(chartPalette, 'polar')
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

function getChartBlock(margin: BlockMargin): ChartBlock {
    return {
        margin
    }
}

function get2DOptions(configOptions: TwoDimensionalOptions, axisLabelDesignerOptions: AxisLabelCanvas, chartPalette: Color[], margin: BlockMargin, allowableKeys: string[], data: any): TwoDimensionalOptionsModel {
    return {
        scale: {
            scaleKey: {
                domain: getScaleDomain(ScaleType.Key, configOptions.axis.keyAxis.domain, data[configOptions.charts[0].data.dataSource], configOptions.charts[0], null, allowableKeys),
                range: {
                    start: 0,
                    end: getScaleRangePeek(ScaleType.Key, configOptions.charts[0].orientation, margin, config.canvas.size.width, config.canvas.size.height)
                }
            },
            scaleValue: {
                domain: getScaleDomain(ScaleType.Value, configOptions.axis.valueAxis.domain, data[configOptions.charts[0].data.dataSource], configOptions.charts[0], configOptions.axis.keyAxis.position),
                range: {
                    start: 0,
                    end: getScaleRangePeek(ScaleType.Value, configOptions.charts[0].orientation, margin, config.canvas.size.width, config.canvas.size.height)
                }
            }
        },
        axis: {
            keyAxis: {
                orient: getAxisOrient(AxisType.Key, configOptions.charts[0].orientation, configOptions.axis.keyAxis.position),
                translate: {
                    translateX: getTranslateX(AxisType.Key, configOptions.charts[0].orientation, configOptions.axis.keyAxis.position, margin, config.canvas.size.width, config.canvas.size.height),
                    translateY: getTranslateY(AxisType.Key, configOptions.charts[0].orientation, configOptions.axis.keyAxis.position, margin, config.canvas.size.width, config.canvas.size.height)
                },
                class: 'key-axis',
                maxLabelSize: axisLabelDesignerOptions.maxSize.main
            },
            valueAxis: {
                orient: getAxisOrient(AxisType.Value, configOptions.charts[0].orientation, configOptions.axis.valueAxis.position),
                translate: {
                    translateX: getTranslateX(AxisType.Value, configOptions.charts[0].orientation, configOptions.axis.valueAxis.position, margin, config.canvas.size.width, config.canvas.size.height),
                    translateY: getTranslateY(AxisType.Value, configOptions.charts[0].orientation, configOptions.axis.valueAxis.position, margin, config.canvas.size.width, config.canvas.size.height)
                },          
                class: 'value-axis',
                maxLabelSize: axisLabelDesignerOptions.maxSize.main
            }
        },
        type: configOptions.type,
        charts: get2DChartsModel(configOptions.charts, chartPalette)
    }
}

function getPolarOptions(configOptions: PolarOptions, chartPalette: Color[]): PolarOptionsModel {
    return {
        type: configOptions.type,
        charts: getPolarChartsModel(configOptions.charts, chartPalette),
    }
}

function getOptions(margin: BlockMargin, allowableKeys: string[], data: any): TwoDimensionalOptionsModel | PolarOptionsModel {
    if(config.options.type === '2d') {
        return get2DOptions(config.options, designerConfig.canvas.axisLabel, designerConfig.chart.style.palette, margin, allowableKeys, data);
    } else {
        return getPolarOptions(config.options, designerConfig.chart.style.palette);
    }
} 

function getDataSettings(allowableKeys: string[]): DataSettings {
    return {
        allowableKeys
    }
}

function getChartSettings(): ChartSettings {
    return {
        bar: {
            groupDistance: designerConfig.canvas.chartOptions.bar.groupDistance,
            barDistance: designerConfig.canvas.chartOptions.bar.barDistance
        }
    }
}

function getDataFormat(): DataFormat {
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
    const margin = getMargin(legendBlock, data);
    const allowableKeys = getAllowableKeys(margin, data);

    const blockCanvas = getBlockCanvas();
    const chartBlock = getChartBlock(margin);
    const options = getOptions(margin, allowableKeys, data);
    const dataSettings = getDataSettings(allowableKeys);
    const chartSettings = getChartSettings();
    const dataFormat = getDataFormat();
    
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