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
    ValueLabelsStyleModel,
} from "../../../model/model";
import { ChartOrientation, MdtChartsDataRow, MdtChartsDataSource } from "../../../config/config";
import { Scales, ScalesWithSecondary } from "../../../engine/features/scale/scale";
import { ValueLabelsAttrsProvider } from "../../../engine/features/valueLabels/valueLabelsHelper";
import { Helper } from "../../../engine/helpers/helper";
import { BaseType, select, Selection } from "d3-selection";
import { DomHelper } from "../../../engine/helpers/domHelper";
import { CLASSES } from "../../../model/modelBuilder";
import { ValueLabelsCollision } from "../../../engine/features/valueLabelsCollision/valueLabelsCollision";
import { Pipeline } from "../../helpers/pipeline/Pipeline";
import { getStackedData } from "../../twoDimensionalNotation/line/lineHelper";
import { Segment } from "../../twoDimensionalNotation/lineLike/generatorMiddleware/lineLikeGeneratorDefineMiddleware";


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
        style: ValueLabelsStyleModel;
    }
}

export interface ValueLabelAttrs {
    x: (data: MdtChartsDataRow) => number;
    y: (data: MdtChartsDataRow) => number;
    textAnchor: ValueLabelAnchor;
    dominantBaseline: ValueLabelDominantBaseline;
}

export class ChartValueLabels {
    public static readonly valueLabelClass = NamesHelper.getClassName("value-label");

    private readonly renderPipeline = new Pipeline<Selection<SVGTextElement, MdtChartsDataRow | Segment, SVGGElement, unknown>, { style: ValueLabelsStyleModel }>();
    private readonly attrsProvider = new ValueLabelsAttrsProvider();

    constructor(private readonly globalOptions: ValueLabelsOptions, private readonly chart: TwoDimensionalChartModel) {
        this.renderPipeline.push((valueLabels, { style }) => {
            valueLabels
                .attr('fill', 'currentColor')
                .style('font-size', style.fontSize)
                .style('color', style.color);

            if (style.cssClassName)
                valueLabels.classed(style.cssClassName, true);

            return valueLabels;
        });
    }

    render(scales: Scales, data: MdtChartsDataRow[]) {
        if (this.chart.isSegmented) {
            const preparedData = getStackedData(data, this.chart);

            preparedData.forEach((segment, segmentIndex) => {
                this.renderByGroupIndex(scales, segmentIndex, segment, segment[0].fieldName, '1', d => d.data);
            });
        }
        else {
            this.chart.data.valueFields.forEach((valueField, vfIndex) => {
                this.renderByGroupIndex(scales, vfIndex, data, valueField.name, valueField.name, d => d);
            });
        }
    }

    update(scales: Scales, newData: MdtChartsDataRow[]) {
        const updatePromises: Promise<void>[] = [];

        if (this.chart.isSegmented) {
            const preparedData = getStackedData(newData, this.chart);
            preparedData.forEach((segment, segmentIndex) => {
                const promise = this.updateByGroupIndex(scales, segmentIndex, segment, segment[0].fieldName, '1', d => d.data);
                updatePromises.push(promise);
            });
        }
        else {
            this.chart.data.valueFields.forEach((valueField, vfIndex) => {
                const promise = this.updateByGroupIndex(scales, vfIndex, newData, valueField.name, valueField.name, d => d);
                updatePromises.push(promise);
            });
        }

        return Promise.all(updatePromises)
    }

    private renderByGroupIndex(scales: Scales, groupIndex: number, data: MdtChartsDataRow[] | Segment[], valueFieldName: string, datumField: string, dataRowAccessor: (d: MdtChartsDataRow | Segment) => MdtChartsDataRow) {
        let valueLabels = this.getAllValueLabelsOfChart(groupIndex)
            .data(data)
            .enter()
            .append('text');

        valueLabels = this.renderPipeline.execute(valueLabels, { style: this.globalOptions.canvas.style });
        const attrs = this.attrsProvider.getAttrs(this.globalOptions, this.chart.valueLabels, scales, datumField, dataRowAccessor);

        this.setAttrs(valueLabels, attrs, valueFieldName, this.chart.valueLabels.format, dataRowAccessor);
        this.setClasses(valueLabels, this.chart.cssClasses, groupIndex);
    }

