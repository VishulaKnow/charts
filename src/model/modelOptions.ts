import * as d3 from 'd3'

import { Domain, TwoDimensionalOptions, PolarOptions, TwoDimensionalChart, PolarChart, Axis } from '../config/config';
import { Model, TwoDimensionalChartModel, BlockCanvas, ChartBlock, TwoDimensionalOptionsModel, PolarOptionsModel, PolarChartModel, BlockMargin, LegendBlockModel, DataSettings, ChartSettings } from './model';
import { AxisLabelCanvas } from '../designer/designerConfig'

const data = require('../assets/dataSet.json');
import config from '../config/configOptions';
import designerConfig from '../designer/designerConfigOptions';
import { Color, index } from 'd3';

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

function getMargin(legendBlockModel: LegendBlockModel): BlockMargin {
    const margin = {
        top: designerConfig.canvas.chartBlockMargin.top,
        bottom: designerConfig.canvas.chartBlockMargin.bottom,
        left: designerConfig.canvas.chartBlockMargin.left,
        right: designerConfig.canvas.chartBlockMargin.right
    }
    recalcMarginWithLegend(margin, config.options, designerConfig.canvas.legendBlock.maxWidth, legendBlockModel);
    if(config.options.type === '2d') {
        recalcMarginWithAxisLabelWidth(margin, config.options.charts, designerConfig.canvas.axisLabel.maxSize.main, config.options.axis);
    }
        
    return margin;
}

function getDataLimit(dataLength: number, axisLength: number, minBarWidth: number, barDistance: number): number {
    let sumSize = dataLength * (minBarWidth + barDistance);
    while(dataLength !== 0 && axisLength < sumSize) {
        dataLength--;
        sumSize = dataLength * (minBarWidth + barDistance);
    }
    return dataLength;
}

function calcDataLimit(margin: BlockMargin): number {
    let limit: number = -1;
    if(config.options.type === '2d') {
        const barCharts = config.options.charts.filter(chart => chart.type === 'bar');
        if(barCharts.length !== 0) {
            let axisLength: number;
            if(barCharts.map(chart => chart.orientation).findIndex(s => s === 'vertical') !== -1) {
                axisLength = config.canvas.size.width - margin.left - margin.right;
            } else {
                axisLength = config.canvas.size.height - margin.top - margin.bottom;
            }
            const dataLength = data[barCharts[0].data.dataSource].length;
            limit = getDataLimit(dataLength, axisLength, designerConfig.canvas.chartOptions.bar.minBarWidth, designerConfig.canvas.chartOptions.bar.barDistance);
        }
    }
    return limit;
}

function recalcMarginWithLegend(margin: BlockMargin, options: TwoDimensionalOptions | PolarOptions, legendMaxWidth: number, legendBlockModel: LegendBlockModel): void {
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
                return data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField])
            })[0], legendMaxWidth);
            margin.left += legendSize;
            legendBlockModel.left.size = legendSize;
        }  

        const chartsWithLegendRight = options.charts.filter((chart: PolarChart) => chart.legend.position === 'right');
        if(chartsWithLegendRight.length !== 0) {
            const legendSize = getLegendWidth(chartsWithLegendRight.map(chart => {
                return data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField])
            })[0], legendMaxWidth);
            margin.right += legendSize;
            legendBlockModel.right.size = legendSize
        }    

        const chartsWithLegendBottom = options.charts.filter((chart: PolarChart) => chart.legend.position === 'bottom');
        if(chartsWithLegendBottom.length !== 0) {
            const legendSize = getLegendHeight(chartsWithLegendBottom.map(chart => {
                return data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField])
            })[0]);
            margin.bottom += legendSize;
            legendBlockModel.bottom.size = legendSize;
        } 

        const chartsWithLegendTop = options.charts.filter((chart: PolarChart) => chart.legend.position === 'top');
        if(chartsWithLegendTop.length !== 0) {
            const legendSize = getLegendHeight(chartsWithLegendTop.map(chart => {
                return data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField])
            })[0]);
            margin.top += legendSize;
            legendBlockModel.top.size = legendSize;
        } 
    }
}

