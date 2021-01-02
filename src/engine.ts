import * as d3 from 'd3'
import { color, Color } from 'd3';

import { Model, TwoDimensionalOptionsModel, PolarOptionsModel, TwoDimensionalChartModel, PolarChartModel } from './model/model';

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

function getCssClassesLine(cssClasses: string[]): string {
    return '.' + cssClasses.join('.');
}

function getScaleBand(domain: any, rangeStart: number, rangeEnd: number, scalePadding: number): d3.ScaleBand<string> {
    const scale = d3.scaleBand()
        .domain(domain)
        .range([rangeStart, rangeEnd]);
            
    const bandSize = scale.bandwidth();
    if(scalePadding < bandSize) {
        scale.paddingInner(scalePadding / bandSize);
        scale.paddingOuter(scalePadding / 2 / bandSize);
    }
    return scale;
}

function getScaleLinear(domain: any, rangeStart: number, rangeEnd: number): d3.ScaleLinear<number, number> {
    return d3.scaleLinear()
        .domain(domain)
        .range([rangeStart, rangeEnd]);
}

function renderSvgBlock(cssClass: string, width: number, height: number): void {
    d3.select('.wrapper')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', cssClass);
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

function cropLabels(labelBlocks: any, maxWidth: number) {
    for(let i = 0; i < labelBlocks.nodes().length; i++) {
        if(labelBlocks.nodes()[i].getBBox().width > maxWidth) {
            const text: string = labelBlocks.nodes()[i].textContent;
            let textLength = text.length;
            while(labelBlocks.nodes()[i].getBBox().width > maxWidth && textLength > 0) {
                labelBlocks.nodes()[i].textContent = text.substring(0, --textLength) + '...';
            }
            if(textLength === 0)
                labelBlocks.nodes()[i].textContent = '';
        }
    }
}

function renderAxis(scale: d3.AxisScale<any>, axisOrient: string, translateX: number, translateY: number, cssClass: string, maxLabelSize: number): void {
    const axis = getAxisByOrient(axisOrient, scale);

    d3.select('svg')
        .append('g')
        .attr('transform', `translate(${translateX}, ${translateY})`)
        .attr('class', `${cssClass} data-label`)
        .call(axis);

    if(axisOrient === 'left' || axisOrient === 'right')
        cropLabels(d3.select(`.${cssClass}`).selectAll('text'), maxLabelSize);
    else if(axisOrient === 'bottom' || axisOrient === 'top') {
        if(scale.bandwidth)
            cropLabels(d3.select(`.${cssClass}`).selectAll('text'), scale.bandwidth());
    }
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

function renderBar(scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, keyAxisOrient: string, tooltipFields: string[], cssClasses: string[], chartPalette: Color[], blockWidth: number, blockHeight: number): void {
    const bars = d3.select('svg')
        .selectAll(`rect.bar-item${getCssClassesLine(cssClasses)}`)
        .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar-item');

    fillBarAttrsByKeyOrient(bars,
        keyAxisOrient,
        scaleKey,
        scaleValue,
        margin,
        keyField,
        valueField,
        blockWidth,
        blockHeight);
    
    setCssClasses(bars, cssClasses);
    setChartColor(bars, chartPalette, 'bar');
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

function getArea(keyAxisOrient: string): d3.Area<Area> {
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

function renderLine(scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, keyAxisOrient: string, cssClasses: string[], chartPalette: Color[], blockWidth: number, blockHeight: number): void {
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

    setCssClasses(path, cssClasses);
    setChartColor(path, chartPalette, 'line');
}

function renderArea(scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, keyAxisOrient: string, cssClasses: string[], chartPalette: Color[], blockWidth: number, blockHeight: number): void {
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

    setCssClasses(path, cssClasses);
    setChartColor(path, chartPalette, 'area');
}

function getPieRadius(margin: BlockMargin, blockWidth: number, blockHeight: number): number {
    return Math.min(blockWidth - margin.left - margin.right,
        blockHeight - margin.top - margin.bottom) / 2;
}

function getArc(outerRadius: number, innerRadius: number = 0): d3.Arc<any, d3.PieArcDatum<DataRow>> {
    return d3.arc<d3.PieArcDatum<DataRow>>()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
}

function getPie(valueField: string, padAngle: number = 0): d3.Pie<any, DataRow> {
    return d3.pie<DataRow>()
        .padAngle(padAngle)
        .sort(null)
        .value(d => d[valueField]);
}

function renderDonutText(arcItems: d3.Selection<SVGGElement, d3.PieArcDatum<DataRow>, d3.BaseType, unknown>, arc: d3.Arc<any, d3.PieArcDatum<DataRow>>, field: string): void {
    arcItems
        .append('text')
        .attr('transform', d => `translate(${arc.centroid(d)}) rotate(-90) rotate(${d.endAngle < Math.PI ? 
            (d.startAngle / 2 + d.endAngle / 2) * 180 / Math.PI : 
            (d.startAngle / 2  + d.endAngle / 2 + Math.PI) * 180 / Math.PI})`)
        .attr('font-size', 10)
        .attr('class', 'data-label')
        .text(d => d.data[field])
        .style('text-anchor', 'middle');
}

function renderDonut(data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, innerRadius: number, padAngle: number, tooltipFields: string[], cssClasses: string[], chartPalette: Color[], blockWidth: number, blockHeight: number): void {
    const radius = getPieRadius(margin, blockWidth, blockHeight);
    const arc = getArc(radius, radius * 0.01 * innerRadius);
    const pie = getPie(valueField, padAngle);

    const translateX = (blockWidth - margin.left - margin.right) / 2 + margin.left;
    const translateY = (blockHeight - margin.top - margin.bottom) / 2 + margin.top;

    const donutBlock = d3.select('svg')
        .append('g')
        .attr('class', 'donut-block')
        .attr('transform', `translate(${translateX}, ${translateY})`);
    
    const items = donutBlock
        .selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc');

    const arcs = items
        .append('path')
        .attr('d', arc);

    setCssClasses(arcs, cssClasses);
    setElementsColor(items, chartPalette, 'donut');
    // renderTooltipForDonut(items, tooltipFields, data, translateX, translateY);
    // renderDonutText(items, arc, keyField);
}

function setChartColor(elements: any, colorPalette: Color[], chartType: 'line' | 'bar' | 'area'): void {
    if(chartType === 'line') {
        elements.style('stroke', colorPalette[0])
    } else {
        elements.style('fill', colorPalette[0])
    }
}

function setElementsColor(arcItems: d3.Selection<SVGGElement, d3.PieArcDatum<DataRow>, d3.BaseType, unknown>, colorPalette: Color[], chartType: 'donut'): void {
    if(chartType === 'donut') {
        arcItems
            .select('path')
            .style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}

function setCssClasses(elem: any, cssClasses: string[]): void {
    cssClasses.forEach(cssClass => {
        elem.classed(cssClass, true);
    })
}

function render2DCharts(charts: any[], scaleKey: d3.ScaleBand<string>, scaleValue: d3.ScaleLinear<number, number>, data: any, margin: BlockMargin, keyAxisOrient: string, blockWidth: number, blockHeight: number) {
    charts.forEach(chart => {
        if(chart.type === 'bar')
            renderBar(scaleKey,
                scaleValue,
                data[chart.data.dataSource],
                margin,
                chart.data.keyField,
                chart.data.valueField,
                keyAxisOrient,
                chart.tooltip.data.fields,
                chart.cssClasses,
                chart.elementColors,
                blockWidth,
                blockHeight);
        else if(chart.type === 'line')
            renderLine(scaleKey,
                scaleValue,
                data[chart.data.dataSource],
                margin,
                chart.data.keyField,
                chart.data.valueField,
                keyAxisOrient,
                chart.cssClasses,
                chart.elementColors,
                blockWidth,
                blockHeight);  
        else if(chart.type === 'area')
            renderArea(scaleKey,
                scaleValue,
                data[chart.data.dataSource],
                margin,
                chart.data.keyField,
                chart.data.valueField,
                keyAxisOrient,
                chart.cssClasses,
                chart.elementColors,
                blockWidth,
                blockHeight);
    });
}

function renderPolarCharts(charts: any[], data: any, margin: BlockMargin, blockWidth: number, blockHeight: number) {
    charts.forEach(chart => {
        if(chart.type === 'donut')
            renderDonut(data[chart.data.dataSource],
                margin,
                chart.data.keyField,
                chart.data.valueField,
                chart.appearanceOptions.innerRadius,
                chart.appearanceOptions.padAngle,
                chart.tooltip.data.fields,
                chart.cssClasses,
                chart.elementColors,
                blockWidth,
                blockHeight);
    })
}

function fillScales(scales: Scales, keyDomain: any[], keyRangeStart: number, keyRangeEnd: number, scaleKeyPadding: number, valueDomain: any[], valueRangeStart: number, valueRangeEnd: number): void {
    scales.scaleKey = getScaleBand(keyDomain,
        keyRangeStart,
        keyRangeEnd,
        scaleKeyPadding);
    scales.scaleValue = getScaleLinear(valueDomain,
        valueRangeStart,
        valueRangeEnd);
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

function renderLegend(data: any, options: TwoDimensionalOptionsModel | PolarOptionsModel, legendsSize: any, margin: BlockMargin, blockWidth: number, blockHeight: number): void {
    //FIXME Make it better
    if(options.type === '2d') {
        const chartsWithLegendLeft = options.charts.filter((chart: any) => chart.legend.position === 'left');        
        if(chartsWithLegendLeft.length !== 0) {
            renderLegendBlock(chartsWithLegendLeft.map(chart => chart.data.dataSource),
                'left',
                legendsSize.left.size,
                margin,
                chartsWithLegendLeft.map(chart => chart.elementColors[0]),
                blockWidth,
                blockHeight);
        }
        const chartsWithLegendRight = options.charts.filter((chart: any) => chart.legend.position === 'right');        
        if(chartsWithLegendRight.length !== 0) {
            renderLegendBlock(chartsWithLegendRight.map(chart => chart.data.dataSource),
            'right', 
            legendsSize.right.size, 
            margin, 
            chartsWithLegendRight.map(chart => chart.elementColors[0]), 
            blockWidth, 
            blockHeight);
        } 
        const chartsWithLegendTop = options.charts.filter((chart: any) => chart.legend.position === 'top');        
        if(chartsWithLegendTop.length !== 0) {
            renderLegendBlock(chartsWithLegendTop.map(chart => chart.data.dataSource), 
            'top', 
            legendsSize.top.size, 
            margin, 
            chartsWithLegendTop.map(chart => chart.elementColors[0]), 
            blockWidth, 
            blockHeight);
        }
        const chartsWithLegendBottom = options.charts.filter((chart: any) => chart.legend.position === 'bottom');        
        if(chartsWithLegendBottom.length !== 0) {
            renderLegendBlock(chartsWithLegendBottom.map(chart => chart.data.dataSource), 
            'bottom', 
            legendsSize.bottom.size,
            margin, 
            chartsWithLegendBottom.map(chart => chart.elementColors[0]), 
            blockWidth, 
            blockHeight);
        }
    } else {
        const chartsWithLegendLeft = options.charts.filter((chart: any) => chart.legend.position === 'left');        
        if(chartsWithLegendLeft.length !== 0) {
            renderLegendBlock(chartsWithLegendLeft.map(chart => data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField]))[0], 
            'left', 
            legendsSize.left.size, 
            margin,
            chartsWithLegendLeft.map(chart => chart.elementColors)[0],
            blockWidth, 
            blockHeight);
        }
        const chartsWithLegendRight = options.charts.filter((chart: any) => chart.legend.position === 'right');        
        if(chartsWithLegendRight.length !== 0) {
            renderLegendBlock(chartsWithLegendRight.map(chart => data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField]))[0], 
            'right', 
            legendsSize.right.size, 
            margin,
            chartsWithLegendRight.map(chart => chart.elementColors)[0], 
            blockWidth, 
            blockHeight);
        } 
        const chartsWithLegendTop = options.charts.filter((chart: any) => chart.legend.position === 'top');        
        if(chartsWithLegendTop.length !== 0) {
            renderLegendBlock(chartsWithLegendTop.map(chart => data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField]))[0], 
            'top', 
            legendsSize.top.size, 
            margin,
            chartsWithLegendTop.map(chart => chart.elementColors)[0], 
            blockWidth, 
            blockHeight);
        }
        const chartsWithLegendBottom = options.charts.filter((chart: any) => chart.legend.position === 'bottom');        
        if(chartsWithLegendBottom.length !== 0) {
            renderLegendBlock(chartsWithLegendBottom.map(chart => data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField]))[0], 
            'bottom', 
            legendsSize.bottom.size, 
            margin,
            chartsWithLegendBottom.map(chart => chart.elementColors)[0], 
            blockWidth, 
            blockHeight);
        }
    }
}