    private updateByGroupIndex(
        scales: Scales,
        groupIndex: number,
        data: MdtChartsDataRow[] | Segment[],
        valueFieldName: string,
        datumField: string,
        dataRowAccessor: (d: MdtChartsDataRow | Segment) => MdtChartsDataRow
    ): Promise<void> {
        return new Promise<void>((resolve) => {
            const valueLabels = this.getAllValueLabelsOfChart(groupIndex)
                .data(data);
            valueLabels.exit().remove();

            const attrs = this.attrsProvider.getAttrs(this.globalOptions, this.chart.valueLabels, scales, datumField, dataRowAccessor);

            let newValueLabels = valueLabels
                .enter()
                .append('text');

            newValueLabels = this.renderPipeline.execute(newValueLabels, { style: this.globalOptions.canvas.style });

            const mergedValueLabels = newValueLabels.merge(valueLabels as Selection<SVGTextElement, MdtChartsDataRow, SVGGElement, unknown>);

            this.setAttrs(newValueLabels, attrs, valueFieldName, this.chart.valueLabels.format, dataRowAccessor);
            this.setClasses(mergedValueLabels, this.chart.cssClasses, groupIndex);

            this.setAttrs(valueLabels, attrs, valueFieldName, this.chart.valueLabels.format, dataRowAccessor, true, resolve);
        });
    }

    private getAllValueLabelsOfChart(vfIndex: number): Selection<BaseType, unknown, SVGGElement, unknown> {
        const block = this.globalOptions.elementAccessors.getBlock().svg.getChartBlock();
        return block
            .selectAll(`.${ChartValueLabels.valueLabelClass}.${CLASSES.dataLabel}${Helper.getCssClassesLine(this.chart.cssClasses)}.chart-element-${vfIndex}`);
    }

    private setAttrs(valueLabels: Selection<SVGTextElement | BaseType, MdtChartsDataRow | Segment, BaseType, any>, attrs: ValueLabelAttrs, valueFieldName: string, formatter: ValueLabelsFormatter, dataRowAccessor: (d: MdtChartsDataRow | Segment) => MdtChartsDataRow, animate: boolean = false, onEndAnimation?: () => void) {
        const animationName = 'labels-updating';

        valueLabels
            .text(d => formatter(dataRowAccessor(d)[valueFieldName]))
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
        const valueLabelsSettings = this.options.canvas.valueLabels;

        const chartsWithLabels: TwoDimensionalChartModel[] = charts.filter(chart => chart.valueLabels?.show);
        if (chartsWithLabels.length === 0) return;

        chartsWithLabels.forEach(chart => {
            const chartScales = this.getChartScales(scales, chart);
            const chartValueLabels = new ChartValueLabels(this.options, chart);
            this.chartsValueLabels.push(chartValueLabels);

            chartValueLabels.render(chartScales, data[dataOptions.dataSource]);
        });

        const valueLabels = this.getAllValueLabels();
        ValueLabelsCollision.resolveValueLabelsCollisions(valueLabels, valueLabelsSettings);
    }

    update(scales: ScalesWithSecondary, charts: TwoDimensionalChartModel[], data: MdtChartsDataSource, dataOptions: OptionsModelData) {
        const valueLabelsSettings = this.options.canvas.valueLabels;

        const chartsWithLabels: TwoDimensionalChartModel[] = charts.filter(chart => chart.valueLabels?.show);
        if (chartsWithLabels.length === 0) return;

        if (this.options.canvas.valueLabels.collision.otherValueLables.mode === 'hide')
            this.toggleOldValueLabelsVisibility();

        const chartsUpdatePromises = chartsWithLabels.map((chart, index) => {
            const chartScales = this.getChartScales(scales, chart);
            return this.chartsValueLabels[index].update(chartScales, data[dataOptions.dataSource]);
        });

        Promise.all(chartsUpdatePromises).then(() => {
            const newValueLabels = this.getAllValueLabels();
            ValueLabelsCollision.resolveValueLabelsCollisions(newValueLabels, valueLabelsSettings);
        });
    }

    private toggleOldValueLabelsVisibility() {
        const oldValueLabels = this.getAllValueLabels();

        oldValueLabels.each(function () {
            if (this.style.display === 'none')
                select(this).style('display', 'block');
        })
    }

    private getAllValueLabels(): Selection<SVGTextElement, MdtChartsDataRow, SVGGElement, unknown> {
        const block = this.options.elementAccessors.getBlock().svg.getChartBlock();
        return block
            .selectAll<SVGTextElement, MdtChartsDataRow>(`.${ChartValueLabels.valueLabelClass}`);
    }

    private getChartScales(scales: ScalesWithSecondary, chart: TwoDimensionalChartModel): Scales {
        return {
            key: scales.key,
            value: chart.data.valueGroup === "secondary" ? scales.valueSecondary : scales.value
        }
    }
}