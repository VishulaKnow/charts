import { stack } from 'd3-shape';
import { select, Selection } from 'd3-selection'
import { BlockMargin, Field, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { MarkDot } from "../../features/markDots/markDot";
import { AreaHelper } from './areaHelper';
import { DomHelper } from '../../helpers/domHelper';
import { Helper } from '../../helpers/helper';
import { DataRow, Size } from '../../../config/config';

export class Area {
    public static readonly areaChartClass = 'area';

    public static render(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        if (chart.isSegmented)
            this.renderSegmented(block, scales, data, keyField, margin, keyAxisOrient, chart);
        else
            this.renderGrouped(block, scales, data, keyField, margin, keyAxisOrient, chart, blockSize);
    }

    public static update(block: Block, scales: Scales, newData: DataRow[], keyField: Field, margin: BlockMargin, chart: TwoDimensionalChartModel, keyAxisOrient: Orient, blockSize: Size): void {
        if (chart.isSegmented) {
            this.updateSegmented(block, scales, newData, keyField, margin, chart, keyAxisOrient);
        } else {
            this.updateGrouped(block, scales, newData, keyField, margin, chart, keyAxisOrient, blockSize);
        }
    }

    public static updateColors(block: Block, chart: TwoDimensionalChartModel): void {
        chart.data.valueFields.forEach((_vf, valueIndex) => {
            const path = block.getChartGroup(chart.index)
                .select(`.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueIndex}`);
            DomHelper.setChartStyle(path, chart.style, valueIndex, 'fill');
            MarkDot.updateColors(block, chart, valueIndex);
        });
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        chart.data.valueFields.forEach((field, valueIndex) => {
            const area = AreaHelper.getGroupedAreaGenerator(keyAxisOrient, scales, margin, keyField.name, field.name, blockSize);

            const path = block.getChartGroup(chart.index)
                .append('path')
                .attr('d', area(data))
                .attr('class', this.areaChartClass)
                .style('clip-path', `url(#${block.getClipPathId()})`)
                .style('pointer-events', 'none');

            DomHelper.setCssClasses(path, Helper.getCssClassesWithElementIndex(chart.cssClasses, valueIndex));
            DomHelper.setChartStyle(path, chart.style, valueIndex, 'fill');

            MarkDot.render(block, data, keyAxisOrient, scales, margin, keyField.name, valueIndex, field.name, chart);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        const stackedData = stack().keys(chart.data.valueFields.map(field => field.name))(data);
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
            DomHelper.setCssClasses(select(this), Helper.getCssClassesWithElementIndex(chart.cssClasses, i));
        });

        this.setSegmentColor(areas, chart.style.elementColors);

        stackedData.forEach((dataset, index) => {
            MarkDot.render(block, dataset, keyAxisOrient, scales, margin, keyField.name, index, '1', chart);
        });
    }

    private static updateGrouped(block: Block, scales: Scales, newData: DataRow[], keyField: Field, margin: BlockMargin, chart: TwoDimensionalChartModel, keyAxisOrient: Orient, blockSize: Size): void {
        chart.data.valueFields.forEach((field, valueIndex) => {
            const area = AreaHelper.getGroupedAreaGenerator(keyAxisOrient, scales, margin, keyField.name, field.name, blockSize);

            block.getChartGroup(chart.index)
                .select(`.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueIndex}`)
                .interrupt()
                .transition()
                .duration(block.transitionManager.durations.chartUpdate)
                .attr('d', area(newData));

            MarkDot.update(block, newData, keyAxisOrient, scales, margin, keyField.name, valueIndex, field.name, chart);
        });
    }

    private static updateSegmented(block: Block, scales: Scales, newData: DataRow[], keyField: Field, margin: BlockMargin, chart: TwoDimensionalChartModel, keyAxisOrient: Orient): void {
        const stackedData = stack().keys(chart.data.valueFields.map(field => field.name))(newData);

        const areaGenerator = AreaHelper.getSegmentedAreaGenerator(keyAxisOrient, scales, margin, keyField.name);
        const areas = block.getChartGroup(chart.index)
            .selectAll<SVGRectElement, DataRow[]>(`path.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`);

        areas
            .data(stackedData)
            .interrupt()
            .transition()
            .duration(block.transitionManager.durations.chartUpdate)
            .attr('d', d => areaGenerator(d));

        areas.each((dataset, index) => {
            // '1' - атрибут, показывающий координаты согласно полю значения
            MarkDot.update(block, dataset, keyAxisOrient, scales, margin, keyField.name, index, '1', chart);
        });
    }

    private static setSegmentColor(segments: Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: string[]): void {
        segments.style('fill', (d, i) => colorPalette[i % colorPalette.length]);
    }
}