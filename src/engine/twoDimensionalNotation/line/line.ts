import * as d3 from "d3";
import { BlockCanvas, BlockMargin, DataRow, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scale, Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { Color } from "d3";
import { MarginModel } from "../../../model/marginModel";

interface LineChartCoordinate {
    x: number;
    y: number;
}

interface DotAttrs {
    cx: (data: DataRow) => number;
    cy: (data: DataRow) => number; 
}

export class Line
{
    private static lineChartClass = 'line';
    private static dotClass = 'dot';

    public static render(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        const line = this.getLineGenerator();
        const lineCoordinate: LineChartCoordinate[] = this.getLineCoordinateByKeyOrient(keyAxisOrient,
            data,
            scales,
            margin,
            chart.data.keyField.name,
            chart.data.valueField.name);
        
        const path = block.getChartBlock()
            .append('path')
            .attr('d', line(lineCoordinate))
            .attr('class', this.lineChartClass)
            .style('clip-path', `url(${block.getClipPathId()})`);
    
        Helper.setCssClasses(path, chart.cssClasses);
        Helper.setChartElementColor(path, chart.elementColors, 'stroke');
        this.renderDots(block, data, keyAxisOrient, scales, margin, chart.data.keyField.name, chart.data.valueField.name, chart.cssClasses, chart.elementColors);
    }

    public static updateLineChartByValueAxis(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        const line = this.getLineGenerator();
        const lineCoordinate: LineChartCoordinate[] = this.getLineCoordinateByKeyOrient(keyAxisOrient,
            data,
            scales,
            margin,
            chart.data.keyField.name,
            chart.data.valueField.name);
        
        block.getChartBlock()
            .select(`.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .transition()
            .duration(1000)
                .attr('d', line(lineCoordinate));

        this.updateDotsCoordinateByValueAxis(block, data, keyAxisOrient, scales, margin, chart.data.keyField.name, chart.data.valueField.name, chart.cssClasses);
    }

    public static getAllDots(block: Block): d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown> {
        return block.getSvg()
            .selectAll(`.${this.dotClass}`);
    }

    private static getLineGenerator(): d3.Line<LineChartCoordinate> {
        return d3.line<LineChartCoordinate>()
            .x(d => d.x)
            .y(d => d.y);
    }

    public static moveChartsToFront(block: Block): void {
        block.getChartBlock()
            .selectAll(`.${this.lineChartClass}`)
            .raise();
    }
    
    private static getLineCoordinateByKeyOrient(axisOrient: string, data: DataRow[], scales: Scales, margin: BlockMargin, keyField: string, valueField: string): LineChartCoordinate[] {
        const lineCoordinate: LineChartCoordinate[] = [];
        if(axisOrient === 'bottom' || axisOrient === 'top')
            data.forEach(d => {
                lineCoordinate.push({
                    x: Scale.getScaleKeyPoint(scales.scaleKey, d[keyField]) + margin.left,
                    y: scales.scaleValue(d[valueField]) + margin.top
                });
            });
        else if(axisOrient === 'left' || axisOrient === 'right')
            data.forEach(d => {
                lineCoordinate.push({
                    x: scales.scaleValue(d[valueField]) + margin.left,
                    y: Scale.getScaleKeyPoint(scales.scaleKey, d[keyField]) + margin.top
                });
            });
            
        return lineCoordinate;
    }

    private static updateDotsCoordinateByValueAxis(block: Block, data: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, cssClasses: string[]): void {
        const dots = block.getChartBlock()
            .selectAll(`.${this.dotClass}${Helper.getCssClassesLine(cssClasses)}`)
            .data(data);
        
        const attrs = this.getDotAttrs(keyAxisOrient, scales, margin, keyField, valueField);

        dots
            .transition()
            .duration(1000)
                .attr('cx', d => attrs.cx(d))
                .attr('cy', d => attrs.cy(d));

        block.getChartBlock()
            .selectAll(`.dot-inside${Helper.getCssClassesLine(cssClasses)}`)
            .data(data)
            .transition()
            .duration(1000)
                .attr('cx', d => attrs.cx(d))
                .attr('cy', d => attrs.cy(d));
    }

    private static renderDots(block: Block, data: DataRow[], keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, cssClasses: string[], colorPalette: Color[]): void {
        const dotsWrapper = block.getChartBlock()
            .selectAll(`.${this.dotClass}${Helper.getCssClassesLine(cssClasses)}`)
            .data(data)
            .enter();

        const attrs = this.getDotAttrs(keyAxisOrient, scales, margin, keyField, valueField);

        const dots = dotsWrapper.append('circle')
            .attr('class', this.dotClass)
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', 5.5);

        const dotsInside = dotsWrapper.append('circle')
            .attr('class', 'dot-inside')
            .attr('cx', d => attrs.cx(d))
            .attr('cy', d => attrs.cy(d))
            .attr('r', 2.5)
            .style('fill', 'white')
            .style('pointer-events', 'none');

        Helper.setCssClasses(dots, cssClasses);
        Helper.setCssClasses(dotsInside, cssClasses);
        Helper.setChartElementColor(dots, colorPalette, 'fill');
    }

    private static getDotAttrs(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string): DotAttrs {
        const attrs: DotAttrs = { cx: null, cy: null } 

        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            attrs.cx = d => scales.scaleValue(d[valueField]) + margin.left;
            attrs.cy = d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyField]) + margin.top;
        } else if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            attrs.cx = d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyField]) + margin.left,
            attrs.cy = d => scales.scaleValue(d[valueField]) + margin.top
        }

        return attrs;
    }
}