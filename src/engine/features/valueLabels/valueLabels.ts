import { NamesHelper } from "../../../engine/helpers/namesHelper";
import { Block } from "../../../engine/block/block";
import {
    OptionsModelData,
    Orient,
    TwoDimensionalChartModel,
    ValueLabelAnchor, ValueLabelDominantBaseline
} from "../../../model/model";
import { MdtChartsDataRow, MdtChartsDataSource } from "../../../config/config";
import { Scales, ScalesWithSecondary} from "../../../engine/features/scale/scale";
import { ValueLabelsHelper } from "../../../engine/features/valueLabels/valueLabelsHelper";
import { Helper } from "../../../engine/helpers/helper";
import { BaseType, Selection } from "d3-selection";
import { DomHelper } from "../../../engine/helpers/domHelper";
import { CLASSES } from "../../../model/modelBuilder";


type CanvasValueLabelsAction = 'render' | 'update';
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
        const textLabels = this.getAllValueLabels()
            .data(data)
            .enter()
            .append('text');

        const attrs = ValueLabelsHelper.getValueLabelsAttrs(this.globalOptions, this.chart, scales)

        this.setAttrs(textLabels, attrs);
        this.setClasses(textLabels, this.chart.cssClasses, this.chart.index)
    }

    update(scales: Scales, newData: MdtChartsDataRow[]) {
        const valueLabels = this.getAllValueLabels()
            .data(newData)
        valueLabels.exit().remove();

        const attrs = ValueLabelsHelper.getValueLabelsAttrs(this.globalOptions, this.chart, scales)

        const newValueLabels = valueLabels
            .enter()
            .append('text')

        const mergedValueLabels = newValueLabels.merge(valueLabels as Selection<SVGTextElement, MdtChartsDataRow, SVGGElement, unknown>);

        this.setAttrs(mergedValueLabels, attrs);
        this.setClasses(mergedValueLabels, this.chart.cssClasses, this.chart.index);
    }

    public remove() {
        this.getAllValueLabels().remove();
    }

    private getAllValueLabels(): Selection<BaseType, unknown, SVGGElement, unknown> {
        const block = this.globalOptions.elementAccessors.getBlock().svg.getChartBlock()
        return block
            .selectAll(`.${this.valueLabelClass}.${CLASSES.dataLabel}${Helper.getCssClassesLine(this.chart.cssClasses)}`)
    }

    private setAttrs(textLabels: Selection<SVGTextElement, MdtChartsDataRow, BaseType, any>, attrs: ValueLabelAttrs) {
        const valueFieldName = this.chart.data.valueFields[0].name
        textLabels
            .text(d => d[valueFieldName])
            .attr('x', d => attrs.x(d))
            .attr('y', d => attrs.y(d))
            .attr('dominant-baseline', attrs.dominantBaseline)
            .attr('text-anchor', attrs.textAnchor)
    }

    private setClasses(textLabels: Selection<SVGTextElement, MdtChartsDataRow, BaseType, any>, cssClasses: string[], vfIndex: number): void {
        textLabels.classed(this.valueLabelClass, true)
        textLabels.classed(CLASSES.dataLabel, true)
        DomHelper.setCssClasses(textLabels, Helper.getCssClassesWithElementIndex(cssClasses, vfIndex));
    }
}

export class CanvasValueLabels {
    private chartValueLabels: { chartIndex: number; instance: ChartValueLabels }[] = [];

    constructor(private readonly options: ValueLabelsOptions) { }

    render(scales: ScalesWithSecondary, charts: TwoDimensionalChartModel[], data: MdtChartsDataSource, dataOptions: OptionsModelData) {
        const chartsWithLabels: TwoDimensionalChartModel[]  = charts.filter(chart => chart.valueLabels?.show);
        if (chartsWithLabels.length === 0) return;

        this.renderOrUpdateChartLabels(chartsWithLabels, scales, data, dataOptions, 'render')
    }

    update(scales: ScalesWithSecondary, charts: TwoDimensionalChartModel[], data: MdtChartsDataSource, dataOptions: OptionsModelData) {
        const chartsWithLabels = charts.filter(chart => chart.valueLabels?.show);

        if (chartsWithLabels.length === 0) {
            this.clearAllLabels();
            return;
        }

        this.renderOrUpdateChartLabels(chartsWithLabels, scales, data, dataOptions, 'update');

        this.chartValueLabels = this.chartValueLabels.filter(chartEntry => {
            const isChartWithLabels = chartsWithLabels.some(chart => chart.index === chartEntry.chartIndex);
            if (!isChartWithLabels) {
                this.removeChartValueLabels(chartEntry.instance);
            }
            return isChartWithLabels;
        });
    }

    private renderOrUpdateChartLabels(chartsWithLabels: TwoDimensionalChartModel[], scales: ScalesWithSecondary, data: MdtChartsDataSource, dataOptions: OptionsModelData, action: CanvasValueLabelsAction) {
        chartsWithLabels.forEach(chart => {
            const chartScales: Scales = {
                key: scales.key,
                value: chart.data.valueGroup === "secondary" ? scales.valueSecondary : scales.value
            };
            let chartValueLabelsEntry = this.chartValueLabels.find(chartEntry => chartEntry.chartIndex === chart.index);

            if (!chartValueLabelsEntry) {
                const chartValueLabel = new ChartValueLabels(this.options, chart);
                chartValueLabelsEntry = { chartIndex: chart.index, instance: chartValueLabel };
                this.chartValueLabels.push(chartValueLabelsEntry);
            }
            chartValueLabelsEntry.instance[action](chartScales, data[dataOptions.dataSource])
        });
    }

    private removeChartValueLabels(instance: ChartValueLabels) {
        instance.remove();
    }

    private clearAllLabels() {
        this.chartValueLabels.forEach(chartEntry => {
            this.removeChartValueLabels(chartEntry.instance);
        });
        this.chartValueLabels = [];
    }
}