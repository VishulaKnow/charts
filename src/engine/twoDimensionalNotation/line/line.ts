import * as d3 from "d3";
import { color, Color } from "d3";
import { BlockMargin, DataRow } from "../../../model/model";
import { Helper } from "../../helper";
import { Scale, Scales } from "../scale/scale";
import { Block } from "../../block/svgBlock";

interface LineChartCoordinate {
    x: number;
    y: number;
}

export class Line
{
    public static render(scales: Scales, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, keyAxisOrient: string, cssClasses: string[], chartPalette: Color[]): void {
        const line = this.getLineGenerator();
        const lineCoordinate: LineChartCoordinate[] = this.getLineCoordinateByKeyOrient(keyAxisOrient,
            data,
            scales,
            margin,
            keyField,
            valueField);    
        
        const path = Block.getChartBlock()
            .append('path')
            .attr('d', line(lineCoordinate))
            .attr('class', 'line')
            .style('clip-path', `url(${Block.getClipPathId()})`);
    
        Helper.setCssClasses(path, cssClasses);
        Helper.setChartElementColor(path, chartPalette, 'stroke');
        // this.renderDots(lineCoordinate, cssClasses, chartPalette);
    }

    public static updateLineChartByValueAxis(scales: Scales, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, keyAxisOrient: string, cssClasses: string[]): void {
        const line = this.getLineGenerator();
        const lineCoordinate: LineChartCoordinate[] = this.getLineCoordinateByKeyOrient(keyAxisOrient,
            data,
            scales,
            margin,
            keyField,
            valueField);
        
        Block.getChartBlock()
            .select(`.line${Helper.getCssClassesLine(cssClasses)}`)
            .transition()
            .duration(1000)
                .attr('d', line(lineCoordinate));
    }

    private static getLineGenerator(): d3.Line<LineChartCoordinate> {
        return d3.line<LineChartCoordinate>()
            .x(d => d.x)
            .y(d => d.y);
    }

    public static moveChartsToFront(): void {
        Block.getChartBlock()
            .selectAll('.line')
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

    private static renderDots(coordinates: LineChartCoordinate[], cssClasses: string[], colorPalette: Color[]): void {
        const dots = Block.getChartBlock()
            .selectAll(`.dot${Helper.getCssClassesLine(cssClasses)}`)
            .data(coordinates)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 5.5);

        Helper.setCssClasses(dots, cssClasses);
        Helper.setChartElementColor(dots, colorPalette, 'fill');
    }
}