function getLegendWidth(texts: string[], legendMaxWidth: number): number {
    let maxWidth = 0;
    texts.forEach(text => {
        const width = getLegendItemWidth(text);
        if(maxWidth < width)
            maxWidth = width;
    });
    return maxWidth > legendMaxWidth ? legendMaxWidth : maxWidth;
}

function getLegendHeight(texts: string[]): number {
    const legendWrapper = document.createElement('div');
    legendWrapper.style.display = 'flex';
    legendWrapper.style.flexWrap = 'wrap';
    legendWrapper.style.width = 900 + 'px';
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

function recalcMarginWithAxisLabelWidth(margin: BlockMargin, charts: TwoDimensionalChart[], labelsMaxWidth: number, axis: Axis): void {
    const keyAxisOrient = getAxisOrient(AxisType.Key, charts[0].orientation, axis.keyAxis.position);
    if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
        const labelTexts = data[charts[0].data.dataSource].map((dataSet: DataRow) => dataSet[charts[0].data.keyField]);
        margin[keyAxisOrient] += getLabelTextMaxWidth(labelsMaxWidth, labelTexts) + AXIS_LABEL_PADDING;
    } else {
        const valueAxisOrient = getAxisOrient(AxisType.Value, charts[0].orientation, axis.valueAxis.position);
        const labelTexts = data[charts[0].data.dataSource].map((dataSet: DataRow) => dataSet[charts[0].data.valueField]);
        margin[valueAxisOrient] += getLabelTextMaxWidth(labelsMaxWidth, labelTexts) + AXIS_LABEL_PADDING;
    }
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

function getScaleDomain(scaleType: ScaleType, configDomain: Domain, data: DataRow[], chart: TwoDimensionalChart, keyAxisPosition: string = null, dataLimit: number = -1): any[] {
    if(scaleType === ScaleType.Key) {
        const domain = data.map(d => d[chart.data.keyField]);        
        if(dataLimit !== domain.length && dataLimit !== -1)     
            domain.splice(dataLimit, domain.length - dataLimit) 
        return domain;
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

function get2DOptions(configOptions: TwoDimensionalOptions, axisLabelDesignerOptions: AxisLabelCanvas, chartPalette: Color[], margin: BlockMargin, dataLimit: number): TwoDimensionalOptionsModel {
    return {
        scale: {
            scaleKey: {
                domain: getScaleDomain(ScaleType.Key, configOptions.axis.keyAxis.domain, data[configOptions.charts[0].data.dataSource], configOptions.charts[0], null, dataLimit),
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

function getOptions(margin: BlockMargin, dataLimit: number): TwoDimensionalOptionsModel | PolarOptionsModel {
    if(config.options.type === '2d') {
        return get2DOptions(config.options, designerConfig.canvas.axisLabel, designerConfig.chart.style.palette, margin, dataLimit);
    } else {
        return getPolarOptions(config.options, designerConfig.chart.style.palette);
    }
} 


function getDataSettings(dataLimit: number): DataSettings {
    return {
        limit: dataLimit
    }
}

function getChartSettings(): ChartSettings {
    return {
        bar: {
            distance: designerConfig.canvas.chartOptions.bar.barDistance
        }
    }
}

export function assembleModel(): Model {
    const legendBlock: LegendBlockModel = {
        bottom: { size: 0 },
        left: { size: 0 },
        right: { size: 0 },
        top: { size: 0 }
    }
    const margin = getMargin(legendBlock);
    const dataLimit = calcDataLimit(margin);

    const blockCanvas = getBlockCanvas();
    const chartBlock = getChartBlock(margin);
    const options = getOptions(margin, dataLimit);
    const dataSettings = getDataSettings(dataLimit);
    const chartSettings = getChartSettings();

    return {
        blockCanvas,
        chartBlock,
        legendBlock,
        options,
        dataSettings,
        chartSettings
    }
}

export const model = assembleModel();
export function getUpdatedModel(): Model {
    return assembleModel();
}