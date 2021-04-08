
import { stack } from 'd3-shape';
import { select, Selection, BaseType } from 'd3-selection';
import { BarChartSettings, BlockMargin, Field, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { EmbeddedLabels } from "../../features/embeddedLabels/embeddedLabels";
import { EmbeddedLabelsHelper } from "../../features/embeddedLabels/embeddedLabelsHelper";
import { BarAttrsHelper, BarHelper } from "./barHelper";
import { sum } from "d3-array";
import { Transition } from "d3-transition";
import { DomHelper } from "../../helpers/domHelper";
import { Helper } from "../../helpers/helper";
import { DataRow, Size } from "../../../config/config";

export interface SVGElemWithAttrs extends SVGElement {
    attrs?: {
        x: number;
        y: number;
        width: number;
        height: number;
        orient: 'vertical' | 'horizontal';
    }
}

export class Bar {
    public static readonly barItemClass = 'bar-item';
    public static readonly barItemCloneClass = 'bar-item-clone';

    private static readonly barSegmentGroupClass = 'bar-segment-group';

    public static render(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barSettings: BarChartSettings, barsAmounts: number[], isSegmented: boolean, firstBarIndex: number): void {
        if (isSegmented)
            this.renderSegmented(block, scales, data, keyField, margin, keyAxisOrient, chart, barsAmounts, blockSize, firstBarIndex, barSettings);
        else
            this.renderGrouped(block, scales, data, keyField, margin, keyAxisOrient, chart, barsAmounts, blockSize, firstBarIndex, barSettings);
    }

    public static update(block: Block, newData: DataRow[], scales: Scales, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barsAmounts: number[], keyField: Field, firstBarIndex: number, barSettings: BarChartSettings, isSegmented: boolean): Promise<any>[] {
        let promises: Promise<any>[];
        if (isSegmented) {
            this.updateSegmented(block,
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
            promises = this.updateGrouped(block,
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
        return promises;
    }

    public static updateColors(block: Block, chart: TwoDimensionalChartModel): void {
        chart.data.valueFields.forEach((_vf, index) => {
            const bars = block.getChartGroup(chart.index)
                .selectAll(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}${Helper.getCssClassesLine(Helper.getCssClassesWithElementIndex(chart.cssClasses, index))}`);
            DomHelper.setChartStyle(bars, chart.style, index, 'fill');
        });
    }

    public static getAllBarsForChart(block: Block, chartCssClasses: string[]): Selection<BaseType, DataRow, BaseType, unknown> {
        return block.getSvg().selectAll(`rect.${this.barItemClass}${Helper.getCssClassesLine(chartCssClasses)}`);
    }

    public static getAllBarClones(block: Block): Selection<BaseType, DataRow, BaseType, unknown> {
        return block.getChartBlock().selectAll(`.${this.barItemCloneClass}`);
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

            DomHelper.setCssClasses(bars, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            DomHelper.setChartStyle(bars, chart.style, index, 'fill');

            this.setInitialAttrsInfo(bars, keyAxisOrient);

            if (chart.embeddedLabels !== 'none')
                EmbeddedLabels.render(block, bars, barAttrs, EmbeddedLabelsHelper.getLabelField(chart.embeddedLabels, chart.data.valueFields, keyField, index), chart.embeddedLabels, keyAxisOrient, blockSize, margin, index, chart.cssClasses);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, barsAmounts: number[], blockSize: Size, firstBarIndex: number, barSettings: BarChartSettings): void {
        const stackedData = stack().keys(chart.data.valueFields.map(field => field.name))(data);

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

        DomHelper.setCssClasses(groups, chart.cssClasses);
        DomHelper.setCssClasses(bars, chart.cssClasses); // Для обозначения принадлежности бара к конкретному чарту

        const thisClass = this;
        groups.each(function (d, i) {
            DomHelper.setCssClasses(select(this).selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`), Helper.getCssClassesWithElementIndex(chart.cssClasses, i)); // Для обозначения принадлежности бара к конкретной части стака
            thisClass.setSegmentColor(select(this).selectAll(Helper.getCssClassesLine(chart.cssClasses)), chart.style.elementColors, i);
        });
    }

    private static updateGrouped(block: Block, newData: DataRow[], scales: Scales, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barsAmounts: number[], keyField: Field, firstBarIndex: number, barSettings: BarChartSettings): Promise<any>[] {
        const promises: Promise<any>[] = [];
        chart.data.valueFields.forEach((valueField, index) => {
            const indexesOfRemoved: number[] = [];

            block.getChartGroup(chart.index)
                .selectAll<SVGRectElement, DataRow>(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`)
                .filter((d, i) => {
                    if (newData.findIndex(row => row[keyField.name] === d[keyField.name]) === -1) {
                        indexesOfRemoved.push(i); // Набор индексов для встроенных лейблов
                        return true;
                    }
                    return false;
                })
                .transition()
                .duration(block.transitionManager.durations.elementFadeOut)
                .style('opacity', 0)
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

            const prom = this.fillBarAttrs(bars, barAttrs, block.transitionManager.durations.chartUpdate)
                .then(() => this.setInitialAttrsInfo(bars, keyAxisOrient));
            this.fillBarAttrs(newBars, barAttrs);
            promises.push(prom);

            this.setInitialAttrsInfo(newBars, keyAxisOrient);

            DomHelper.setCssClasses(newBars, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            DomHelper.setChartStyle(newBars, chart.style, index, 'fill');

            if (chart.embeddedLabels !== 'none') {
                EmbeddedLabels.removeUnused(block, chart.cssClasses, index, indexesOfRemoved);
                EmbeddedLabels.update(block, bars, keyAxisOrient, barAttrs, margin, valueField, chart.embeddedLabels, blockSize, newData, index, chart.cssClasses);
                if (!newBars.empty())
                    EmbeddedLabels.render(block, newBars, barAttrs, valueField, chart.embeddedLabels, keyAxisOrient, blockSize, margin, index, chart.cssClasses);
                EmbeddedLabels.restoreRemoved(block, bars, barAttrs, valueField, chart.embeddedLabels, keyAxisOrient, blockSize, margin, index, chart.cssClasses, keyField.name);
            }
        });
        return promises;
    }

    private static updateSegmented(block: Block, newData: DataRow[], scales: Scales, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barsAmounts: number[], keyField: Field, firstBarIndex: number, barSettings: BarChartSettings): void {
        const stackedData = stack().keys(chart.data.valueFields.map(field => field.name))(newData);

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

        DomHelper.setCssClasses(newBars, chart.cssClasses);

        const thisClass = this;

        groups.each(function (d, i) {
            DomHelper.setCssClasses(select(this).selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`), Helper.getCssClassesWithElementIndex(chart.cssClasses, i)); // Для обозначения принадлежности бара к конкретной части стака
            thisClass.setSegmentColor(select(this).selectAll(Helper.getCssClassesLine(chart.cssClasses)), chart.style.elementColors, i);
        });
    }

    private static fillBarAttrs(bars: Selection<SVGRectElement, DataRow, BaseType, unknown>, barAttrs: BarAttrsHelper, transitionDuration: number = 0): Promise<any> {
        return new Promise((resolve) => {
            let barsHander: Selection<SVGRectElement, DataRow, BaseType, unknown> | Transition<SVGRectElement, DataRow, BaseType, unknown> = bars;
            if (transitionDuration > 0) {
                barsHander = barsHander
                    .interrupt()
                    .transition()
                    .duration(transitionDuration)
                    .on('end', () => resolve(''));
            }

            barsHander.attr('x', d => barAttrs.x(d))
                .attr('y', d => barAttrs.y(d))
                .attr('height', d => barAttrs.height(d))
                .attr('width', d => barAttrs.width(d));
            if (transitionDuration <= 0)
                resolve('');
        });
    }

    private static setInitialAttrsInfo(bars: Selection<SVGRectElement, DataRow, SVGGElement, any>, keyAxisOrient: Orient): void {
        bars.each(function () {
            (this as SVGElemWithAttrs).attrs = {
                x: DomHelper.getSelectionNumericAttr(select(this), 'x'),
                y: DomHelper.getSelectionNumericAttr(select(this), 'y'),
                width: DomHelper.getSelectionNumericAttr(select(this), 'width'),
                height: DomHelper.getSelectionNumericAttr(select(this), 'height'),
                orient: keyAxisOrient === 'left' || keyAxisOrient === 'right' ? 'horizontal' : 'vertical'
            }
        });
    }

    private static setSegmentColor(segments: Selection<SVGGElement, any, BaseType, unknown>, colorPalette: string[], segmentedIndex: number): void {
        segments.style('fill', colorPalette[segmentedIndex % colorPalette.length]);
    }
}