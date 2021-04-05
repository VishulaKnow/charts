import { stack } from 'd3-shape';
import { select, Selection } from 'd3-selection';

import { BlockMargin, DataRow, Field, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { MarkDot } from "../../features/markDots/markDot";
import { LineHelper } from './lineHelper';
import { DomHelper } from '../../helpers/domHelper';
import { Helper } from '../../helpers/helper';

export class Line {
    public static readonly lineChartClass = 'line';

    public static render(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        if (chart.isSegmented)
            this.renderSegmented(block, scales, data, keyField, margin, keyAxisOrient, chart, chart.markersOptions.show);
        else
            this.renderGrouped(block, scales, data, keyField, margin, keyAxisOrient, chart, chart.markersOptions.show);
    }

    public static update(block: Block, scales: Scales, newData: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        if (chart.isSegmented) {
            this.updateSegmeneted(block, scales, newData, keyField, margin, keyAxisOrient, chart);
        } else {
            this.updateGrouped(block, scales, newData, keyField, margin, keyAxisOrient, chart);
        }
    }

    public static updateColors(block: Block, chart: TwoDimensionalChartModel): void {
        chart.data.valueFields.forEach((_vf, valueIndex) => {
            const path = block.getChartGroup(chart.index)
                .select(`.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueIndex}`);
            DomHelper.setChartStyle(path, chart.style, valueIndex, 'stroke');
        });
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, markFlag: boolean): void {
        chart.data.valueFields.forEach((valueField, valueIndex) => {
            const lineGenerator = LineHelper.getLineGenerator(keyAxisOrient, scales, keyField.name, valueField.name, margin);

            const path = block.getChartGroup(chart.index)
                .append('path')
                .attr('d', lineGenerator(data))
                .attr('class', this.lineChartClass)
                .style('fill', 'none')
                .style('clip-path', `url(#${block.getClipPathId()})`)
                .style('pointer-events', 'none');

            DomHelper.setCssClasses(path, Helper.getCssClassesWithElementIndex(chart.cssClasses, valueIndex));
            DomHelper.setChartStyle(path, chart.style, valueIndex, 'stroke');

            if (markFlag)
                MarkDot.render(block, data, keyAxisOrient, scales, margin, keyField.name, valueIndex, valueField.name, chart);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, markFlag: boolean): void {
        const stackedData = stack().keys(chart.data.valueFields.map(field => field.name))(data);
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
            DomHelper.setCssClasses(select(this), Helper.getCssClassesWithElementIndex(chart.cssClasses, i));
        });

        this.setSegmentColor(lines, chart.style.elementColors);

        stackedData.forEach((dataset, stackIndex) => {
            if (markFlag)
                MarkDot.render(block, dataset, keyAxisOrient, scales, margin, keyField.name, stackIndex, '1', chart);
        });
    }

    private static updateGrouped(block: Block, scales: Scales, newData: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        chart.data.valueFields.forEach((valueField, valueFieldIndex) => {
            const lineGenerator = LineHelper.getLineGenerator(keyAxisOrient, scales, keyField.name, valueField.name, margin);

            block.getChartGroup(chart.index)
                .select(`.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueFieldIndex}`)
                .interrupt()
                .transition()
                .duration(block.transitionManager.durations.chartUpdate)
                .attr('d', lineGenerator(newData));

            if (chart.markersOptions.show) {
                MarkDot.updateDotsCoordinateByValueAxis(block, newData, keyAxisOrient, scales, margin, keyField.name, valueFieldIndex, valueField.name, chart);
            }
        });
    }

    private static updateSegmeneted(block: Block, scales: Scales, newData: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        const stackedData = stack().keys(chart.data.valueFields.map(field => field.name))(newData);

        const lineGenerator = LineHelper.getSegmentedLineGenerator(keyAxisOrient, scales, keyField.name, margin);

        const lines = block.getChartGroup(chart.index)
            .selectAll<SVGPathElement, DataRow[]>(`path.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`);

        lines
            .data(stackedData)
            .interrupt()
            .transition()
            .duration(block.transitionManager.durations.chartUpdate)
            .attr('d', d => lineGenerator(d));

        if (chart.markersOptions.show) {
            lines.each((dataset, index) => {
                MarkDot.updateDotsCoordinateByValueAxis(block, dataset, keyAxisOrient, scales, margin, keyField.name, index, '1', chart);
            });
        }
    }

    private static setSegmentColor(segments: Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: string[]): void {
        segments.style('stroke', (d, i) => colorPalette[i % colorPalette.length]);
    }
}