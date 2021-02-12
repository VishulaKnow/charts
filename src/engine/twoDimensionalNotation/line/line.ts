import { stack, line, Line as ILine } from 'd3-shape';
import { select, Selection } from 'd3-selection';
import { Color } from "d3-color";
import { BlockMargin, DataRow, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scale, Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { Dot } from "../../features/lineDots/dot";
import { transition } from 'd3-transition';

select.prototype.transition = transition;

export class Line
{
    private static lineChartClass = 'line';

    public static render(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, isSegmented: boolean): void {
        if(isSegmented)
            this.renderSegmented(block, scales, data, margin, keyAxisOrient, chart, blockSize);
        else
            this.renderGrouped(block, scales, data, margin, keyAxisOrient, chart, blockSize);
    }

    public static updateLineChartByValueAxis(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        chart.data.valueFields.forEach((valueField, index) => {
            const line = this.getLineGenerator(keyAxisOrient, scales, chart.data.keyField.name, valueField.name, margin);
            
            block.getChartBlock()
                .select(`.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`)
                .transition()
                .duration(1000)
                    .attr('d', line(data));
    
            Dot.updateDotsCoordinateByValueAxis(block, data, keyAxisOrient, scales, margin, chart.data.keyField.name, valueField.name, chart.cssClasses, index, false);
        });
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        chart.data.valueFields.forEach((valueField, index) => {
            const lineGenerator = this.getLineGenerator(keyAxisOrient, scales, chart.data.keyField.name, valueField.name, margin);
            
            const path = block.getChartBlock()
                .append('path')
                .attr('d', lineGenerator(data))
                .attr('class', this.lineChartClass)
                .style('fill', 'none')
                // .style('clip-path', `url(${block.getClipPathId()})`)
                .style('pointer-events', 'none');
        
            Helper.setCssClasses(path, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            Helper.setChartStyle(path, chart.style, index, 'stroke');

            Dot.render(block, data, keyAxisOrient, scales, margin, chart.data.keyField.name, valueField.name, chart.cssClasses, index, chart.style.elementColors, blockSize, false);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        const keys = chart.data.valueFields.map(field => field.name);
        const stackedData = stack().keys(keys)(data);
        const lineGenerator = this.getSegmentedLineGenerator(keyAxisOrient, scales, chart.data.keyField.name, margin);

        const areas = block.getChartBlock()
            .selectAll('.area')
            .data(stackedData)
            .enter()
                .append('path')
                .attr('d', d => lineGenerator(d))
                .attr('class', this.lineChartClass)
                .style('fill', 'none')
                // .style('clip-path', `url(${block.getClipPathId()})`)
                .style('pointer-events', 'none');

        areas.each(function(d, i) {
            Helper.setCssClasses(select(this), Helper.getCssClassesWithElementIndex(chart.cssClasses, i));
        });

        this.setSegmentColor(areas, chart.style.elementColors);

        stackedData.forEach((sd, index) => {
            Dot.render(block, sd, keyAxisOrient, scales, margin, chart.data.keyField.name, '1', chart.cssClasses, index, chart.style.elementColors, blockSize, true);
        });
    }

    private static getLineGenerator(keyAxisOrient: Orient, scales: Scales, keyFieldName: string, valueFieldName: string, margin: BlockMargin): ILine<DataRow> {
        if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return line<DataRow>()
                .x(d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyFieldName]) + margin.left)
                .y(d => scales.scaleValue(d[valueFieldName]) + margin.top);
        }

        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return line<DataRow>()
                .x(d => scales.scaleValue(d[valueFieldName]) + margin.left)
                .y(d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyFieldName]) + margin.top);
        }
    }

    private static getSegmentedLineGenerator(keyAxisOrient: Orient, scales: Scales, keyFieldName: string, margin: BlockMargin): ILine<DataRow> {
        if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return line<DataRow>()
                .x(d => Scale.getScaleKeyPoint(scales.scaleKey, d.data[keyFieldName]) + margin.left)
                .y(d => scales.scaleValue(d[1]) + margin.top);
        }

        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return line<DataRow>()
                .x(d => scales.scaleValue(d[1]) + margin.left)
                .y(d => Scale.getScaleKeyPoint(scales.scaleKey, d.data[keyFieldName]) + margin.top);
        }
    }

    private static setSegmentColor(segments: Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: Color[]): void {
        segments.style('stroke', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}