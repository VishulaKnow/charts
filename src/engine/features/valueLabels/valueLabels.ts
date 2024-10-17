import { NamesHelper } from "../../../engine/helpers/namesHelper";
import { Block } from "../../../engine/block/block";
import {
    OptionsModelData,
    Orient,
    TwoDimensionalChartModel,
    ValueLabelAnchor,
    ValueLabelDominantBaseline,
    ValueLabelsFormatter,
} from "../../../model/model";
import { MdtChartsDataRow, MdtChartsDataSource } from "../../../config/config";
import { Scales, ScalesWithSecondary } from "../../../engine/features/scale/scale";
import { ValueLabelsHelper } from "../../../engine/features/valueLabels/valueLabelsHelper";
import { Helper } from "../../../engine/helpers/helper";
import { BaseType, Selection } from "d3-selection";
import { DomHelper } from "../../../engine/helpers/domHelper";
import { CLASSES } from "../../../model/modelBuilder";


export interface ValueLabelsOptions {
    elementAccessors: {
        getBlock: () => Block;
    }
    data: {
        keyFieldName: string;
    }
    canvas: {
        keyAxisOrient: Orient;
    }
}

export interface ValueLabelAttrs {
    x: (data: MdtChartsDataRow) => number;
    y: (data: MdtChartsDataRow) => number;
    textAnchor: ValueLabelAnchor;
    dominantBaseline: ValueLabelDominantBaseline;
}

export class ChartValueLabels {
    private readonly valueLabelClass = NamesHelper.getClassName("value-label");

    constructor(private readonly globalOptions: ValueLabelsOptions, private readonly chart: TwoDimensionalChartModel) { }

    render(scales: Scales, data: MdtChartsDataRow[]) {
        this.chart.data.valueFields.forEach((valueField, vfIndex) => {
            const valueLabels = this.getAllValueLabels(vfIndex)
                .data(data)
                .enter()
                .append('text');
            const attrs = ValueLabelsHelper.getValueLabelsAttrs(this.globalOptions, this.chart.valueLabels, scales, valueField)
            this.setAttrs(valueLabels, attrs, valueField.name, this.chart.valueLabels.format);
            this.setClasses(valueLabels, this.chart.cssClasses, vfIndex)
        })
    }

    update(scales: Scales, newData: MdtChartsDataRow[]) {
        this.chart.data.valueFields.forEach((valueField, vfIndex) => {
            const valueLabels = this.getAllValueLabels(vfIndex)
                .data(newData)
            valueLabels.exit().remove();

            const attrs = ValueLabelsHelper.getValueLabelsAttrs(this.globalOptions, this.chart.valueLabels, scales, valueField)

            const newValueLabels = valueLabels
                .enter()
                .append('text')

            const mergedValueLabels = newValueLabels.merge(valueLabels as Selection<SVGTextElement, MdtChartsDataRow, SVGGElement, unknown>);

            this.setAttrs(newValueLabels, attrs, valueField.name, this.chart.valueLabels.format);
            this.setClasses(mergedValueLabels, this.chart.cssClasses, vfIndex);

            this.setAttrs(valueLabels, attrs, valueField.name, this.chart.valueLabels.format, true)
        })
    }

    private getAllValueLabels(vfIndex: number): Selection<BaseType, unknown, SVGGElement, unknown> {
        const block = this.globalOptions.elementAccessors.getBlock().svg.getChartBlock()
        return block
            .selectAll(`.${this.valueLabelClass}.${CLASSES.dataLabel}${Helper.getCssClassesLine(this.chart.cssClasses)}.chart-element-${vfIndex}`)
    }

    private setAttrs(valueLabels: Selection<SVGTextElement | BaseType, MdtChartsDataRow, BaseType, any>, attrs: ValueLabelAttrs, valueFieldName: string, formatter: ValueLabelsFormatter, animate: boolean = false) {
        const animationName = 'labels-updating';

        valueLabels
            .text(d => formatter(d[valueFieldName]))
            .attr('dominant-baseline', attrs.dominantBaseline)
            .attr('text-anchor', attrs.textAnchor);
        if (animate) {
            valueLabels
                .interrupt(animationName)
                .transition(animationName)
                .duration(this.globalOptions.elementAccessors.getBlock().transitionManager.durations.chartUpdate)
                .attr('x', d => attrs.x(d))
                .attr('y', d => attrs.y(d));
        } else {
            valueLabels
                .attr('x', d => attrs.x(d))
                .attr('y', d => attrs.y(d));
        }
    }

    private setClasses(textLabels: Selection<SVGTextElement, MdtChartsDataRow, BaseType, any>, cssClasses: string[], vfIndex: number): void {
        textLabels.classed(this.valueLabelClass, true);
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

            chartValueLabels.render(chartScales, data[dataOptions.dataSource])
        });
    }

    update(scales: ScalesWithSecondary, charts: TwoDimensionalChartModel[], data: MdtChartsDataSource, dataOptions: OptionsModelData) {
        const chartsWithLabels: TwoDimensionalChartModel[] = charts.filter(chart => chart.valueLabels?.show);
        if (chartsWithLabels.length === 0) return;

        chartsWithLabels.forEach((chart, index) => {
            const chartScales = this.getChartScales(scales, chart);
            this.chartsValueLabels[index].update(chartScales, data[dataOptions.dataSource])
        });
    }

    private getChartScales(scales: ScalesWithSecondary, chart: TwoDimensionalChartModel): Scales {
        return {
            key: scales.key,
            value: chart.data.valueGroup === "secondary" ? scales.valueSecondary : scales.value
        }
    }
}