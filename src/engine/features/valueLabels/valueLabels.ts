import { NamesHelper } from "../../../engine/helpers/namesHelper";
import { Block } from "../../../engine/block/block";
import {
    OptionsModelData,
    Orient,
    TwoDimensionalChartModel,
    TwoDimensionalValueLabels,
    ValueLabelAnchor,
    ValueLabelDominantBaseline,
    ValueLabelsFormatter,
} from "../../../model/model";
import { MdtChartsDataRow, MdtChartsDataSource } from "../../../config/config";
import { Scales, ScalesWithSecondary } from "../../../engine/features/scale/scale";
import { ValueLabelsHelper } from "../../../engine/features/valueLabels/valueLabelsHelper";
import { Helper } from "../../../engine/helpers/helper";
import { BaseType, select, Selection } from "d3-selection";
import { DomHelper } from "../../../engine/helpers/domHelper";
import { CLASSES } from "../../../model/modelBuilder";
import { ValueLabelsCollision } from "../../../engine/features/valueLabelsCollision/valueLabelsCollision";


export interface ValueLabelsOptions {
    elementAccessors: {
        getBlock: () => Block;
    }
    data: {
        keyFieldName: string;
    }
    canvas: {
        keyAxisOrient: Orient;
        valueLabels: TwoDimensionalValueLabels;
    }
}

export interface ValueLabelAttrs {
    x: (data: MdtChartsDataRow) => number;
    y: (data: MdtChartsDataRow) => number;
    textAnchor: ValueLabelAnchor;
    dominantBaseline: ValueLabelDominantBaseline;
}

export class ChartValueLabels {
    private static readonly valueLabelClass = NamesHelper.getClassName("value-label");

    constructor(private readonly globalOptions: ValueLabelsOptions, private readonly chart: TwoDimensionalChartModel) { }

    render(scales: Scales, data: MdtChartsDataRow[]) {
        this.chart.data.valueFields.forEach((valueField, vfIndex) => {
            const valueLabels = this.getAllValueLabelsOfChart(vfIndex)
                .data(data)
                .enter()
                .append('text');

            const attrs = ValueLabelsHelper.getValueLabelsAttrs(this.globalOptions, this.chart.valueLabels, scales, valueField);

            this.setAttrs(valueLabels, attrs, valueField.name, this.chart.valueLabels.format);
            this.setClasses(valueLabels, this.chart.cssClasses, vfIndex);
        });
    }

    update(scales: Scales, newData: MdtChartsDataRow[]) {
        const updatePromises: Promise<void>[] = [];

        this.chart.data.valueFields.forEach((valueField, vfIndex) => {
            const updateProms = new Promise<void>((resolve) => {
                const valueLabels = this.getAllValueLabelsOfChart(vfIndex)
                    .data(newData);
                valueLabels.exit().remove();

                const attrs = ValueLabelsHelper.getValueLabelsAttrs(this.globalOptions, this.chart.valueLabels, scales, valueField);

                const newValueLabels = valueLabels
                    .enter()
                    .append('text');

                const mergedValueLabels = newValueLabels.merge(valueLabels as Selection<SVGTextElement, MdtChartsDataRow, SVGGElement, unknown>);

                this.setAttrs(newValueLabels, attrs, valueField.name, this.chart.valueLabels.format);
                this.setClasses(mergedValueLabels, this.chart.cssClasses, vfIndex);

                this.setAttrs(valueLabels, attrs, valueField.name, this.chart.valueLabels.format, true, resolve);
            });

            updatePromises.push(updateProms);
        });

        return Promise.all(updatePromises)
    }

    static getChartValueLabelsClassName(): string {
        return ChartValueLabels.valueLabelClass;
    }

    private getAllValueLabelsOfChart(vfIndex: number): Selection<BaseType, unknown, SVGGElement, unknown> {
        const block = this.globalOptions.elementAccessors.getBlock().svg.getChartBlock();
        return block
            .selectAll(`.${ChartValueLabels.valueLabelClass}.${CLASSES.dataLabel}${Helper.getCssClassesLine(this.chart.cssClasses)}.chart-element-${vfIndex}`);
    }

