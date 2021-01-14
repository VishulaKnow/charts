import * as d3 from "d3";
import { Color } from "d3";
import { BlockMargin, DataRow, Size } from "../../../model/model";
import { Helper } from "../../helper";
import { Scales } from "../scale/scale";
import { SvgBlock } from "../../svgBlock/svgBlock";

interface AreaChartCoordinate {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

export class Area
{
    public static render(scales: Scales, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, keyAxisOrient: string, cssClasses: string[], chartPalette: Color[], blockSize: Size): void {
        const area = this.getAreaGenerator(keyAxisOrient);
        const areaCoordinate: AreaChartCoordinate[] = this.getAreaCoordinateByKeyOrient(keyAxisOrient,
            data,
            scales,
            margin,
            keyField,
            valueField,
            blockSize);
    
        const path = SvgBlock.getSvg()
            .append('path')
            .attr('d', area(areaCoordinate))
            .attr('class', 'area')
            .style('clip-path', 'url(#chart-block)');
    
        Helper.setCssClasses(path, cssClasses);
        Helper.setChartColor(path, chartPalette, 'area');
    }

    public static updateAreaChartByValueAxis(scales: Scales, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, keyAxisOrient: string, blockSize: Size, cssClasses: string[]): void {
        const area = this.getAreaGenerator(keyAxisOrient);
        const areaCoordinate: AreaChartCoordinate[] = this.getAreaCoordinateByKeyOrient(keyAxisOrient,
            data,
            scales,
            margin,
            keyField,
            valueField,
            blockSize);
    
        SvgBlock.getSvg()
            .select(`.area${Helper.getCssClassesLine(cssClasses)}`)
            .transition()
            .duration(1000)
                .attr('d', area(areaCoordinate));
    }

    private static getAreaGenerator(keyAxisOrient: string): d3.Area<AreaChartCoordinate> {
        if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top')
            return d3.area<AreaChartCoordinate>()
                .x(d => d.x0)
                .y0(d => d.y0)
                .y1(d => d.y1);
        if(keyAxisOrient === 'left' || keyAxisOrient === 'right')
            return d3.area<AreaChartCoordinate>()
                .x0(d => d.x0)
                .x1(d => d.x1)
                .y(d => d.y0);
    }
    
    private static getAreaCoordinateByKeyOrient(axisOrient: string, data: DataRow[], scales: Scales, margin: BlockMargin, keyField: string, valueField: string, blockSize: Size) : AreaChartCoordinate[] {
        const areaCoordinate: AreaChartCoordinate[] = [];
        if(axisOrient === 'bottom' || axisOrient === 'top') {
            let y0: number = margin.top;
            if(axisOrient === 'bottom')
                y0 = blockSize.height - margin.bottom;
            data.forEach(d => {
                areaCoordinate.push({
                    x0: scales.scaleKey(d[keyField]) + scales.scaleKey.bandwidth() / 2 + margin.left,
                    x1: 0,
                    y0,
                    y1: scales.scaleValue(d[valueField]) + margin.top
                });
            });
        } 
        else if(axisOrient === 'left' || axisOrient === 'right') {
            let x0: number = margin.left;
            if(axisOrient === 'right')
                x0 = blockSize.width - margin.right;
            data.forEach(d => {
                areaCoordinate.push({
                    x0,
                    x1: scales.scaleValue(d[valueField]) + margin.left,
                    y0: scales.scaleKey(d[keyField]) + scales.scaleKey.bandwidth() / 2 + margin.top,
                    y1: 0
                });
            });
        }   
        return areaCoordinate;
    }
}