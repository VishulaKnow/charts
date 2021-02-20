import { stack } from 'd3-shape';
import { select, Selection } from 'd3-selection'
import { Color } from "d3-color";
import { transition } from 'd3-transition';
import { BlockMargin, DataRow, Field, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { Dot } from "../../features/lineDots/dot";
import { AreaHelper } from './areaHelper';

select.prototype.transition = transition;

export class Area {
    private static areaChartClass = 'area';

    public static render(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, isSegmented: boolean): void {
        if (isSegmented)
            this.renderSegmented(block, scales, data, keyField, margin, keyAxisOrient, chart, blockSize);
        else
            this.renderGrouped(block, scales, data, keyField, margin, keyAxisOrient, chart, blockSize);
    }

    public static updateAreaChartByValueAxis(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, chart: TwoDimensionalChartModel, keyAxisOrient: Orient, blockSize: Size, isSegmented: boolean): void {
        if (isSegmented) {
            const areaGenerator = AreaHelper.getSegmentedAreaGenerator(keyAxisOrient, scales, margin, keyField.name);
            const areas = block.getChartBlock()
                .selectAll<SVGRectElement, DataRow[]>(`path.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`);

            areas
                .transition()
                .duration(1000)
                .attr('d', d => areaGenerator(d));

            areas.each((d, i) => {
                Dot.updateDotsCoordinateByValueAxis(block, d, keyAxisOrient, scales, margin, keyField.name, '1', chart.cssClasses, i, isSegmented);
            });
        } else {
            chart.data.valueFields.forEach((field, index) => {
                const area = AreaHelper.getGroupedAreaGenerator(keyAxisOrient, scales, margin, keyField.name, field.name, blockSize);

                block.getChartBlock()
                    .select(`.${this.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`)
                    .transition()
                    .duration(1000)
                    .attr('d', area(data));

                Dot.updateDotsCoordinateByValueAxis(block, data, keyAxisOrient, scales, margin, keyField.name, field.name, chart.cssClasses, index, isSegmented);
            });
        }
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
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

            Dot.render(block, data, keyAxisOrient, scales, margin, keyField.name, field.name, chart.cssClasses, index, chart.style.elementColors, blockSize, false);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
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
            Dot.render(block, sd, keyAxisOrient, scales, margin, keyField.name, '1', chart.cssClasses, index, chart.style.elementColors, blockSize, true);
        });
    }

    private static setSegmentColor(segments: Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: Color[]): void {
        segments.style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}