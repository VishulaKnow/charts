import * as d3 from 'd3'

import { Domain, Chart } from './config/config';
import { ChartModel, Model } from './model';

const data = require('./assets/dataSet.json');
import config from './config/configOptions';

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

const dataSet: DataRow[] = data[config.charts[0].data.dataSource];

const margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
}

function getScaleRangePeek(scaleType: ScaleType, chartOrientation: string, blockWidth: number, blockHeight: number): number {
    let rangePeek;
    if(chartOrientation === 'vertical')
        rangePeek = scaleType === ScaleType.Key 
            ? blockWidth - margin.left - margin.right
            : blockHeight - margin.top - margin.bottom;
    else
        rangePeek = scaleType === ScaleType.Key 
            ? blockHeight - margin.top - margin.bottom
            : blockWidth - margin.left - margin.right;
    
    return rangePeek;
}

function getScaleDomain(scaleType: ScaleType, configDomain: Domain, data: DataRow[], chart: Chart, keyAxisPosition: string = null): any[] {
    if(scaleType === ScaleType.Key) {
        return data.map(d => d[chart.data.keyField]);
    } else {
        let domainPeekMin: number;
        let domainPeekMax: number;
        if(configDomain.start === -1 || configDomain.end === -1) {
            domainPeekMin = 0;
            domainPeekMax = d3.max(data, d => d[chart.data.valueField]);
        } else {
            domainPeekMin = configDomain.start;
            domainPeekMax = configDomain.end;
        }
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

function getChartsModel(charts: Chart[]): ChartModel[] {
    const chartsModel: ChartModel[] = [];
    charts.forEach(chart => {
        chartsModel.push({
            data: {
                dataSource: chart.data.dataSource,
                keyField: chart.data.keyField,
                valueField: chart.data.valueField
            },
            style: chart.style,
            type: chart.type
        });
    });
    return chartsModel;
}

const model: Model = {
    blockCanvas: {
        size: {
            width: config.canvas.size.width,
            height: config.canvas.size.height
        },
        class: config.canvas.class,
        style: config.canvas.style
    },
    chartBlock: {
        margin
    },
    scale: {
        scaleKey: {
            domain: getScaleDomain(ScaleType.Key, config.axis.keyAxis.domain, dataSet, config.charts[0]),
            range: {
                start: 0,
                end: getScaleRangePeek(ScaleType.Key, config.charts[0].orientation, config.canvas.size.width, config.canvas.size.height)
            }
        },
        scaleValue: {
            domain: getScaleDomain(ScaleType.Value, config.axis.valueAxis.domain, dataSet, config.charts[0], config.axis.keyAxis.position),
            range: {
                start: 0,
                end: getScaleRangePeek(ScaleType.Value, config.charts[0].orientation, config.canvas.size.width, config.canvas.size.height)
            }
        }
    },
    axis: {
        keyAxis: {
            orient: getAxisOrient(AxisType.Key, config.charts[0].orientation, config.axis.keyAxis.position),
            translate: {
                translateX: getTranslateX(AxisType.Key, config.charts[0].orientation, config.axis.keyAxis.position, config.canvas.size.width, config.canvas.size.height),
                translateY: getTranslateY(AxisType.Key, config.charts[0].orientation, config.axis.keyAxis.position, config.canvas.size.width, config.canvas.size.height)
            }
        },
        valueAxis: {
            orient: getAxisOrient(AxisType.Value, config.charts[0].orientation, config.axis.valueAxis.position),
            translate: {
                translateX: getTranslateX(AxisType.Value, config.charts[0].orientation, config.axis.valueAxis.position, config.canvas.size.width, config.canvas.size.height),
                translateY: getTranslateY(AxisType.Value, config.charts[0].orientation, config.axis.valueAxis.position, config.canvas.size.width, config.canvas.size.height)
            }
        }
    },
    charts: getChartsModel(config.charts)
}
export default model;