function renderLegendBlock(items: string[], legendPosition: string, legendSize: number, margin: BlockMargin, colorPalette: Color[], blockWidth: number, blockHeight: number): void {
    const legendBlock = d3.select('svg')
        .append('foreignObject')
            .attr('class', 'legend')
            .style('outline', '1px solid red');
    
    fillLegendCoordinateByPosition(legendBlock,
        legendPosition,
        legendSize,
        margin,
        blockWidth,
        blockHeight);  
        
    fillLegend(legendBlock,
        items,
        legendPosition,
        colorPalette);
}

function fillLegendCoordinateByPosition(legendBlock: d3.Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, legendPosition: string, legendSize: number, margin: BlockMargin, blockWidth: number, blockHeight: number): void {
    if(legendPosition === 'left') {
        legendBlock
            .attr('y', 0)
            .attr('x', 0)
            .attr('width', legendSize)
            .attr('height', blockHeight);
    } else if(legendPosition === 'right') {
        legendBlock
            .attr('y', 0)
            .attr('x', Math.ceil(blockWidth - legendSize))
            .attr('width', Math.ceil(legendSize))
            .attr('height', blockHeight);
    } else if(legendPosition === 'top') {
        legendBlock
            .attr('y', 0)
            .attr('x', 0)
            .attr('width', blockWidth)
            .attr('height', legendSize);
    } else if(legendPosition === 'bottom') {
        legendBlock
            .attr('y', blockHeight - legendSize)
            .attr('x', 0)
            .attr('width', blockWidth)
            .attr('height', legendSize);
    }
}

