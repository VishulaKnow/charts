import { stack } from 'd3-shape';
import { select, Selection } from 'd3-selection'
import { Color } from "d3-color";
import { BlockMargin, DataRow, Field, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { MarkDot } from "../../features/markDots/markDot";
import { AreaHelper } from './areaHelper';

export class Area {
    public static areaChartClass = 'area';

    public static render(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        if (chart.isSegmented)
            this.renderSegmented(block, scales, data, keyField, margin, keyAxisOrient, chart);
        else
            this.renderGrouped(block, scales, data, keyField, margin, keyAxisOrient, chart, blockSize);
    }

    public static updateData(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, chart: TwoDimensionalChartModel, keyAxisOrient: Orient, blockSize: Size): void {
        if (chart.isSegmented) {
            const keys = chart.data.valueFields.map(field => field.name);
            const stackedData = stack().keys(keys)(data);

            const areaGenerator = AreaHelper.getSegmentedAreaGenerator(keyAxisOrient, scales, margin, keyField.name);
            const areas = block.getChartGroup(chart.index)
                .selectAll<SVGRectElement, DataRow[]>(`path.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`);

            areas
                .data(stackedData)
                .interrupt()
                .transition()
                .duration(block.transitionManager.durations.updateChartsDuration)
                .attr('d', d => areaGenerator(d));

            if (chart.markersOptions.show) {
                areas.each((dataset, index) => {
                    // '1' - атрибут, показывающий координаты согласно полю значения
                    MarkDot.updateDotsCoordinateByValueAxis(block, dataset, keyAxisOrient, scales, margin, keyField.name, index, '1', chart);
                });
            }
        } else {
            chart.data.valueFields.forEach((field, valueFieldIndex) => {
                const area = AreaHelper.getGroupedAreaGenerator(keyAxisOrient, scales, margin, keyField.name, field.name, blockSize);

                block.getChartGroup(chart.index)
                    .select(`.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueFieldIndex}`)
                    .interrupt()
                    .transition()
                    .duration(block.transitionManager.durations.updateChartsDuration)
                    .attr('d', area(data));

                if (chart.markersOptions.show) {
                    MarkDot.updateDotsCoordinateByValueAxis(block, data, keyAxisOrient, scales, margin, keyField.name, valueFieldIndex, field.name, chart);
                }
            });
        }
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        chart.data.valueFields.forEach((field, valueFieldIndex) => {
            const area = AreaHelper.getGroupedAreaGenerator(keyAxisOrient, scales, margin, keyField.name, field.name, blockSize);

            const path = block.getChartGroup(chart.index)
                .append('path')
                .attr('d', area(data))
                .attr('class', this.areaChartClass)
                .style('clip-path', `url(#${block.getClipPathId()})`)
                .style('pointer-events', 'none');

            Helper.setCssClasses(path, Helper.getCssClassesWithElementIndex(chart.cssClasses, valueFieldIndex));
            Helper.setChartStyle(path, chart.style, valueFieldIndex, 'fill');

            if (chart.markersOptions.show)
                MarkDot.render(block, data, keyAxisOrient, scales, margin, keyField.name, valueFieldIndex, field.name, chart);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        const keys = chart.data.valueFields.map(field => field.name);
        const stackedData = stack().keys(keys)(data);
        const areaGenerator = AreaHelper.getSegmentedAreaGenerator(keyAxisOrient, scales, margin, keyField.name);

        const areas = block.getChartGroup(chart.index)
            .selectAll(`.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData)
            .enter()
            .append('path')
            .attr('d', d => areaGenerator(d))
            .attr('class', this.areaChartClass)
            .style('clip-path', `url(#${block.getClipPathId()})`)
            .style('pointer-events', 'none');

        areas.each(function (d, i) {
            Helper.setCssClasses(select(this), Helper.getCssClassesWithElementIndex(chart.cssClasses, i));
        });

        this.setSegmentColor(areas, chart.style.elementColors);

        if (chart.markersOptions.show) {
            stackedData.forEach((dataset, index) => {
                MarkDot.render(block, dataset, keyAxisOrient, scales, margin, keyField.name, index, '1', chart);
            });
        }
    }

    private static setSegmentColor(segments: Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: Color[]): void {
        segments.style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}