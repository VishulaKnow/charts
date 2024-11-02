import { select, Selection, BaseType } from 'd3-selection';
import { BarChartSettings, BlockMargin, Field, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { EmbeddedLabels } from "../../features/embeddedLabels/embeddedLabels";
import { EmbeddedLabelsHelper } from "../../features/embeddedLabels/embeddedLabelsHelper";
import { BarAttrsHelper, BarHelper, onBarChartInit } from "./barHelper";
import { sum } from "d3-array";
import { Transition } from "d3-transition";
import { DomHelper } from "../../helpers/domHelper";
import { Helper } from "../../helpers/helper";
import { MdtChartsDataRow, Size } from "../../../config/config";
import { getStackedDataWithOwn } from './stackedData/dataStacker';
import { Pipeline } from '../../helpers/pipeline/Pipeline';

export interface RectElemWithAttrs extends SVGElement {
    attrs?: {
        x: number;
        y: number;
        width: number;
        height: number;
        orient: 'vertical' | 'horizontal';
        scaleSize: number;
    }
}

export class Bar {
    public static readonly barItemClass = 'bar-item';

    static get() {
        return new Bar();
    }

    private readonly barItemClass = Bar.barItemClass;
    private readonly barSegmentGroupClass = 'bar-segment-group';

    private createBarPipeline = new Pipeline<Selection<SVGRectElement, any, BaseType, any>, TwoDimensionalChartModel>();

    constructor() {
        onBarChartInit(this.createBarPipeline);
    }

    public render(block: Block, scales: Scales, data: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barSettings: BarChartSettings, barsAmounts: number[], isSegmented: boolean, firstBarIndex: number): void {
        if (isSegmented)
            this.renderSegmented(block, scales, data, keyField, margin, keyAxisOrient, chart, barsAmounts, firstBarIndex, barSettings);
        else
            this.renderGrouped(block, scales, data, keyField, margin, keyAxisOrient, chart, barsAmounts, blockSize, firstBarIndex, barSettings);
    }

    public update(block: Block, newData: MdtChartsDataRow[], scales: Scales, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barsAmounts: number[], keyField: Field, firstBarIndex: number, barSettings: BarChartSettings, isSegmented: boolean): Promise<any>[] {
        let promises: Promise<any>[];
        if (isSegmented) {
            promises = this.updateSegmented(block,
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

    public updateColors(block: Block, chart: TwoDimensionalChartModel): void {
        chart.data.valueFields.forEach((_vf, index) => {
            const bars = block.svg.getChartGroup(chart.index)
                .selectAll(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}${Helper.getCssClassesLine(Helper.getCssClassesWithElementIndex(chart.cssClasses, index))}`);
            DomHelper.setChartStyle(bars, chart.style, index, 'fill');
        });
    }

    public getAllBarsForChart(block: Block, chartCssClasses: string[]): Selection<BaseType, MdtChartsDataRow, BaseType, unknown> {
        return block.getSvg().selectAll(`rect.${this.barItemClass}${Helper.getCssClassesLine(chartCssClasses)}`);
    }

    private renderGrouped(block: Block, scales: Scales, data: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, barsAmounts: number[], blockSize: Size, firstBarIndex: number, barSettings: BarChartSettings): void {
        chart.data.valueFields.forEach((field, index) => {
            let bars = block.svg.getChartGroup(chart.index)
                .selectAll(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}${Helper.getCssClassesLine(Helper.getCssClassesWithElementIndex(chart.cssClasses, index))}`)
                .data(data)
                .enter()
                .append('rect')
                .attr('class', this.barItemClass)
                .style('clip-path', `url(#${block.svg.getClipPathId()})`);

            bars = this.createBarPipeline.execute(bars, chart);

            const barAttrs = BarHelper.getGroupedBarAttrs(keyAxisOrient,
                scales,
                margin,
                keyField.name,
                field.name,
                BarHelper.getBarIndex(barsAmounts, chart.index - firstBarIndex) + index,
                sum(barsAmounts),
                barSettings);

            this.fillBarAttrs(bars, barAttrs);

            DomHelper.setCssClasses(bars, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            DomHelper.setChartStyle(bars, chart.style, index, 'fill');

            this.setInitialAttrsInfo(bars, keyAxisOrient, barSettings);

            if (chart.embeddedLabels !== 'none')
                EmbeddedLabels.render(block, bars, barAttrs, EmbeddedLabelsHelper.getLabelField(chart.embeddedLabels, chart.data.valueFields, keyField, index), chart.embeddedLabels, keyAxisOrient, blockSize, margin, index, chart.cssClasses);
        });
    }

    private renderSegmented(block: Block, scales: Scales, data: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, barsAmounts: number[], firstBarIndex: number, barSettings: BarChartSettings): void {
        const stackedData = getStackedDataWithOwn(data, chart.data.valueFields.map(field => field.name));

        let groups = block.svg.getChartGroup(chart.index)
            .selectAll<SVGGElement, MdtChartsDataRow>(`g.${this.barSegmentGroupClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData);

        if (groups.empty())
            groups = groups
                .data(stackedData)
                .enter()
                .append<SVGGElement>('g')
                .attr('class', this.barSegmentGroupClass);

        let bars = groups
            .selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(d => d)
            .enter()
            .append('rect')
            .attr('class', this.barItemClass)
            .style('clip-path', `url(#${block.svg.getClipPathId()})`);

        bars = this.createBarPipeline.execute(bars, chart);

        const barAttrs = BarHelper.getStackedBarAttr(keyAxisOrient,
            scales,
            margin,
            keyField.name,
            BarHelper.getBarIndex(barsAmounts, chart.index) - firstBarIndex,
            sum(barsAmounts),
            barSettings);

        this.fillBarAttrs(bars, barAttrs);

        this.setInitialAttrsInfo(bars, keyAxisOrient, barSettings);

        DomHelper.setCssClasses(groups, chart.cssClasses);
        DomHelper.setCssClasses(bars, chart.cssClasses); // Для обозначения принадлежности бара к конкретному чарту

        const thisClass = this;
        groups.each(function (d, i) {
            DomHelper.setCssClasses(select(this).selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`), Helper.getCssClassesWithElementIndex(chart.cssClasses, i)); // Для обозначения принадлежности бара к конкретной части стака
            thisClass.setSegmentColor(select(this).selectAll(Helper.getCssClassesLine(chart.cssClasses)), chart.style.elementColors, i);
        });
    }

    private updateGrouped(block: Block, newData: MdtChartsDataRow[], scales: Scales, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barsAmounts: number[], keyField: Field, firstBarIndex: number, barSettings: BarChartSettings): Promise<any>[] {
        const promises: Promise<any>[] = [];
        chart.data.valueFields.forEach((valueField, index) => {
            const indexesOfRemoved: number[] = [];

            block.svg.getChartGroup(chart.index)
                .selectAll<SVGRectElement, MdtChartsDataRow>(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`)
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

            const bars = block.svg.getChartGroup(chart.index)
                .selectAll<SVGRectElement, MdtChartsDataRow>(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`)
                .filter(d => newData.findIndex(row => row[keyField.name] === d[keyField.name]) !== -1)
                .style('opacity', 1)
                .data(newData);

            let newBars = bars
                .enter()
                .append('rect')
                .attr('class', this.barItemClass)
                .style('clip-path', `url(#${block.svg.getClipPathId()})`);

            newBars = this.createBarPipeline.execute(newBars, chart);

            const barAttrs = BarHelper.getGroupedBarAttrs(keyAxisOrient,
                scales,
                margin,
                keyField.name,
                valueField.name,
                BarHelper.getBarIndex(barsAmounts, chart.index) + index - firstBarIndex,
                sum(barsAmounts),
                barSettings);

            const prom = this.fillBarAttrs(bars, barAttrs, block.transitionManager.durations.chartUpdate)
                .then(() => {
                    bars.style('opacity', null);
                    this.setInitialAttrsInfo(bars, keyAxisOrient, barSettings);
                });
            this.fillBarAttrs(newBars, barAttrs);
            promises.push(prom);

            this.setInitialAttrsInfo(newBars, keyAxisOrient, barSettings);

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

    private updateSegmented(block: Block, newData: MdtChartsDataRow[], scales: Scales, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barsAmounts: number[], keyField: Field, firstBarIndex: number, barSettings: BarChartSettings): Promise<any>[] {
        const stackedData = getStackedDataWithOwn(newData, chart.data.valueFields.map(field => field.name));

        block.svg.getChartGroup(chart.index)
            .selectAll<SVGRectElement, MdtChartsDataRow>(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .filter(d => newData.findIndex(row => row[keyField.name] === d.data[keyField.name]) === -1)
            .transition()
            .duration(block.transitionManager.durations.elementFadeOut)
            .style('opacity', 0)
            .remove();

        const groups = block.svg.getChartGroup(chart.index)
            .selectAll(`g.${this.barSegmentGroupClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData);

        const bars = groups
            .selectAll<SVGRectElement, MdtChartsDataRow>(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .filter(d => newData.findIndex(row => row[keyField.name] === d.data[keyField.name]) !== -1)
            .style('opacity', 1)
            .data(d => d);

        let newBars = bars.enter()
            .append('rect')
            .attr('class', this.barItemClass)
            .style('clip-path', `url(#${block.svg.getClipPathId()})`);

        newBars = this.createBarPipeline.execute(newBars, chart);

        const barAttrs = BarHelper.getStackedBarAttr(keyAxisOrient,
            scales,
            margin,
            keyField.name,
            BarHelper.getBarIndex(barsAmounts, chart.index) - firstBarIndex,
            sum(barsAmounts),
            barSettings);

        const prom = this.fillBarAttrs(bars, barAttrs, block.transitionManager.durations.chartUpdate)
            .then(() => {
                this.setInitialAttrsInfo(bars, keyAxisOrient, barSettings);
                bars.style('opacity', null);
            });
        this.fillBarAttrs(newBars, barAttrs);

        this.setInitialAttrsInfo(newBars, keyAxisOrient, barSettings);

        DomHelper.setCssClasses(newBars, chart.cssClasses);

        const thisClass = this;
        groups.each(function (d, i) {
            DomHelper.setCssClasses(select(this).selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`), Helper.getCssClassesWithElementIndex(chart.cssClasses, i)); // Для обозначения принадлежности бара к конкретной части стака
            thisClass.setSegmentColor(select(this).selectAll(Helper.getCssClassesLine(chart.cssClasses)), chart.style.elementColors, i);
        });

        return [prom];
    }

    private fillBarAttrs(bars: Selection<SVGRectElement, MdtChartsDataRow, BaseType, unknown>, barAttrs: BarAttrsHelper, transitionDuration: number = 0): Promise<any> {
        return new Promise((resolve) => {
            if (bars.size() === 0) {
                resolve('');
                return;
            }

            let barsHandler: Selection<SVGRectElement, MdtChartsDataRow, BaseType, unknown> | Transition<SVGRectElement, MdtChartsDataRow, BaseType, unknown> = bars;
            if (transitionDuration > 0) {
                barsHandler = barsHandler
                    .interrupt()
                    .transition()
                    .duration(transitionDuration)
                    .on('end', () => resolve(''));
            }

            barsHandler.attr('x', d => barAttrs.x(d))
                .attr('y', d => barAttrs.y(d))
                .attr('height', d => barAttrs.height(d))
                .attr('width', d => barAttrs.width(d));
            if (transitionDuration <= 0)
                resolve('');
        });
    }

    private setSegmentColor(segments: Selection<SVGGElement, any, BaseType, unknown>, colorPalette: string[], segmentedIndex: number): void {
        segments.style('fill', colorPalette[segmentedIndex % colorPalette.length]);
    }

    /**
     * Устнановка координат для удобного обновления.
     */
    private setInitialAttrsInfo(bars: Selection<SVGRectElement, any, BaseType, any>, keyAxisOrient: Orient, barSettings: BarChartSettings): void {
        bars.each(function () {
            const width = DomHelper.getSelectionNumericAttr(select(this), 'width');
            const height = DomHelper.getSelectionNumericAttr(select(this), 'height');
            const orient = keyAxisOrient === 'left' || keyAxisOrient === 'right' ? 'horizontal' : 'vertical';
            let scaleSize = 0.06 * (orient === 'vertical' ? width : height);
            scaleSize = scaleSize > barSettings.barDistance / 2 ? barSettings.barDistance / 2 : scaleSize;

            (this as RectElemWithAttrs).attrs = {
                x: DomHelper.getSelectionNumericAttr(select(this), 'x'),
                y: DomHelper.getSelectionNumericAttr(select(this), 'y'),
                width,
                height,
                orient,
                scaleSize
            }
        });
    }
}