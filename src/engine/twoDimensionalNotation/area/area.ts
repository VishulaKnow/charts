import * as d3 from "d3";
import { Color } from "d3";
import { BlockMargin, DataRow, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scale, Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";

interface AreaChartCoordinate {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

export class Area
{
    private static areaChartClass = 'area';

    public static render(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: string, chart: TwoDimensionalChartModel, blockSize: Size): void {
        const area = this.getAreaGenerator(keyAxisOrient);
        const areaCoordinate: AreaChartCoordinate[] = this.getAreaCoordinateByKeyOrient(keyAxisOrient,
            data,
            scales,
            margin,
            chart.data.keyField.name,
            chart.data.valueField.name,
            blockSize);
    
        const path = block.getChartBlock()
            .append('path')
            .attr('d', area(areaCoordinate))
            .attr('class', this.areaChartClass)
            .style('clip-path', `url(${block.getClipPathId()})`);
    
        Helper.setCssClasses(path, chart.cssClasses);
        Helper.setChartElementColor(path, chart.elementColors, 'fill');
    }

    public static updateAreaChartByValueAxis(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, keyAxisOrient: string, blockSize: Size, cssClasses: string[]): void {
        const area = this.getAreaGenerator(keyAxisOrient);
        const areaCoordinate: AreaChartCoordinate[] = this.getAreaCoordinateByKeyOrient(keyAxisOrient,
            data,
            scales,
            margin,
            keyField,
            valueField,
            blockSize);
    
        block.getChartBlock()
            .select(`.${this.areaChartClass}${Helper.getCssClassesLine(cssClasses)}`)
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
                    x0: Scale.getScaleKeyPoint(scales.scaleKey, d[keyField]) + margin.left,
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
                    y0: Scale.getScaleKeyPoint(scales.scaleKey, d[keyField]) + margin.top,
                    y1: 0
                });
            });
        }   
        return areaCoordinate;
    }
}