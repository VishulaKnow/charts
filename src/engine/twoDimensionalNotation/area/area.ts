import { stack } from 'd3-shape';
import { select, Selection } from 'd3-selection'
import { Color } from "d3-color";
import { BlockMargin, DataRow, Field, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { MarkDot } from "../../features/lineDots/markDot";
import { AreaHelper } from './areaHelper';


export class Area {
    private static areaChartClass = 'area';

    public static render(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, markFlag: boolean): void {
        if (chart.isSegmented)
            this.renderSegmented(block, scales, data, keyField, margin, keyAxisOrient, chart, markFlag);
        else
            this.renderGrouped(block, scales, data, keyField, margin, keyAxisOrient, chart, blockSize, markFlag);
    }

    public static updateAreaChartByValueAxis(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, chart: TwoDimensionalChartModel, keyAxisOrient: Orient, blockSize: Size): void {
        if (chart.isSegmented) {
            const areaGenerator = AreaHelper.getSegmentedAreaGenerator(keyAxisOrient, scales, margin, keyField.name);
            const areas = block.getChartBlock()
                .selectAll<SVGRectElement, DataRow[]>(`path.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`);

            areas
                .transition()
                .duration(1000)
                .attr('d', d => areaGenerator(d));

            areas.each((d, i) => {
                MarkDot.updateDotsCoordinateByValueAxis(block, d, keyAxisOrient, scales, margin, keyField.name, '1', chart.cssClasses, i, chart.isSegmented);
            });
        } else {
            chart.data.valueFields.forEach((field, index) => {
                const area = AreaHelper.getGroupedAreaGenerator(keyAxisOrient, scales, margin, keyField.name, field.name, blockSize);

                block.getChartBlock()
                    .select(`.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`)
                    .transition()
                    .duration(1000)
                    .attr('d', area(data));

                MarkDot.updateDotsCoordinateByValueAxis(block, data, keyAxisOrient, scales, margin, keyField.name, field.name, chart.cssClasses, index, chart.isSegmented);
            });
        }
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, markFlag: boolean): void {
        chart.data.valueFields.forEach((field, index) => {
            const area = AreaHelper.getGroupedAreaGenerator(keyAxisOrient, scales, margin, keyField.name, field.name, blockSize);

            const path = block.getChartBlock()
                .append('path')
                .attr('d', area(data))
                .attr('class', this.areaChartClass)
                // .style('clip-path', `url(${block.getClipPathId()})`)
                .style('pointer-events', 'none');

            Helper.setCssClasses(path, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            Helper.setChartStyle(path, chart.style, index, 'fill');

            if (markFlag)
                MarkDot.render(block, data, keyAxisOrient, scales, margin, keyField.name, field.name, chart.cssClasses, index, chart.style.elementColors, false);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, markFlag: boolean): void {
        const keys = chart.data.valueFields.map(field => field.name);
        const stackedData = stack().keys(keys)(data);
        const area = AreaHelper.getSegmentedAreaGenerator(keyAxisOrient, scales, margin, keyField.name);

        const areas = block.getChartBlock()
            .selectAll(`.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData)
            .enter()
            .append('path')
            .attr('d', d => area(d))
            .attr('class', this.areaChartClass)
            // .style('clip-path', `url(${block.getClipPathId()})`)
            .style('pointer-events', 'none');

        areas.each(function (d, i) {
            Helper.setCssClasses(select(this), Helper.getCssClassesWithElementIndex(chart.cssClasses, i));
        });
        this.setSegmentColor(areas, chart.style.elementColors);

        stackedData.forEach((sd, index) => {
            if (markFlag)
                MarkDot.render(block, sd, keyAxisOrient, scales, margin, keyField.name, '1', chart.cssClasses, index, chart.style.elementColors, true);
        });
    }

    private static setSegmentColor(segments: Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: Color[]): void {
        segments.style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}