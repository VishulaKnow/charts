import { area, stack, Area as IArea } from 'd3-shape';
import { select, Selection, BaseType } from 'd3-selection'
import { Color } from "d3-color";
import { transition } from 'd3-transition';
import { BlockMargin, DataRow, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scale, Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { Dot } from "../../features/lineDots/dot";

select.prototype.transition = transition;

export class Area
{
    private static areaChartClass = 'area';

    public static render(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, isSegmented: boolean): void {
        if(isSegmented)
            this.renderSegmented(block, scales, data, margin, keyAxisOrient, chart, blockSize);
        else
            this.renderGrouped(block, scales, data, margin, keyAxisOrient, chart, blockSize);
    }

    public static updateAreaChartByValueAxis(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, chart: TwoDimensionalChartModel, keyAxisOrient: Orient, blockSize: Size, isSegmented: boolean): void {
        if(isSegmented) {
            const area = this.getSegmentedAreaGenerator(keyAxisOrient, scales, margin, chart.data.keyField.name);
            const areas = block.getChartBlock()
                .selectAll(`path.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`) as Selection<SVGRectElement, DataRow[], BaseType, unknown>;
            
            areas
                .transition()
                .duration(1000)
                    .attr('d', d => area(d as DataRow[]));

            areas.each((d, i) => {
                Dot.updateDotsCoordinateByValueAxis(block, d, keyAxisOrient, scales, margin, chart.data.keyField.name, '1', chart.cssClasses, i, isSegmented);
            });
        } else {
            chart.data.valueFields.forEach((field, index) => {
                const area = this.getGroupedAreaGenerator(keyAxisOrient, scales, margin, chart.data.keyField.name, field.name, blockSize);
            
                block.getChartBlock()
                    .select(`.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`)
                    .transition()
                    .duration(1000)
                        .attr('d', area(data));
        
                Dot.updateDotsCoordinateByValueAxis(block, data, keyAxisOrient, scales, margin, chart.data.keyField.name, field.name, chart.cssClasses, index, isSegmented);
            });
        }
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        chart.data.valueFields.forEach((field, index) => {
            const area = this.getGroupedAreaGenerator(keyAxisOrient, scales, margin, chart.data.keyField.name, field.name, blockSize);
        
            const path = block.getChartBlock()
                .append('path')
                .attr('d', area(data))
                .attr('class', this.areaChartClass)
                .style('clip-path', `url(${block.getClipPathId()})`)
                .style('pointer-events', 'none');
        
            Helper.setCssClasses(path, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            Helper.setChartStyle(path, chart.style, index, 'fill');
    
            Dot.render(block, data, keyAxisOrient, scales, margin, chart.data.keyField.name, field.name, chart.cssClasses, index, chart.style.elementColors, blockSize, false);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        const keys = chart.data.valueFields.map(field => field.name);
        const stackedData = stack().keys(keys)(data);
        const area = this.getSegmentedAreaGenerator(keyAxisOrient, scales, margin, chart.data.keyField.name);

        const areas = block.getChartBlock()
            .selectAll('.area')
            .data(stackedData)
            .enter()
                .append('path')
                .attr('d', d => area(d))
                .attr('class', this.areaChartClass)
                .style('clip-path', `url(${block.getClipPathId()})`)
                .style('pointer-events', 'none');

        areas.each(function(d, i) {
            Helper.setCssClasses(select(this), Helper.getCssClassesWithElementIndex(chart.cssClasses, i));
        });
        this.setSegmentColor(areas, chart.style.elementColors);

        stackedData.forEach((sd, index) => {
            Dot.render(block, sd, keyAxisOrient, scales, margin, chart.data.keyField.name, '1', chart.cssClasses, index, chart.style.elementColors, blockSize, true);
        });
    }

    private static getGroupedAreaGenerator(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyFieldName: string, valueFieldName: string, blockSize: Size): IArea<DataRow> {
        if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top')
            return area<DataRow>()
                .x(d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyFieldName]) + margin.left)
                .y0(d => this.getZeroCoordinate(keyAxisOrient, margin, blockSize))
                .y1(d => scales.scaleValue(d[valueFieldName]) + margin.top);
        if(keyAxisOrient === 'left' || keyAxisOrient === 'right')
            return area<DataRow>()
                .x0(d => this.getZeroCoordinate(keyAxisOrient, margin, blockSize))
                .x1(d => scales.scaleValue(d[valueFieldName]) + margin.left,)
                .y(d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyFieldName]) + margin.top);
    }

    private static getSegmentedAreaGenerator(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string): IArea<DataRow> {
        if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return area<DataRow>()
                .x(d => scales.scaleKey(d.data[keyField]) + margin.left)
                .y0(d => scales.scaleValue(d[0]) + margin.top)
                .y1(d => scales.scaleValue(d[1]) + margin.top);
        }
        
        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return area<DataRow>()
                .x0(d => scales.scaleValue(d[0]) + margin.left)
                .x1(d => scales.scaleValue(d[1]) + margin.left)
                .y(d => scales.scaleKey(d.data[keyField]) + margin.top);
        }
    }

    private static getZeroCoordinate(axisOrient: Orient, margin: BlockMargin, blockSize: Size): number {
        if(axisOrient === 'bottom')
            return blockSize.height - margin.bottom;
        if(axisOrient === 'top')
            return margin.top;

        if(axisOrient === 'left')
            return margin.left;
        if(axisOrient === 'right')
            return blockSize.width - margin.right;
    }

    private static setSegmentColor(segments: Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: Color[]): void {
        segments.style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}