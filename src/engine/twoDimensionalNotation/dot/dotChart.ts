import { sum } from "d3-array";
import { MdtChartsDataRow } from "../../../config/config";
import { BarChartSettings, BlockMargin, DotChartViewModel, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Scales } from "../../features/scale/scale";
import { DomHelper } from "../../helpers/domHelper";
import { Helper } from "../../helpers/helper";
import { NamesHelper } from "../../helpers/namesHelper";
import { BarAttrsHelper, BarHelper } from "../bar/barHelper";

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
        bandItemsForEachChart: number[];
        //TODO: remove this
        firstDotChartIndex: number;
    }
}

export class CanvasDotChart {
    private readonly dotChartItemClass = NamesHelper.getClassName("dot-chart-item");

    constructor(private readonly options: CanvasDotChartOptions) { }

    render(scales: Scales, chart: TwoDimensionalChartModel) {
        chart.data.valueFields.forEach((field, index) => {
            const elements = this.options.elementAccessors.getBlock().svg.getChartGroup(chart.index)
                .selectAll(`.${this.dotChartItemClass}${Helper.getCssClassesLine(chart.cssClasses)}${Helper.getCssClassesLine(Helper.getCssClassesWithElementIndex(chart.cssClasses, index))}`)
                .data(this.options.dataSourceRecords)
                .enter()
                .append('line')
                .style("stroke", "black")
                .style("stroke-width", "2")
                .attr('class', this.dotChartItemClass);

            const attrs: BarAttrsHelper = {
                x: null,
                y: null,
                width: null,
                height: null
            }

            BarHelper.setBarAttrsByKey(
                attrs,
                this.options.canvas.keyAxisOrient,
                scales.key,
                this.options.canvas.margin,
                this.options.dataOptions.keyFieldName,
                BarHelper.getBarIndex(this.options.bandOptions.bandItemsForEachChart, chart.index - this.options.bandOptions.firstDotChartIndex) + index,
                sum(this.options.bandOptions.bandItemsForEachChart),
                this.options.bandOptions.settings,
                false
            );

            BarHelper.setGroupedBandStartCoordinateAttr(attrs, this.options.canvas.keyAxisOrient, scales.value, this.options.canvas.margin, field.name);

            if (!attrs.width) attrs.width = attrs.x;
            if (!attrs.height) attrs.height = attrs.y;

            elements.attr('x1', d => chart.dotViewOptions.shape.handleStartCoordinate(attrs.x(d)))
                .attr('y1', d => attrs.y(d))
                // .attr('x2', d => attrs.x !== attrs.width ? attrs.x(d) : attrs.x(d) + attrs.width(d))
                // .attr('y2', d => attrs.y !== attrs.height ? attrs.y(d) : attrs.y(d) + attrs.height(d));
                .attr('x2', d => chart.dotViewOptions.shape.handleEndCoordinate(attrs.x(d) + attrs.width(d)))
                .attr('y2', d => attrs.y(d));

            DomHelper.setCssClasses(elements, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            DomHelper.setChartStyle(elements, chart.style, index, 'stroke');
        });
    }
}
