import * as d3 from 'd3'
import { Model } from './model';

type DataRow = {
    [field: string]: any
}
type CssStyle = {
    [cssProp: string]: string | number;
}

interface Scales {
    scaleKey: d3.ScaleBand<string>;
    scaleValue: d3.ScaleLinear<number, number>;
}

interface Line {
    x: number;
    y: number;
}
interface Area {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}
interface BlockMargin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

function getScaleBand(domain: any, rangeStart: number, rangeEnd: number): d3.ScaleBand<string> {
    return d3.scaleBand()
        .domain(domain)
        .range([rangeStart, rangeEnd])
        .padding(0.1);
}

function getScaleLinear(domain: any, rangeStart: number, rangeEnd: number): d3.ScaleLinear<number, number> {
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

function renderAxis(scale: d3.AxisScale<any>, axisOrient: string, translateX: number, translateY: number, cssClass: string): void {
    const axis = getAxisByOrient(axisOrient, scale);

    d3.select('svg')
        .append('g')
        .attr('transform', `translate(${translateX}, ${translateY})`)
        .attr('class', cssClass)
        .call(axis);
}

function fillBarAttrsByKeyOrient(bars: d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>, axisOrient: string, scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, margin: BlockMargin, keyField: string, valueField: string, blockWidth: number, blockHeight: number): void {
    if(axisOrient === 'top')
        bars.attr('x', d => scaleKey(d[keyField]) + margin.left)
            .attr('y', d => margin.top)
            .attr('height', d => scaleValue(d[valueField]))
            .attr('width', d => scaleKey.bandwidth());
    else if(axisOrient === 'bottom')
        bars.attr('x', d => scaleKey(d[keyField]) + margin.left)
            .attr('y', d => scaleValue(d[valueField]) + margin.top)
            .attr('height', d => blockHeight - margin.top - margin.bottom - scaleValue(d[valueField]))
            .attr('width', d => scaleKey.bandwidth());
    else if(axisOrient === 'left')
        bars.attr('x', d => margin.left)
            .attr('y', d => scaleKey(d[keyField]) + margin.top)
            .attr('height', d => scaleKey.bandwidth())
            .attr('width', d => scaleValue(d[valueField]));
    else if(axisOrient === 'right')
        bars.attr('x', d => scaleValue(d[valueField]) + margin.left)
            .attr('y', d => scaleKey(d[keyField]) + margin.top)
            .attr('height', d => scaleKey.bandwidth())
            .attr('width', d => blockWidth - margin.left - margin.right - scaleValue(d[valueField]));   
}

function renderBar(scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, barStyle: CssStyle, keyAxisOrient: string, blockWidth: number, blockHeight: number): void {
    const bars = d3.select('svg')
        .selectAll('rect.bar')
        .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar');
    fillBarAttrsByKeyOrient(bars,
        keyAxisOrient,
        scaleKey,
        scaleValue,
        margin,
        keyField,
        valueField,
        blockWidth,
        blockHeight);

    for(let key in barStyle) {
        bars.style(key, barStyle[key]);
    }
}

function getLine(): d3.Line<Line> {
    return d3.line<Line>()
        .x(d => d.x)
        .y(d => d.y);
}

function getLineCoordinateByKeyOrient(axisOrient: string, data: DataRow[], scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, margin: BlockMargin, keyField: string, valueField: string): Line[] {
    const lineCoordinate: Line[] = [];
    if(axisOrient === 'bottom' || axisOrient === 'top')
        data.forEach(d => {
            lineCoordinate.push({
                x: scaleKey(d[keyField]) + scaleKey.bandwidth() / 2 + margin.left,
                y: scaleValue(d[valueField]) + margin.top
            });
        });
    else if(axisOrient === 'left' || axisOrient === 'right')
        data.forEach(d => {
            lineCoordinate.push({
                x: scaleValue(d[valueField]) + margin.left,
                y: scaleKey(d[keyField]) + scaleKey.bandwidth() / 2 + margin.top
            });
        });
    return lineCoordinate;
}

function getArea(keyAxisOrient: string): d3.Area<Area | Line> {
    if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top')
        return d3.area<Area>()
            .x(d => d.x0)
            .y0(d => d.y0)
            .y1(d => d.y1);
    if(keyAxisOrient === 'left' || keyAxisOrient === 'right')
        return d3.area<Area>()
            .x0(d => d.x0)
            .x1(d => d.x1)
            .y(d => d.y0);
}

function getAreaCoordinateByKeyOrient(axisOrient: string, data: DataRow[], scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, margin: BlockMargin, keyField: string, valueField: string, blockWidth: number, blockHeight: number) : Area[] {
    const areaCoordinate: Area[] = [];
    if(axisOrient === 'bottom' || axisOrient === 'top') {
        let y0: number = margin.top;
        if(axisOrient === 'bottom')
            y0 = blockHeight - margin.bottom;
        data.forEach(d => {
            areaCoordinate.push({
                x0: scaleKey(d[keyField]) + scaleKey.bandwidth() / 2 + margin.left,
                x1: 0,
                y0,
                y1: scaleValue(d[valueField]) + margin.top
            });
        });
    } 
    else if(axisOrient === 'left' || axisOrient === 'right') {
        let x0: number = margin.left;
        if(axisOrient === 'right')
            x0 = blockWidth - margin.right;
        data.forEach(d => {
            areaCoordinate.push({
                x0,
                x1: scaleValue(d[valueField]) + margin.left,
                y0: scaleKey(d[keyField]) + scaleKey.bandwidth() / 2 + margin.top,
                y1: 0
            });
        });
    }   
    return areaCoordinate;
}

function renderLine(scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, barStyle: CssStyle, keyAxisOrient: string): void {
    const line = getLine();
    const lineCoordinate: Line[] = getLineCoordinateByKeyOrient(keyAxisOrient,
        data,
        scaleKey,
        scaleValue,
        margin,
        keyField,
        valueField);
    
    const path = d3.select('svg')
        .append('path')
        .attr('d', line(lineCoordinate))
        .attr('class', 'line');

    for(let key in barStyle) {
        path.style(key, barStyle[key]);
    }
}

function renderArea(scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, barStyle: CssStyle, keyAxisOrient: string, blockWidth: number, blockHeight: number): void {
    const area = getArea(keyAxisOrient);
    const areaCoordinate: Area[] = getAreaCoordinateByKeyOrient(keyAxisOrient,
        data,
        scaleKey,
        scaleValue,
        margin,
        keyField,
        valueField,
        blockWidth,
        blockHeight);

    const path = d3.select('svg')
        .append('path')
        .attr('d', area(areaCoordinate))
        .attr('class', 'area');

    for(let key in barStyle) {
        path.style(key, barStyle[key]);
    }
}

function renderCharts(charts: any[], scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, data: any, margin: BlockMargin, keyAxisOrient: string, blockWidth: number, blockHeight: number) {
    charts.forEach(chart => {
        if(chart.type === 'bar')
            renderBar(scaleKey,
                scaleValue,
                data[chart.data.dataSource],
                margin,
                chart.data.keyField,
                chart.data.valueField,
                chart.style,
                keyAxisOrient,
                blockWidth,
                blockHeight);
        else if(chart.type === 'line')
            renderLine(scaleKey,
                scaleValue,
                data[chart.data.dataSource],
                margin,
                chart.data.keyField,
                chart.data.valueField,
                chart.style,
                keyAxisOrient);  
        else if(chart.type === 'area')
            renderArea(scaleKey,
                scaleValue,
                data[chart.data.dataSource],
                margin,
                chart.data.keyField,
                chart.data.valueField,
                chart.style,
                keyAxisOrient,
                blockWidth,
                blockHeight);
    });
}

function fillScales(scales: Scales, modelScale: any): void {
    scales.scaleKey = getScaleBand(modelScale.scaleKey.domain,
        modelScale.scaleKey.range.start,
        modelScale.scaleKey.range.end);
    scales.scaleValue = getScaleLinear(modelScale.scaleValue.domain,
        modelScale.scaleValue.range.start,
        modelScale.scaleValue.range.end);
}

function clearBlock(): void {
    d3.select('svg')
        .remove();
}

function updateValueAxisDomain(scaleValue: d3.ScaleLinear<number, number>, axisClass: string, axisOrient: string) {
    const axis = getAxisByOrient(axisOrient, scaleValue);
    
    d3.select('svg')
        .select(`.${axisClass}`)
        .transition()
        .duration(1000)
            .call(axis.bind(this));
}

function updateChartsByValueAxis(charts: any[], scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, data: any, margin: BlockMargin, keyAxisOrient: string, blockWidth: number, blockHeight: number): void {
    charts.forEach(chart => {
        if(chart.type === 'bar')
            updateBarChartByValueAxis(scaleKey,
                scaleValue,
                data[chart.data.dataSource],
                margin,
                chart.data.keyField,
                chart.data.valueField,
                chart.style,
                keyAxisOrient,
                blockWidth,
                blockHeight);
        else if(chart.type === 'line')
            updateLineChartByValueAxis(scaleKey,
                scaleValue,
                data[chart.data.dataSource],
                margin,
                chart.data.keyField,
                chart.data.valueField,
                chart.style,
                keyAxisOrient);
        else if(chart.type === 'area')
            updateAreaChartByValueAxis(scaleKey,
                scaleValue,
                data[chart.data.dataSource],
                margin,
                chart.data.keyField,
                chart.data.valueField,
                chart.style,
                keyAxisOrient,
                blockWidth,
                blockHeight);
    });
}

function updateLineChartByValueAxis(scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, barStyle: CssStyle, keyAxisOrient: string): void {
    const line = getLine();
    const lineCoordinate: Line[] = getLineCoordinateByKeyOrient(keyAxisOrient,
        data,
        scaleKey,
        scaleValue,
        margin,
        keyField,
        valueField);
    
    d3.select('svg')
        .select('.line')
        .transition()
        .duration(1000)
            .attr('d', line(lineCoordinate));
}

function updateAreaChartByValueAxis(scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, barStyle: CssStyle, keyAxisOrient: string, blockWidth: number, blockHeight: number): void {
    const area = getArea(keyAxisOrient);
    const areaCoordinate: Area[] = getAreaCoordinateByKeyOrient(keyAxisOrient,
        data,
        scaleKey,
        scaleValue,
        margin,
        keyField,
        valueField,
        blockWidth,
        blockHeight);

    d3.select('svg')
        .select('.area')
        .transition()
        .duration(1000)
            .attr('d', area(areaCoordinate));
}

function updateBarChartByValueAxis(scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, barStyle: CssStyle, keyAxisOrient: string, blockWidth: number, blockHeight: number): void {
    const bars = d3.select('svg')
        .selectAll('rect.bar') as d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>;

    fillBarAttrsByKeyOrientWithTransition(bars,
        keyAxisOrient,
        scaleKey,
        scaleValue,
        margin,
        keyField,
        valueField,
        blockWidth,
        blockHeight,
        1000);

    for(let key in barStyle) {
        bars.style(key, barStyle[key]);
    }
}

function fillBarAttrsByKeyOrientWithTransition(bars: d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>, axisOrient: string, scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, margin: BlockMargin, keyField: string, valueField: string, blockWidth: number, blockHeight: number, transitionDuration: number): void {
    const barsTran = bars.transition().duration(transitionDuration);
    if(axisOrient === 'top')
        barsTran.attr('x', d => scaleKey(d[keyField]) + margin.left)
            .attr('y', d => margin.top)
            .attr('height', d => scaleValue(d[valueField]))
            .attr('width', d => scaleKey.bandwidth());
    else if(axisOrient === 'bottom')
        barsTran.attr('x', d => scaleKey(d[keyField]) + margin.left)
            .attr('y', d => scaleValue(d[valueField]) + margin.top)
            .attr('height', d => blockHeight - margin.top - margin.bottom - scaleValue(d[valueField]))
            .attr('width', d => scaleKey.bandwidth());
    else if(axisOrient === 'left')
        barsTran.attr('x', d => margin.left)
            .attr('y', d => scaleKey(d[keyField]) + margin.top)
            .attr('height', d => scaleKey.bandwidth())
            .attr('width', d => scaleValue(d[valueField]));
    else if(axisOrient === 'right')
        barsTran.attr('x', d => scaleValue(d[valueField]) + margin.left)
            .attr('y', d => scaleKey(d[keyField]) + margin.top)
            .attr('height', d => scaleKey.bandwidth())
            .attr('width', d => blockWidth - margin.left - margin.right - scaleValue(d[valueField]));  
}

const scales: Scales = {
    scaleKey: null,
    scaleValue: null
}

export default {
    render(model: Model, data: DataRow[]) {
        fillScales(scales, model.scale);
        
        renderSvgBlock(model.blockCanvas.class,
            model.blockCanvas.size.width, 
            model.blockCanvas.size.height, 
            model.blockCanvas.style);
        
        renderAxis(scales.scaleKey, 
            model.axis.keyAxis.orient, 
            model.axis.keyAxis.translate.translateX, 
            model.axis.keyAxis.translate.translateY,
            model.axis.keyAxis.class);
        
        renderAxis(scales.scaleValue, 
            model.axis.valueAxis.orient, 
            model.axis.valueAxis.translate.translateX, 
            model.axis.valueAxis.translate.translateY,
            model.axis.valueAxis.class);
        
        renderCharts(model.charts,
            scales.scaleKey,
            scales.scaleValue,
            data,
            model.chartBlock.margin,
            model.axis.keyAxis.orient,
            model.blockCanvas.size.width,
            model.blockCanvas.size.height);
    },
    updateFullBlock(model: Model, data: DataRow[]) {
        clearBlock();
        this.render(model, data);
    },
    updateValueAxis(model: Model, data: DataRow[]) {
        fillScales(scales, model.scale);

        updateValueAxisDomain(scales.scaleValue,
            model.axis.valueAxis.class,
            model.axis.valueAxis.orient);

        updateChartsByValueAxis(model.charts,
            scales.scaleKey,
            scales.scaleValue,
            data,
            model.chartBlock.margin,
            model.axis.keyAxis.orient,
            model.blockCanvas.size.width,
            model.blockCanvas.size.height);
    }
}
