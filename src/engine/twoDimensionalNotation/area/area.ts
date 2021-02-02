import * as d3 from "d3";
import { BlockMargin, DataRow, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scale, Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { Dot } from "../../features/lineDots/dot";
import { Color } from "d3";

interface AreaChartCoordinate {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

export class Area
{
    private static areaChartClass = 'area';

    public static render(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, isSegmented: boolean): void {
        if(isSegmented)
            this.renderSegmented(block, scales, data, margin, keyAxisOrient, chart, blockSize);
        else
            this.renderGrouped(block, scales, data, margin, keyAxisOrient, chart, blockSize);
    }

    private static setChartOpacity(): void {
        
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        const area = this.getAreaGenerator(keyAxisOrient);
        chart.data.valueField.forEach((field, fieldIndex) => {
            const areaCoordinate: AreaChartCoordinate[] = this.getAreaCoordinateByKeyOrient(keyAxisOrient,
                data,
                scales,
                margin,
                chart.data.keyField.name,
                field.name,
                blockSize);
        
            const path = block.getChartBlock()
                .append('path')
                .attr('d', area(areaCoordinate))
                .attr('class', this.areaChartClass)
                .style('clip-path', `url(${block.getClipPathId()})`);
        
            Helper.setCssClasses(path, chart.cssClasses);
            Helper.setChartElementColor(path, chart.style.elementColors, fieldIndex, 'fill');
    
            Dot.render(block, data, keyAxisOrient, scales, margin, chart.data.keyField.name, field.name, chart.cssClasses, fieldIndex, chart.style.elementColors, blockSize, false);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        const keys = chart.data.valueField.map(field => field.name);
        const stackedData = d3.stack().keys(keys)(data);
        const area = this.getSegmentedAreaGenerator(keyAxisOrient, scales, margin, chart.data.keyField.name);

        const areas = block.getChartBlock()
            .selectAll('.area')
            .data(stackedData)
            .enter()
                .append('path')
                .attr('d', d => area(d))
                .attr('class', this.areaChartClass)
                .style('clip-path', `url(${block.getClipPathId()})`);

        Helper.setCssClasses(areas, chart.cssClasses);
        this.setSegmentColor(areas, chart.style.elementColors);


        stackedData.forEach((sd, index) => {
            Dot.render(block, sd, keyAxisOrient, scales, margin, chart.data.keyField.name, '1', chart.cssClasses, index, chart.style.elementColors, blockSize, true);
        });
    }

    public static updateAreaChartByValueAxis(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, chart: TwoDimensionalChartModel, keyAxisOrient: Orient, blockSize: Size): void {
        const area = this.getAreaGenerator(keyAxisOrient);
        const areaCoordinate: AreaChartCoordinate[] = this.getAreaCoordinateByKeyOrient(keyAxisOrient,
            data,
            scales,
            margin,
            chart.data.keyField.name,
            chart.data.valueField[0].name,
            blockSize);
    
        block.getChartBlock()
            .select(`.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .transition()
            .duration(1000)
                .attr('d', area(areaCoordinate));

        Dot.updateDotsCoordinateByValueAxis(block, data, keyAxisOrient, scales, margin, chart.data.keyField.name, chart.data.valueField[0].name, chart.cssClasses);
    }

    private static getAreaGenerator(keyAxisOrient: Orient): d3.Area<AreaChartCoordinate> {
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

    private static getSegmentedAreaGenerator(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string): d3.Area<DataRow> {
        if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return d3.area<DataRow>()
                .x(d => scales.scaleKey(d.data[keyField]) + margin.left)
                .y0(d => scales.scaleValue(d[0]) + margin.top)
                .y1(d => scales.scaleValue(d[1]) + margin.top);
        }
        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return d3.area<DataRow>()
                .x0(d => scales.scaleValue(d[0]) + margin.top)
                .x1(d => scales.scaleValue(d[1]) + margin.top)
                .y(d => scales.scaleKey(d.data[keyField]) + margin.top);
        }
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

    private static setSegmentColor(segments: d3.Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: Color[]): void {
        segments.style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}