function fillLegend(legendBlock: d3.Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: string[], legendPosition: string, colorPalette: Color[]): void {
    const wrapper = legendBlock.append('xhtml:div');
    wrapper 
        .style('width', '100%')
        .style('height', '100%')
        .style('display', 'flex')
        .style('flex-wrap', 'wrap')
        .style('justify-content', 'center');

    if(legendPosition === 'left' || legendPosition === 'right')
        wrapper.style('flex-direction', 'column');
    
    const itemWrappers = wrapper
        .selectAll('.legend-item')
        .data(items)
        .enter()
        .append('div')
            .attr('class', 'legend-item');

    itemWrappers
        .append('span')
        .attr('class', 'legend-circle')
        .style('background-color', (d, i) => colorPalette[i % colorPalette.length].toString());

    itemWrappers
        .data(items)
        .append('span')
        .attr('class', 'legend-label')
        .text(d => d.toString());
}

function render2D(model: Model, data: any): void {
    const options = <TwoDimensionalOptionsModel>model.options;

    fillScales(scales,
        options.scale.scaleKey.domain,
        options.scale.scaleKey.range.start,
        options.scale.scaleKey.range.end,
        model.chartSettings.bar.distance,
        options.scale.scaleValue.domain,
        options.scale.scaleValue.range.start,
        options.scale.scaleValue.range.end);
        
    renderSvgBlock(model.blockCanvas.class,
        model.blockCanvas.size.width, 
        model.blockCanvas.size.height);

    renderAxis(scales.scaleKey, 
        options.axis.keyAxis.orient, 
        options.axis.keyAxis.translate.translateX, 
        options.axis.keyAxis.translate.translateY,
        options.axis.keyAxis.class,
        options.axis.keyAxis.maxLabelSize);
    
    renderAxis(scales.scaleValue, 
        options.axis.valueAxis.orient, 
        options.axis.valueAxis.translate.translateX, 
        options.axis.valueAxis.translate.translateY,
        options.axis.valueAxis.class,
        options.axis.valueAxis.maxLabelSize);
    
    render2DCharts(options.charts,
        scales.scaleKey,
        scales.scaleValue,
        data,
        model.chartBlock.margin,
        options.axis.keyAxis.orient,
        model.blockCanvas.size.width,
        model.blockCanvas.size.height);

    renderLegend(data,
        options,
        model.legendBlock,
        model.chartBlock.margin,
        model.blockCanvas.size.width,
        model.blockCanvas.size.height);
    
    renderTooltips(model, data);
}

