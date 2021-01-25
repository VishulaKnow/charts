import * as d3 from "d3";
import { BlockMargin, DataRow, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scale, Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { Color } from "d3";
import { MarginModel } from "../../../model/marginModel";

interface LineChartCoordinate {
    x: number;
    y: number;
}

export class Line
{
    private static lineChartClass = 'line';

    public static render(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: string, chart: TwoDimensionalChartModel): void {
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
        this.renderDots(block, lineCoordinate, chart.cssClasses, chart.elementColors);
    }

    public static updateLineChartByValueAxis(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: string, chart: TwoDimensionalChartModel): void {
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

        this.updateDotsCoordinateByValueAxis(block, lineCoordinate, chart.cssClasses);
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

    private static updateDotsCoordinateByValueAxis(block: Block, coordinates: LineChartCoordinate[], cssClasses: string[]): void {
        const dots = block.getChartBlock()
            .selectAll(`.dot${Helper.getCssClassesLine(cssClasses)}`)
            .data(coordinates);

        dots
            .transition()
            .duration(1000)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

        block.getChartBlock()
            .selectAll(`.dot-inside${Helper.getCssClassesLine(cssClasses)}`)
            .data(coordinates)
            .transition()
            .duration(1000)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
    }

    private static renderDots(block: Block, coordinates: LineChartCoordinate[], cssClasses: string[], colorPalette: Color[]): void {
        const dotsWrapper = block.getChartBlock()
            .selectAll(`.dot${Helper.getCssClassesLine(cssClasses)}`)
            .data(coordinates)
            .enter();

        const dots = dotsWrapper.append('circle')
            .attr('class', 'dot')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 5.5);

        const dotsInside = dotsWrapper.append('circle')
            .attr('class', 'dot-inside')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 2.5)
            .style('fill', 'white');

        Helper.setCssClasses(dots, cssClasses);
        Helper.setCssClasses(dotsInside, cssClasses);
        Helper.setChartElementColor(dots, colorPalette, 'fill');
    }
}