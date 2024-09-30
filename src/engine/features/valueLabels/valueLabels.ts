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
        const block = this.globalOptions.elementAccessors.getBlock().svg.getChartBlock()
        const valueLabels = block
            .selectAll(`.${this.valueLabelClass}${Helper.getCssClassesLine(this.chart.cssClasses)}`)
            .data(data)
            .enter();

        const attrs = ValueLabelsHelper.getValueLabelsAttrs(this.globalOptions, this.chart, scales)

        const textLabels = valueLabels.append('text');
        this.setAttrs(textLabels, attrs);
        this.setClasses(textLabels, this.chart.cssClasses, this.chart.index)
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
    private readonly chartValueLabels: { chartIndex: number; instance: ChartValueLabels }[] = [];

    constructor(private readonly options: ValueLabelsOptions) { }

    render(scales: ScalesWithSecondary, charts: TwoDimensionalChartModel[], data: MdtChartsDataSource, dataOptions: OptionsModelData) {
        const chartsWithLabels: TwoDimensionalChartModel[]  = charts.filter(chart => chart.valueLabels?.show);
        if (chartsWithLabels.length === 0) return;
        chartsWithLabels.forEach(chart => {
            const chartScales: Scales = { key: scales.key, value: chart.data.valueGroup === "secondary" ? scales.valueSecondary : scales.value };
            let chartValueLabelEntry = this.chartValueLabels.find(entryChart => entryChart.chartIndex === chart.index);

            if (!chartValueLabelEntry) {
                const chartValueLabel = new ChartValueLabels(this.options, chart);
                this.chartValueLabels.push({ chartIndex: chart.index, instance: chartValueLabel });
                chartValueLabelEntry = { chartIndex: chart.index, instance: chartValueLabel };
            }

            chartValueLabelEntry.instance.render(chartScales, data[dataOptions.dataSource]);
        });
    }
}