function renderPolar(model: Model, data: any) {
    const options = <PolarOptionsModel>model.options;

    renderSvgBlock(model.blockCanvas.class,
        model.blockCanvas.size.width, 
        model.blockCanvas.size.height);


    renderPolarCharts(options.charts,
        data,
        model.chartBlock.margin,
        model.blockCanvas.size.width,
        model.blockCanvas.size.height);

    renderLegend(data,
        options,
        model.legendBlock,
        model.chartBlock.margin,
        model.blockCanvas.size.width,
        model.blockCanvas.size.height);

    renderTooltips(model, data);
}

function getTooltipText(fields: string[], data: DataRow): string {
    let text = '';
    fields.forEach(field => {
        text += `<div><strong>${field}: ${data[field]}</strong><br></div>`;
    });
    return text;
}

function getMultplyTooltipText(charts: TwoDimensionalChartModel[], data: any, key: string): string {
    let text = '';   
    charts.forEach(chart => {
        if(chart.tooltip.data.fields.length !== 0)
            text += getTooltipText(chart.tooltip.data.fields, data[chart.data.dataSource].find((d: DataRow) => d[chart.data.keyField] === key));
    });
    return text;
}

function renderTooltipForBar(bars: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, fields: string[], data: DataRow[]): void {
    const wrapper = d3.select('.tooltip-wrapper');

    let tooltip = wrapper.select('.tooltip');
    if(tooltip.size() === 0)
        tooltip = wrapper
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('display', 'none');

    bars
        .data(data)
        .on('mouseover', function(e, d) {
            tooltip.html(getTooltipText(fields, d));
            tooltip.style('display', 'block');
        });

    bars
        .data(data)
        .on('mousemove', function(event, d) {
            tooltip
                .style('left', d3.pointer(event, this)[0] + 10 + 'px')
                .style('top', d3.pointer(event, this)[1] + 'px'); 
        });

    bars.on('mouseleave', event => tooltip.style('display', 'none'));
}

