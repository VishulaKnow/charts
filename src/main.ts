import * as d3 from 'd3'
const data = require('./assets/dataSet.json');
import model from './model.ts';

type DataRow = {
    [field: string]: any
}
type CssStyle = {
    [cssProp: string]: string | number;
}

function getScaleBand(domain: any, rangeStart: number, rangeEnd: number): d3.ScaleBand<string> {
    return d3.scaleBand()
        .domain(domain)
        .range([rangeStart, rangeEnd]);
}

function getScaleLinear(domain: any, rangeStart: number, rangeEnd: number): d3.ScaleLinear<number, number> {
    console.log(domain);
    
    return d3.scaleLinear()
        .domain(domain)
        .range([rangeStart, rangeEnd]);
}

function renderSvgBlock(cssClass: string, width: number, height: number, style: CssStyle): void {
    const svg = d3.select('.wrapper')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', cssClass);

    for(let key in style) {
        svg.style(key, style[key]);
    }
}

function getAxisByOrient(orient: string, scale: d3.AxisScale<any>): d3.Axis<any> {
    if(orient === 'top')
        return d3.axisTop(scale);
    if(orient === 'bottom')
        return d3.axisBottom(scale);
    if(orient === 'left')
        return d3.axisLeft(scale);
    if(orient === 'right')
        return d3.axisRight(scale);
}

function renderAxis(scale: d3.AxisScale<any>, axisOrient: string, translateX: number, translateY: number): void {
    const axis = getAxisByOrient(axisOrient, scale);

    d3.select('svg')
        .append('g')
        .attr('transform', `translate(${translateX}, ${translateY})`)
        .call(axis);
}

const scales: any = {
    scaleKey: null,
    scaleValue: null
}
scales.scaleKey = getScaleBand(model.scale.scaleKey.domain,
    model.scale.scaleKey.range.start,
    model.scale.scaleKey.range.end);
scales.scaleValue = getScaleLinear(model.scale.scaleValue.domain,
    model.scale.scaleValue.range.start,
    model.scale.scaleValue.range.end)

renderSvgBlock(model.blockCanvas.class,
    model.blockCanvas.size.width, 
    model.blockCanvas.size.height, 
    model.blockCanvas.style);

renderAxis(scales.scaleKey, 
    model.axis.keyAxis.orient, 
    model.axis.keyAxis.translate.translateX, 
    model.axis.keyAxis.translate.translateY);

renderAxis(scales.scaleValue, 
    model.axis.valueAxis.orient, 
    model.axis.valueAxis.translate.translateX, 
    model.axis.valueAxis.translate.translateY);


