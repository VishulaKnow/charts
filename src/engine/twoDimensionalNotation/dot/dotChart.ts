import { sum } from "d3-array";
import { MdtChartsDataRow } from "../../../config/config";
import { BarChartSettings, BlockMargin, DotChartViewModel, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Scale, Scales } from "../../features/scale/scale";
import { DomHelper } from "../../helpers/domHelper";
import { Helper } from "../../helpers/helper";
import { NamesHelper } from "../../helpers/namesHelper";
import { BarAttrsHelper, BarHelper, BarSettingsStore, DotChartSettingsStore } from "../bar/barHelper";

export interface CanvasDotChartOptions {
    elementAccessors: {
        getBlock: () => Block;
    }
    dataOptions: {
        keyFieldName: string;
    }
    canvas: {
        keyAxisOrient: Orient;
        margin: BlockMargin;
    }
    dataSourceRecords: MdtChartsDataRow[];
    bandOptions: {
        settings: BarChartSettings;
    }
}

export interface DotItemAttrGetters {
    x1: (dataRow: MdtChartsDataRow) => number;
    y1: (dataRow: MdtChartsDataRow) => number;
    x2: (dataRow: MdtChartsDataRow) => number;
    y2: (dataRow: MdtChartsDataRow) => number;
}

export class CanvasDotChart {
    private readonly dotChartItemClass = NamesHelper.getClassName("dot-chart-item");

    private chartRendered = false;

    constructor(private readonly options: CanvasDotChartOptions) { }

    render(scales: Scales, chart: TwoDimensionalChartModel) {
        if (this.chartRendered) return;

        chart.data.valueFields.slice(0, 1).forEach((field, index) => {
            const elements = this.options.elementAccessors.getBlock().svg.getChartGroup(chart.index)
                .selectAll(`.${this.dotChartItemClass}${Helper.getCssClassesLine(chart.cssClasses)}${Helper.getCssClassesLine(Helper.getCssClassesWithElementIndex(chart.cssClasses, index))}`)
                .data(this.options.dataSourceRecords)
                .enter()
                .append('line')
                .style("stroke-width", chart.dotViewOptions.shape.width)
                .attr('class', this.dotChartItemClass);

            const attrs: DotItemAttrGetters = {
                x1: null,
                y1: null,
                x2: null,
                y2: null
            }

            const settingsStore = new DotChartSettingsStore({ scaleBandWidth: Scale.getScaleBandWidth(scales.key) });

            // TODO: refactor

            if (this.options.canvas.keyAxisOrient === 'top' || this.options.canvas.keyAxisOrient === 'bottom') {
                const handleBase: (dataRow: MdtChartsDataRow) => number = d => scales.key(Helper.getKeyFieldValue(d, this.options.dataOptions.keyFieldName, false)) + this.options.canvas.margin.left + settingsStore.getBandItemPad()

                attrs.x1 = d => chart.dotViewOptions.shape.handleStartCoordinate(handleBase(d));
                attrs.x2 = d => chart.dotViewOptions.shape.handleEndCoordinate(handleBase(d) + settingsStore.getBandItemSize());
            }
            if (this.options.canvas.keyAxisOrient === 'left' || this.options.canvas.keyAxisOrient === 'right') {
                const handleBase: (dataRow: MdtChartsDataRow) => number = d => scales.key(Helper.getKeyFieldValue(d, this.options.dataOptions.keyFieldName, false)) + this.options.canvas.margin.top + settingsStore.getBandItemPad()

                attrs.y1 = d => chart.dotViewOptions.shape.handleStartCoordinate(handleBase(d));
                attrs.y2 = d => chart.dotViewOptions.shape.handleEndCoordinate(handleBase(d) + settingsStore.getBandItemSize());
            }

            if (this.options.canvas.keyAxisOrient === 'top') {
                attrs.y1 = d => scales.value(Math.min(d[field.name], 0)) + this.options.canvas.margin.top + BarHelper.getBandItemValueStretch(scales.value, field.name)(d);
                attrs.y2 = d => scales.value(Math.min(d[field.name], 0)) + this.options.canvas.margin.top + BarHelper.getBandItemValueStretch(scales.value, field.name)(d);
            }
            if (this.options.canvas.keyAxisOrient === 'bottom') {
                attrs.y1 = d => scales.value(Math.max(d[field.name], 0)) + this.options.canvas.margin.top;
                attrs.y2 = d => scales.value(Math.max(d[field.name], 0)) + this.options.canvas.margin.top;
            }
            if (this.options.canvas.keyAxisOrient === 'left') {
                attrs.x1 = d => scales.value(Math.min(d[field.name], 0)) + this.options.canvas.margin.left + BarHelper.getBandItemValueStretch(scales.value, field.name)(d);
                attrs.x2 = d => scales.value(Math.min(d[field.name], 0)) + this.options.canvas.margin.left + BarHelper.getBandItemValueStretch(scales.value, field.name)(d);
            }
            if (this.options.canvas.keyAxisOrient === 'right') {
                attrs.x1 = d => scales.value(Math.max(d[field.name], 0)) + this.options.canvas.margin.left;
                attrs.x2 = d => scales.value(Math.max(d[field.name], 0)) + this.options.canvas.margin.left;
            }

            elements.attr('x1', d => attrs.x1(d))
                .attr('y1', d => attrs.y1(d))
                .attr('x2', d => attrs.x2(d))
                .attr('y2', d => attrs.y2(d));

            DomHelper.setCssClasses(elements, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            DomHelper.setChartStyle(elements, chart.style, index, 'stroke');
        });

        this.chartRendered = true;
    }
}