function renderTooltipsForBar(charts: TwoDimensionalChartModel[], data: any): void {
    charts.forEach(chart => {
        const bars = d3.select('svg')
            .selectAll(`rect${getCssClassesLine(chart.cssClasses)}`);
        renderTooltipForBar(bars, chart.tooltip.data.fields, data[chart.data.dataSource]);
    })
}

function renderLineTooltip(scaleKey: d3.ScaleBand<string>, margin: BlockMargin, blockWidth: number, blockHeight: number, charts: TwoDimensionalChartModel[], data: any): void {
    const wrapper = d3.select('.tooltip-wrapper');

    let tooltip = wrapper.select('.tooltip');
    if(tooltip.size() === 0)
        tooltip = wrapper
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('display', 'none');

    const tooltipLine = d3.select('svg')
        .append('line')
        .style('stroke', 'black');    
    
    const bandSize = scaleKey.step(); 
    d3.select('svg')
        .append('rect')
        .attr('class', 'tipbox')
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', blockWidth - margin.left - margin.right)
        .attr('height', blockHeight - margin.top - margin.bottom)
        .style('opacity', 0)
        // .style('outline', '1px solid red')
        .on('mouseover', function(event) {
            tooltip.style('display', 'block');
        })
        .on('mousemove', function(event) {
            const index = getKeyIndex(event, this, charts[0].orient, margin, bandSize);        
            const key = scaleKey.domain()[index];
            tooltip.html(`${getMultplyTooltipText(charts, data, key)}`);
            
            tooltip
                .style('left', d3.pointer(event, this)[0] + 10 + 'px')
                .style('top', d3.pointer(event, this)[1] + 'px');
            tooltipLine
                .style('display', 'block');
            setTooltipLineAttributes(tooltipLine, scaleKey, margin, key, charts[0].orient, blockWidth, blockHeight);
        })
        .on('mouseleave', function(event) {
            tooltip.style('display', 'none');
            tooltipLine.style('display', 'none');
        });
}

function getKeyIndex(event: any, context: SVGRectElement, orient: 'vertical' | 'horizontal', margin: BlockMargin, bandSize: number): number {
    const pointerAxis = orient === 'vertical' ? 0 : 1;
    const marginByOrient = orient === 'vertical' ? margin.left : margin.top;
    
    const point = d3.pointer(event, context)[pointerAxis] - marginByOrient - 1;
    if(point < 0)
        return 0;
    return Math.floor(point / bandSize);
}

