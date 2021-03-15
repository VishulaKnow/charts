import { Color } from "d3-color";
import { stack } from 'd3-shape';
import { select, Selection, BaseType } from 'd3-selection';
import { BarChartSettings, BlockMargin, DataRow, Field, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
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

    public static update(block: Block, newData: DataRow[], scales: Scales, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barsAmounts: number[], keyField: Field, firstBarIndex: number, barSettings: BarChartSettings, isSegmented: boolean): void {
        if (isSegmented) {
            this.updateDataForSegmented(block,
                newData,
                scales,
                margin,
                keyAxisOrient,
                chart,
                blockSize,
                barsAmounts,
                keyField,
                firstBarIndex,
                barSettings);
        } else {
            this.updateDataForGrouped(block,
                newData,
                scales,
                margin,
                keyAxisOrient,
                chart,
                blockSize,
                barsAmounts,
                keyField,
                firstBarIndex,
                barSettings);
        }
    }

    public static getAllBarItems(block: Block, chartCssClasses: string[]): Selection<BaseType, DataRow, BaseType, unknown> {
        return block.getSvg().selectAll(`rect.${this.barItemClass}${Helper.getCssClassesLine(chartCssClasses)}`);
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, barsAmounts: number[], blockSize: Size, firstBarIndex: number, barSettings: BarChartSettings): void {
        chart.data.valueFields.forEach((field, index) => {
            const bars = block.getChartGroup(chart.index)
                .selectAll(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}${Helper.getCssClassesLine(Helper.getCssClassesWithElementIndex(chart.cssClasses, index))}`)
                .data(data)
                .enter()
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
                EmbeddedLabels.render(block, bars, barAttrs, EmbeddedLabelsHelper.getLabelField(chart.embeddedLabels, chart.data.valueFields, keyField, index), chart.embeddedLabels, keyAxisOrient, blockSize, margin, index, chart.cssClasses);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, barsAmounts: number[], blockSize: Size, firstBarIndex: number, barSettings: BarChartSettings): void {
        const keys = chart.data.valueFields.map(field => field.name);
        const stackedData = stack().keys(keys)(data);

        let groups = block.getChartGroup(chart.index)
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

    private static updateDataForGrouped(block: Block, newData: DataRow[], scales: Scales, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barsAmounts: number[], keyField: Field, firstBarIndex: number, barSettings: BarChartSettings): void {
        chart.data.valueFields.forEach((valueField, index) => {
            const indexesOfRemoved: number[] = [];

            block.getChartGroup(chart.index)
                .selectAll<SVGRectElement, DataRow>(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`)
                .filter((d, i) => {
                    if (newData.findIndex(row => row[keyField.name] === d[keyField.name]) === -1) {
                        indexesOfRemoved.push(i);
                        return true;
                    }
                    return false;
                })
                // .transition()
                // .duration(block.transitionManager.durations.elementFadeOut)
                // .style('opacity', 0)
                .remove();

            const bars = block.getChartGroup(chart.index)
                .selectAll<SVGRectElement, DataRow>(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`)
                .filter(d => newData.findIndex(row => row[keyField.name] === d[keyField.name]) !== -1)
                .style('opacity', 1)
                .data(newData);

            const newBars = bars
                .enter()
                .append('rect')
                .attr('class', this.barItemClass)
                .style('clip-path', `url(#${block.getClipPathId()})`);

            const barAttrs = BarHelper.getGroupedBarAttrs(keyAxisOrient,
                scales,
                margin,
                keyField.name,
                valueField.name,
                blockSize,
                BarHelper.getBarIndex(barsAmounts, chart.index) + index - firstBarIndex,
                sum(barsAmounts),
                barSettings);

            this.fillBarAttrs(bars, barAttrs, block.transitionManager.durations.chartUpdate);
            this.fillBarAttrs(newBars, barAttrs);

            Helper.setCssClasses(newBars, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            Helper.setChartStyle(newBars, chart.style, index, 'fill');

            if (chart.embeddedLabels !== 'none') {
                EmbeddedLabels.removeUnused(block, chart.cssClasses, index, newData, keyField.name);
                EmbeddedLabels.update(block,
                    bars,
                    keyAxisOrient,
                    barAttrs,
                    margin,
                    valueField,
                    chart.embeddedLabels,
                    blockSize,
                    newData,
                    index,
                    chart.cssClasses);
                if (!newBars.empty())
                    EmbeddedLabels.render(block, newBars, barAttrs, valueField, chart.embeddedLabels, keyAxisOrient, blockSize, margin, index, chart.cssClasses);
            }
        });
    }

    private static updateDataForSegmented(block: Block, newData: DataRow[], scales: Scales, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barsAmounts: number[], keyField: Field, firstBarIndex: number, barSettings: BarChartSettings): void {
        const keys = chart.data.valueFields.map(field => field.name);
        const stackedData = stack().keys(keys)(newData);

        block.getChartGroup(chart.index)
            .selectAll<SVGRectElement, DataRow>(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .filter(d => newData.findIndex(row => row[keyField.name] === d.data[keyField.name]) === -1)
            .transition()
            .duration(block.transitionManager.durations.elementFadeOut)
            .style('opacity', 0)
            .remove();

        const groups = block.getChartGroup(chart.index)
            .selectAll(`g.${this.barSegmentGroupClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData);

        const bars = groups
            .selectAll<SVGRectElement, DataRow>(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .filter(d => newData.findIndex(row => row[keyField.name] === d.data[keyField.name]) !== -1)
            .style('opacity', 1)
            .data(d => d);

        const newBars = bars.enter()
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

        this.fillBarAttrs(bars, barAttrs, block.transitionManager.durations.chartUpdate);
        this.fillBarAttrs(newBars, barAttrs);

        Helper.setCssClasses(newBars, chart.cssClasses);

        const thisClass = this;

        groups.each(function (d, i) {
            Helper.setCssClasses(select(this).selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`), Helper.getCssClassesWithElementIndex(chart.cssClasses, i)); // Для обозначения принадлежности бара к конкретной части стака
            thisClass.setSegmentColor(select(this).selectAll(Helper.getCssClassesLine(chart.cssClasses)), chart.style.elementColors, i);
        });
    }

    private static fillBarAttrs(bars: Selection<SVGRectElement, DataRow, BaseType, unknown>, barAttrs: BarAttrsHelper, transitionDuration: number = 0): Selection<SVGRectElement, DataRow, BaseType, unknown> | Transition<SVGRectElement, DataRow, BaseType, unknown> {
        let barsHander: Selection<SVGRectElement, DataRow, BaseType, unknown> | Transition<SVGRectElement, DataRow, BaseType, unknown> = bars;
        if (transitionDuration > 0) {
            barsHander = barsHander
                .interrupt()
                .transition()
                .duration(transitionDuration);
        }

        barsHander.attr('x', d => barAttrs.x(d))
            .attr('y', d => barAttrs.y(d))
            .attr('height', d => barAttrs.height(d))
            .attr('width', d => barAttrs.width(d));

        return barsHander;
    }

    private static setSegmentColor(segments: Selection<SVGGElement, any, BaseType, unknown>, colorPalette: Color[], segmentedIndex: number): void {
        segments.style('fill', colorPalette[segmentedIndex % colorPalette.length].toString());
    }
}