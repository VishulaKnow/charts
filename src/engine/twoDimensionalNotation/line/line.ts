import * as d3 from "d3";
import { Color } from "d3";
import { BlockMargin, DataRow } from "../../../model/model";
import { Helper } from "../../helper";
import { Scales } from "../scale/scale";
import { SvgBlock } from "../../svgBlock/svgBlock";

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
        
        const path = SvgBlock.getSvg()
            .append('path')
            .attr('d', line(lineCoordinate))
            .attr('class', 'line')
            .style('clip-path', 'url(#chart-block)');
    
        Helper.setCssClasses(path, cssClasses);
        Helper.setChartColor(path, chartPalette, 'line');
    }

    public static updateLineChartByValueAxis(scales: Scales, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, keyAxisOrient: string, cssClasses: string[]): void {
        const line = this.getLineGenerator();
        const lineCoordinate: LineChartCoordinate[] = this.getLineCoordinateByKeyOrient(keyAxisOrient,
            data,
            scales,
            margin,
            keyField,
            valueField);
        
        SvgBlock.getSvg()
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
    
    private static getLineCoordinateByKeyOrient(axisOrient: string, data: DataRow[], scales: Scales, margin: BlockMargin, keyField: string, valueField: string): LineChartCoordinate[] {
        const lineCoordinate: LineChartCoordinate[] = [];
        if(axisOrient === 'bottom' || axisOrient === 'top')
            data.forEach(d => {
                lineCoordinate.push({
                    x: scales.scaleKey(d[keyField]) + scales.scaleKey.bandwidth() / 2 + margin.left,
                    y: scales.scaleValue(d[valueField]) + margin.top
                });
            });
        else if(axisOrient === 'left' || axisOrient === 'right')
            data.forEach(d => {
                lineCoordinate.push({
                    x: scales.scaleValue(d[valueField]) + margin.left,
                    y: scales.scaleKey(d[keyField]) + scales.scaleKey.bandwidth() / 2 + margin.top
                });
            });
        return lineCoordinate;
    }
}