    private setAttrs(valueLabels: Selection<SVGTextElement | BaseType, MdtChartsDataRow, BaseType, any>, attrs: ValueLabelAttrs, valueFieldName: string, formatter: ValueLabelsFormatter, animate: boolean = false, onEndAnimation?: () => void) {
        const animationName = 'labels-updating';

        valueLabels
            .text(d => formatter(d[valueFieldName]))
            .attr('dominant-baseline', attrs.dominantBaseline)
            .attr('text-anchor', attrs.textAnchor);
        if (animate) {
            const transition = valueLabels
                .interrupt(animationName)
                .transition(animationName)
                .duration(this.globalOptions.elementAccessors.getBlock().transitionManager.durations.chartUpdate)
                .attr('x', d => attrs.x(d))
                .attr('y', d => attrs.y(d));
            if (onEndAnimation)
                transition.on('end', onEndAnimation);
        } else {
            valueLabels
                .attr('x', d => attrs.x(d))
                .attr('y', d => attrs.y(d));
        }
    }

    private setClasses(textLabels: Selection<SVGTextElement, MdtChartsDataRow, BaseType, any>, cssClasses: string[], vfIndex: number): void {
        textLabels.classed(ChartValueLabels.valueLabelClass, true);
        textLabels.classed(CLASSES.dataLabel, true);
        DomHelper.setCssClasses(textLabels, Helper.getCssClassesWithElementIndex(cssClasses, vfIndex));
    }
}

export class CanvasValueLabels {
    private chartsValueLabels: ChartValueLabels[] = [];

    constructor(private readonly options: ValueLabelsOptions) { }

    render(scales: ScalesWithSecondary, charts: TwoDimensionalChartModel[], data: MdtChartsDataSource, dataOptions: OptionsModelData) {
        const chartsWithLabels: TwoDimensionalChartModel[] = charts.filter(chart => chart.valueLabels?.show);
        if (chartsWithLabels.length === 0) return;

        chartsWithLabels.forEach(chart => {
            const chartScales = this.getChartScales(scales, chart);

            const chartValueLabels = new ChartValueLabels(this.options, chart);
            this.chartsValueLabels.push(chartValueLabels);

            chartValueLabels.render(chartScales, data[dataOptions.dataSource]);
        });

        if (this.options.canvas.valueLabels.collision.mode === 'hide') {
            this.hideValueLabelsCollision();
        }
    }

    update(scales: ScalesWithSecondary, charts: TwoDimensionalChartModel[], data: MdtChartsDataSource, dataOptions: OptionsModelData) {
        const chartsWithLabels: TwoDimensionalChartModel[] = charts.filter(chart => chart.valueLabels?.show);
        if (chartsWithLabels.length === 0) return;

        if (this.options.canvas.valueLabels.collision.mode === 'hide')
            this.toggleOldValueLabelsVisibility();

        const chartsUpdatePromises = chartsWithLabels.map((chart, index) => {
            const chartScales = this.getChartScales(scales, chart);
            return this.chartsValueLabels[index].update(chartScales, data[dataOptions.dataSource]);
        });

        if (this.options.canvas.valueLabels.collision.mode === 'hide') {
            Promise.all(chartsUpdatePromises).then(() => {
                this.hideValueLabelsCollision();
            });
        }
    }

    private toggleOldValueLabelsVisibility() {
        const oldValueLabels = this.getAllValueLabels();

        oldValueLabels.each(function () {
            if (this.style.display === 'none')
                select(this).style('display', 'block');
        })
    }

    private hideValueLabelsCollision(): void {
        const newValueLabels = this.getAllValueLabels();

        const valueLabelElementsRectInfo = ValueLabelsCollision.getValueLabelElementsRectInfo(newValueLabels);
        ValueLabelsCollision.toggleValueLabelElementsVisibility(valueLabelElementsRectInfo);
    }

    private getAllValueLabels(): Selection<SVGTextElement, MdtChartsDataRow, SVGGElement, unknown> {
        const block = this.options.elementAccessors.getBlock().svg.getChartBlock();
        return block
            .selectAll<SVGTextElement, MdtChartsDataRow>(`.${ChartValueLabels.getChartValueLabelsClassName()}`);
    }

    private getChartScales(scales: ScalesWithSecondary, chart: TwoDimensionalChartModel): Scales {
        return {
            key: scales.key,
            value: chart.data.valueGroup === "secondary" ? scales.valueSecondary : scales.value
        }
    }
}