function setTooltipLineAttributes(tooltipLine: d3.Selection<SVGLineElement, unknown, HTMLElement, any>, scaleKey: d3.ScaleBand<string>, margin: BlockMargin, key: string, orient: 'vertical' | 'horizontal',  blockWidth: number, blockHeight: number): void {
    if(orient === 'vertical')
        tooltipLine
            .attr('x1', scaleKey(key) + margin.left + scaleKey.bandwidth() / 2)
            .attr('x2', scaleKey(key) + margin.left + scaleKey.bandwidth() / 2)
            .attr('y1', margin.top)
            .attr('y2', blockHeight - margin.bottom);
    else
        tooltipLine
            .attr('x1', margin.left)
            .attr('x2', blockWidth - margin.right)
            .attr('y1', scaleKey(key) + margin.top + scaleKey.bandwidth() / 2)
            .attr('y2', scaleKey(key) + margin.top + scaleKey.bandwidth() / 2);
}

function renderTooltipsForDonut(charts: PolarChartModel[], data: any): void {
    charts.forEach(chart => {
        const attrTransform = d3.select('.donut-block').attr('transform');
        const translateNumbers = attrTransform.substring(10, attrTransform.length - 1).split(', ');
        const translateX = parseFloat(translateNumbers[0]);
        const translateY = parseFloat(translateNumbers[1]);

        const items = d3.select('svg')
            .selectAll(`path${getCssClassesLine(chart.cssClasses)}`);
        renderTooltipForDonut(items, chart.tooltip.data.fields, data[chart.data.dataSource], translateX, translateY);
    })
}

function renderTooltipForDonut(arcs: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, fields: string[], data: DataRow[], translateX: number, translateY: number): void {
    const wrapper = d3.select('.tooltip-wrapper');
    const tooltip = wrapper
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('display', 'none')
        .style('transform', `translate(${translateX}px, ${translateY}px)`);

    arcs
        .data(data)
        .on('mouseover', function(e, d) {
            tooltip.html(getTooltipText(fields, d));
            tooltip.style('display', 'block');
        });

    arcs
        .data(data)
        .on('mousemove', function(event, d) {
            tooltip
                .style('left', d3.pointer(event, this)[0] + 10 + 'px')
                .style('top', d3.pointer(event, this)[1] + 'px'); 
        });

    arcs.on('mouseleave', d => tooltip.style('display', 'none'));
}

function renderTooltips(model: Model, data: any) {
    d3.select('.wrapper')
        .append('div')
        .attr('class', 'tooltip-wrapper');
    if(model.options.type === '2d') {
        if(model.options.charts.findIndex(chart => chart.type === 'area' || chart.type === 'line') === -1) {
            renderTooltipsForBar(model.options.charts, data);
        } else {
            renderLineTooltip(scales.scaleKey, model.chartBlock.margin, model.blockCanvas.size.width, model.blockCanvas.size.height, model.options.charts, data);
        }
    } else {
        renderTooltipsForDonut(model.options.charts, data);
    }
}

function updateByValueAxis(model: Model, data: any) {
    const options = <TwoDimensionalOptionsModel>model.options;

    fillScales(scales,
        options.scale.scaleKey.domain,
        options.scale.scaleKey.range.start,
        options.scale.scaleKey.range.end,
        model.chartSettings.bar.distance,
        options.scale.scaleValue.domain,
        options.scale.scaleValue.range.start,
        options.scale.scaleValue.range.end);

    updateValueAxisDomain(scales.scaleValue,
        options.axis.valueAxis.class,
        options.axis.valueAxis.orient);
    
    updateChartsByValueAxis(options.charts,
        scales.scaleKey,
        scales.scaleValue,
        data,
        model.chartBlock.margin,
        options.axis.keyAxis.orient,
        model.blockCanvas.size.width,
        model.blockCanvas.size.height);
}

function prepareData(data: any, model: Model): void {
    if(model.dataSettings.limit !== -1) {
        (model.options.charts as any).map((chart: any) => chart.data.dataSource).forEach((dataset: any) => {
            data[dataset].splice(model.dataSettings.limit, data[dataset].length - model.dataSettings.limit);
        })
    }
}
 
const scales: Scales = {
    scaleKey: null,
    scaleValue: null
}

export default {
    render(model: Model, data: any) {
        prepareData(data, model);
        if(model.options.type === '2d')
            render2D(model, data);
        else
            renderPolar(model, data);
    },
    updateFullBlock(model: Model, data: any) {
        clearBlock();
        this.render(model, data);
    },
    updateValueAxis(model: Model, data: any) {
        updateByValueAxis(model, data);
    }
}
