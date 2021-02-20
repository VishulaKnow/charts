import { stack } from 'd3-shape';
import { select, Selection } from 'd3-selection';
import { Color } from "d3-color";
import { BlockMargin, DataRow, Field, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { Dot } from "../../features/lineDots/dot";
import { transition } from 'd3-transition';
import { LineHelper } from './lineHelper';

select.prototype.transition = transition;

export class Line
{
    private static lineChartClass = 'line';

    public static render(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, isSegmented: boolean): void {
        if(isSegmented)
            this.renderSegmented(block, scales, data, keyField, margin, keyAxisOrient, chart, blockSize);
        else
            this.renderGrouped(block, scales, data, keyField, margin, keyAxisOrient, chart, blockSize);
    }

    public static updateLineChartByValueAxis(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        if(chart.isSegmented) {
            const lineGenerator = LineHelper.getSegmentedLineGenerator(keyAxisOrient, scales, keyField.name, margin);
            const lines = block.getChartBlock()
                .selectAll<SVGPathElement, DataRow[]>(`path.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`);

            lines
                .transition()
                .duration(1000)
                    .attr('d', d => lineGenerator(d));

            lines.each((d, i) => {
                Dot.updateDotsCoordinateByValueAxis(block, d, keyAxisOrient, scales, margin, keyField.name, '1', chart.cssClasses, i, chart.isSegmented);
            });
        } else {
            chart.data.valueFields.forEach((valueField, index) => {
                const line = LineHelper.getLineGenerator(keyAxisOrient, scales, keyField.name, valueField.name, margin);
                
                block.getChartBlock()
                    .select(`.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`)
                    .transition()
                    .duration(1000)
                        .attr('d', line(data));
        
                Dot.updateDotsCoordinateByValueAxis(block, data, keyAxisOrient, scales, margin, keyField.name, valueField.name, chart.cssClasses, index, false);
            });
        }
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        chart.data.valueFields.forEach((valueField, index) => {
            const lineGenerator = LineHelper.getLineGenerator(keyAxisOrient, scales, keyField.name, valueField.name, margin);
            
            const path = block.getChartBlock()
                .append('path')
                .attr('d', lineGenerator(data))
                .attr('class', this.lineChartClass)
                .style('fill', 'none')
                // .style('clip-path', `url(${block.getClipPathId()})`)
                .style('pointer-events', 'none');
        
            Helper.setCssClasses(path, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            Helper.setChartStyle(path, chart.style, index, 'stroke');

            Dot.render(block, data, keyAxisOrient, scales, margin, keyField.name, valueField.name, chart.cssClasses, index, chart.style.elementColors, blockSize, false);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        const keys = chart.data.valueFields.map(field => field.name);
        const stackedData = stack().keys(keys)(data);
        const lineGenerator = LineHelper.getSegmentedLineGenerator(keyAxisOrient, scales, keyField.name, margin);

        const lines = block.getChartBlock()
            .selectAll(`.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData)
            .enter()
                .append('path')
                .attr('d', d => lineGenerator(d))
                .attr('class', this.lineChartClass)
                .style('fill', 'none')
                // .style('clip-path', `url(${block.getClipPathId()})`)
                .style('pointer-events', 'none');

        lines.each(function(d, i) {
            Helper.setCssClasses(select(this), Helper.getCssClassesWithElementIndex(chart.cssClasses, i));
        });
        
        this.setSegmentColor(lines, chart.style.elementColors);

        stackedData.forEach((sd, index) => {
            Dot.render(block, sd, keyAxisOrient, scales, margin, keyField.name, '1', chart.cssClasses, index, chart.style.elementColors, blockSize, true);
        });
    }

    private static setSegmentColor(segments: Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: Color[]): void {
        segments.style('stroke', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}