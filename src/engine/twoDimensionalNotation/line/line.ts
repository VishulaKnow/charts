import { stack } from 'd3-shape';
import { select, Selection } from 'd3-selection';
import { Color } from "d3-color";
import { BlockMargin, DataRow, Field, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { MarkDot } from "../../features/markDots/markDot";
import { LineHelper } from './lineHelper';

export class Line {
    public static lineChartClass = 'line';

    public static render(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        if (chart.isSegmented)
            this.renderSegmented(block, scales, data, keyField, margin, keyAxisOrient, chart, chart.markersOptions.show);
        else
            this.renderGrouped(block, scales, data, keyField, margin, keyAxisOrient, chart, chart.markersOptions.show);
    }

    public static updateData(block: Block, scales: Scales, newData: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        if (chart.isSegmented) {
            const keys = chart.data.valueFields.map(field => field.name);
            const stackedData = stack().keys(keys)(newData);

            const lineGenerator = LineHelper.getSegmentedLineGenerator(keyAxisOrient, scales, keyField.name, margin);

            const lines = block.getChartGroup(chart.index)
                .selectAll<SVGPathElement, DataRow[]>(`path.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`);

            lines
                .data(stackedData)
                .interrupt()
                .transition()
                .duration(block.transitionManager.durations.updateChartsDuration)
                .attr('d', d => lineGenerator(d));

            if (chart.markersOptions.show) {
                lines.each((dataset, index) => {
                    MarkDot.updateDotsCoordinateByValueAxis(block, dataset, keyAxisOrient, scales, margin, keyField.name, index, '1', chart);
                });
            }
        } else {
            chart.data.valueFields.forEach((valueField, valueFieldIndex) => {
                const line = LineHelper.getLineGenerator(keyAxisOrient, scales, keyField.name, valueField.name, margin);

                block.getChartGroup(chart.index)
                    .select(`.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueFieldIndex}`)
                    .interrupt()
                    .transition()
                    .duration(block.transitionManager.durations.updateChartsDuration)
                    .attr('d', line(newData));

                if (chart.markersOptions.show) {
                    MarkDot.updateDotsCoordinateByValueAxis(block, newData, keyAxisOrient, scales, margin, keyField.name, valueFieldIndex, valueField.name, chart);
                }
            });
        }
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, markFlag: boolean): void {
        chart.data.valueFields.forEach((valueField, valueFieldIndex) => {
            const lineGenerator = LineHelper.getLineGenerator(keyAxisOrient, scales, keyField.name, valueField.name, margin);

            const path = block.getChartGroup(chart.index)
                .append('path')
                .attr('d', lineGenerator(data))
                .attr('class', this.lineChartClass)
                .style('fill', 'none')
                .style('clip-path', `url(#${block.getClipPathId()})`)
                .style('pointer-events', 'none');

            Helper.setCssClasses(path, Helper.getCssClassesWithElementIndex(chart.cssClasses, valueFieldIndex));
            Helper.setChartStyle(path, chart.style, valueFieldIndex, 'stroke');

            if (markFlag)
                MarkDot.render(block, data, keyAxisOrient, scales, margin, keyField.name, valueFieldIndex, valueField.name, chart);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, markFlag: boolean): void {
        const keys = chart.data.valueFields.map(field => field.name);
        const stackedData = stack().keys(keys)(data);

        const lineGenerator = LineHelper.getSegmentedLineGenerator(keyAxisOrient, scales, keyField.name, margin);

        const lines = block.getChartGroup(chart.index)
            .selectAll(`.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData)
            .enter()
            .append('path')
            .attr('d', d => lineGenerator(d))
            .attr('class', this.lineChartClass)
            .style('fill', 'none')
            .style('clip-path', `url(#${block.getClipPathId()})`)
            .style('pointer-events', 'none');

        lines.each(function (d, i) {
            Helper.setCssClasses(select(this), Helper.getCssClassesWithElementIndex(chart.cssClasses, i));
        });

        this.setSegmentColor(lines, chart.style.elementColors);

        stackedData.forEach((dataset, index) => {
            if (markFlag)
                MarkDot.render(block, dataset, keyAxisOrient, scales, margin, keyField.name, index, '1', chart);
        });
    }

    private static setSegmentColor(segments: Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: Color[]): void {
        segments.style('stroke', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}