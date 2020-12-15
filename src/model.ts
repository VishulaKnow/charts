import * as d3 from 'd3'

const data = require('./assets/dataSet.json');

type DataRow = {
    [field: string]: any
}
type CssStyle = {
    [cssProp: string]: string | number;
}
type Orient = 'top' | 'bottom' | 'left' | 'right'
enum AxisType {
    Key, Value
}
enum ScaleType {
    Key, Value
}
//#region Confg interfaces
interface Chart {
    title: string;
    type: 'bar' | 'line' | 'area';
    data: ChartData;
    style: CssStyle;
    legend: Legend;
    orientation: 'vertical' | 'horizontal';
}
interface ChartData {
    dataSource: string;
    keyField: string;
    valueField: string;
}
interface Legend {
    position: 'off' | 'top' | 'left' | 'right' | 'bottom';
}

interface Size {
    width: number;
    height: number;
}
interface Config {
    canvas: Canvas;
    axis: Axis;
    charts: Chart[];
}
interface Canvas {
    size: Size;
    class: string;
    style: CssStyle;
}
interface Axis {
    keyAxis: AxisOptions;
    valueAxis: AxisOptions;
}
interface AxisOptions {
    domain: Domain;
    position: 'start' | 'end'; 
}
interface Domain {
    start: number;
    end: number;
}
//#endregion

const config: Config = {
    canvas: {
        class: 'chart-1',
        size: {
            width: 1000,
            height: 500
        },
        style: {
            'border': '1px solid black'
        }
    },
    axis: {
        keyAxis: {
            domain: {
                start: -1,
                end: -1
            },
            position: 'end'
        },
        valueAxis: {
            domain: {
                start: 0,
                end: 150
            },
            position: 'start'
        }
    },
    charts: [
        {
            title: 'Car prices',
            legend: {
                position: 'off'
            },
            style: {
                'fill': 'steelblue'
            },
            type: 'bar',
            data: {
                dataSource: 'dataSet',
                keyField: 'brand',
                valueField: 'price'
            },
            orientation: 'vertical'
        }
    ]
}

const dataSet: DataRow[] = data.data;

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

function getScaleDomain(scaleType: ScaleType, configDomain: Domain, data: DataRow[], chart: Chart): any[] {
    if(scaleType === ScaleType.Key) {
        return data.map(d => d[chart.data.keyField]);
    } else {
        if(configDomain.start === -1 || configDomain.end === -1) {
            if(chart.orientation === 'horizontal')
                return [0, d3.max(data, d => d[chart.data.valueField])];
            else
                return [d3.max(data, d => d[chart.data.valueField]), 0];
        } else {
            if(chart.orientation === 'horizontal')
                return [configDomain.start, configDomain.end];
            else 
                return [configDomain.end, configDomain.start];
        }
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



interface Model {
    blockCanvas: BlockCanvas;
    chartBlock: ChartBlock;
    scale: ScaleModel;
    axis: AxisModel;
}

interface BlockCanvas {
    size: Size;
    class: string;
    style: CssStyle;
}

interface ChartBlock {
    margin: BlockMargin
}
interface BlockMargin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

interface ScaleModel {
    scaleKey: ScaleOptions;
    scaleValue: ScaleOptions;
}
interface ScaleOptions {
    domain: any[];
    range: RangeModel;
}
interface RangeModel {
    start: number;
    end: number;
}

interface AxisModel {
    keyAxis: AxisModelOptions;
    valueAxis: AxisModelOptions;
}
interface AxisModelOptions {
    orient: 'top' | 'bottom' | 'left' |  'right';
    translate: TranslateModel;
}
interface TranslateModel {
    translateX: number;
    translateY: number;
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
            domain: getScaleDomain(ScaleType.Value, config.axis.keyAxis.domain, dataSet, config.charts[0]),
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
    }
}

export default model;