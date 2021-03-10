import { Color } from "d3-color";
import { stack } from 'd3-shape';
import { select, Selection, BaseType } from 'd3-selection';
import { AxisScale } from 'd3-axis'
import { BarChartSettings, BlockMargin, DataRow, Field, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { ValueFormatter } from "../../valueFormatter";
import { Helper } from "../../helper";
import { Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { EmbeddedLabels } from "../../features/embeddedLabels/embeddedLabels";
import { EmbeddedLabelsHelper } from "../../features/embeddedLabels/embeddedLabelsHelper";
import { BarAttrsHelper, BarHelper } from "./barHelper";
import { sum } from "d3-array";
import { Transition } from "d3-transition";

export class Bar {
    public static barItemClass = 'bar-item';
    private static barSegmentGroupClass = 'bar-segment-group';

    public static render(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barSettings: BarChartSettings, barsAmounts: number[], isSegmented: boolean, firstBarIndex: number): void {
        if (isSegmented)
            this.renderSegmented(block, scales, data, keyField, margin, keyAxisOrient, chart, barsAmounts, blockSize, firstBarIndex, barSettings);
        else
            this.renderGrouped(block, scales, data, keyField, margin, keyAxisOrient, chart, barsAmounts, blockSize, firstBarIndex, barSettings);
    }

    public static updateBarChartByValueAxis(block: Block, newData: DataRow[], scales: Scales, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, isSegmented: boolean): void {
        if (isSegmented) {
            const keys = chart.data.valueFields.map(field => field.name);
            const stackedData = stack().keys(keys)(newData);

            const bars = block.getChartBlock()
                .selectAll(`g.${this.barSegmentGroupClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
                .data(stackedData)
                .selectAll<SVGRectElement, DataRow>(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
                .data(d => d);

            this.updateStackedBarAttrs(bars,
                keyAxisOrient,
                scales.scaleValue,
                margin,
                blockSize,
                block.transitionManager.updateChartsDuration);
        } else {
            chart.data.valueFields.forEach((field, index) => {
                const bars = block.getChartBlock()
                    .selectAll<SVGRectElement, DataRow>(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`);

                this.updateGroupedBarAttrs(bars,
                    keyAxisOrient,
                    scales.scaleValue,
                    margin,
                    field.name,
                    blockSize,
                    newData,
                    block.transitionManager.updateChartsDuration);

                if (chart.embeddedLabels !== 'none') {
                    const labelsGroup = block.getChartBlock()
                        .selectAll<SVGGElement, unknown>(`.${EmbeddedLabels.embeddedLabelsGroupClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`);
                    EmbeddedLabels.updateLabelsCoordinate(bars,
                        labelsGroup,
                        keyAxisOrient,
                        scales.scaleValue,
                        margin,
                        field,
                        chart.embeddedLabels,
                        blockSize,
                        newData,
                        block.transitionManager.updateChartsDuration);
                }
            })
        }
    }


    public static getAllBarItems(block: Block, chartCssClasses: string[]): Selection<BaseType, DataRow, BaseType, unknown> {
        return block.getSvg().selectAll(`rect.${this.barItemClass}${Helper.getCssClassesLine(chartCssClasses)}`);
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, barsAmounts: number[], blockSize: Size, firstBarIndex: number, barSettings: BarChartSettings): void {
        this.renderBarGroups(block, data);
        chart.data.valueFields.forEach((field, index) => {
            const bars = block.getChartBlock()
                .selectAll('.bar-group')
                .data(data)
                .append('rect')
                .attr('class', this.barItemClass)
                .style('clip-path', `url(#${block.getClipPathId()})`);

            const barAttrs = BarHelper.getGroupedBarAttrs(keyAxisOrient,
                scales,
                margin,
                keyField.name,
                field.name,
                blockSize,
                BarHelper.getBarIndex(barsAmounts, chart.index) + index - firstBarIndex,
                sum(barsAmounts),
                barSettings);

            this.fillBarAttrs(bars, barAttrs);

            Helper.setCssClasses(bars, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            Helper.setChartStyle(bars, chart.style, index, 'fill');

            if (chart.embeddedLabels !== 'none')
                EmbeddedLabels.render(block, bars, EmbeddedLabelsHelper.getLabelField(chart.embeddedLabels, chart.data.valueFields, keyField, index), chart.embeddedLabels, keyAxisOrient, blockSize, margin, index, chart.cssClasses);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, barsAmounts: number[], blockSize: Size, firstBarIndex: number, barSettings: BarChartSettings): void {
        const keys = chart.data.valueFields.map(field => field.name);
        const stackedData = stack().keys(keys)(data);

        let groups = block.getChartBlock()
            .selectAll<SVGGElement, DataRow>(`g.${this.barSegmentGroupClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData);

        if (groups.empty())
            groups = groups
                .data(stackedData)
                .enter()
                .append<SVGGElement>('g')
                .attr('class', this.barSegmentGroupClass);

        const bars = groups
            .selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(d => d)
            .enter()
            .append('rect')
            .attr('class', this.barItemClass)
            .style('clip-path', `url(#${block.getClipPathId()})`);

        const barAttrs = BarHelper.getStackedBarAttr(keyAxisOrient,
            scales,
            margin,
            keyField.name,
            blockSize,
            BarHelper.getBarIndex(barsAmounts, chart.index) - firstBarIndex,
            sum(barsAmounts),
            barSettings);

        this.fillBarAttrs(bars, barAttrs);

        Helper.setCssClasses(groups, chart.cssClasses);
        Helper.setCssClasses(bars, chart.cssClasses); // Для обозначения принадлежности бара к конкретному чарту

        const thisClass = this;
        groups.each(function (d, i) {
            Helper.setCssClasses(select(this).selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`), Helper.getCssClassesWithElementIndex(chart.cssClasses, i)); // Для обозначения принадлежности бара к конкретной части стака
            thisClass.setSegmentColor(select(this).selectAll(Helper.getCssClassesLine(chart.cssClasses)), chart.style.elementColors, i);
        });
    }

    private static renderBarGroups(block: Block, data: DataRow[]): void {
        let groups = block.getChartBlock()
            .selectAll('.bar-group');

        if (groups.empty())
            groups = block.getChartBlock()
                .selectAll('.bar-group')
                .data(data)
                .enter()
                .append('g')
                .attr('class', 'bar-group');
    }

    private static fillBarAttrs(bars: Selection<SVGRectElement, DataRow, BaseType, unknown>, barAttrs: BarAttrsHelper): void {
        bars.attr('x', d => barAttrs.x(d))
            .attr('y', d => barAttrs.y(d))
            .attr('height', d => barAttrs.height(d))
            .attr('width', d => barAttrs.width(d));
    }

    private static updateGroupedBarAttrs(bars: Selection<SVGRectElement, DataRow, BaseType, unknown>, axisOrient: Orient, scaleValue: AxisScale<any>, margin: BlockMargin, valueField: string, blockSize: Size, newData: DataRow[], transitionDuration: number = 0): void {
        const barAttrs: BarAttrsHelper = {
            x: null,
            y: null,
            width: null,
            height: null
        }

        BarHelper.setGroupedBarAttrsByValueAxis(barAttrs, axisOrient, margin, scaleValue, valueField, blockSize);

        let barsTran: Selection<SVGRectElement, DataRow, BaseType, unknown> | Transition<SVGRectElement, DataRow, BaseType, unknown> = bars;
        if (transitionDuration > 0)
            barsTran = bars
                .data(newData)
                .interrupt()
                .transition()
                .duration(transitionDuration);

        if (axisOrient === 'top' || axisOrient === 'bottom')
            barsTran
                .attr('y', d => barAttrs.y(d))
                .attr('height', d => barAttrs.height(d));
        else if (axisOrient === 'left' || axisOrient === 'right')
            barsTran
                .attr('x', d => barAttrs.x(d))
                .attr('width', d => barAttrs.width(d));
    }

    private static updateStackedBarAttrs(bars: Selection<SVGRectElement, DataRow, BaseType, unknown>, axisOrient: string, scaleValue: AxisScale<any>, margin: BlockMargin, blockSize: Size, transitionDuration: number = 0): void {
        let barsSelection: Selection<SVGRectElement, DataRow, BaseType, unknown> | Transition<SVGRectElement, DataRow, BaseType, unknown> = bars;

        if (transitionDuration > 0)
            barsSelection = bars
                .interrupt()
                .transition()
                .duration(transitionDuration);

        if (axisOrient === 'top') {
            barsSelection
                .attr('y', d => margin.top + scaleValue(d[0]))
                .attr('height', d => ValueFormatter.getValueOrZero(scaleValue(d[1] - d[0])));
        }
        if (axisOrient === 'bottom') {
            barsSelection
                .attr('y', d => margin.top + scaleValue(d[1]))
                .attr('height', d => blockSize.height - margin.top - margin.bottom - scaleValue(d[1] - d[0]));
        }
        if (axisOrient === 'left') {
            barsSelection
                .attr('x', d => margin.left + scaleValue(d[0]) + 1) // 1px - ось
                .attr('width', d => ValueFormatter.getValueOrZero(scaleValue(d[1] - d[0])));
        }
        if (axisOrient === 'right') {
            barsSelection
                .attr('x', d => margin.left + scaleValue(d[1]))
                .attr('width', d => ValueFormatter.getValueOrZero(blockSize.width - margin.left - margin.right - scaleValue(d[1] - d[0])));
        }
    }

    private static setSegmentColor(segments: Selection<SVGGElement, any, SVGGElement, unknown>, colorPalette: Color[], segmentedIndex: number): void {
        segments.style('fill', colorPalette[segmentedIndex % colorPalette.length].toString());
    }
}