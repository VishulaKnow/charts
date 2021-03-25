import { Selection, BaseType } from 'd3-selection'
import { ValueField } from "../../../config/config";
import { DataSource, OptionsModelData, PolarChartModel, TwoDimensionalChartModel } from "../../../model/model";
import { ValueFormatter, } from "../../valueFormatter";
import { TooltipHelper } from './tooltipHelper';
import { Size } from "../../../config/config";

export interface TooltipLineAttributes {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
}
export interface TooltipCoordinate {
    left: string;
    top: string;
    right: string;
    bottom: string;
}

export const ARROW_SIZE = 20;
export const ARROW_DEFAULT_POSITION = 9;

export const TOOLTIP_ARROW_PADDING_X = ARROW_DEFAULT_POSITION - (ARROW_SIZE * Math.sqrt(2) - ARROW_SIZE) / 2 + 14;
export const TOOLTIP_ARROW_PADDING_Y = 13;

export class TooltipDomHelper {
    private static readonly tooltipGroupClass = 'tooltip-group';
    private static readonly tooltipHeadClass = 'tooltip-head';

    public static fillForMulty2DCharts(contentBlock: Selection<BaseType, unknown, BaseType, unknown>, charts: TwoDimensionalChartModel[], data: DataSource, dataOptions: OptionsModelData, keyValue: string): void {
        contentBlock.html('');
        contentBlock.append('div')
            .attr('class', `${this.tooltipGroupClass} ${this.tooltipHeadClass}`)
            .style('white-space', 'nowrap')
            .text(keyValue);

        charts.forEach(chart => {
            chart.data.valueFields.forEach((field, index) => {
                const html = this.getTooltipItemHtml(data, dataOptions, keyValue, field);
                this.fillTooltipContent(contentBlock, chart.style.elementColors[index % chart.style.elementColors.length], html);
            });
        });
    }

    public static fillTooltipForPolarChart(contentBlock: Selection<BaseType, unknown, BaseType, unknown>, chart: PolarChartModel, data: DataSource, dataOptions: OptionsModelData, keyValue: string, markColor: string): void {
        contentBlock.html('');
        contentBlock.append('div')
            .attr('class', `${this.tooltipGroupClass} ${this.tooltipHeadClass}`)
            .text(keyValue);

        const text = this.getTooltipItemHtml(data, dataOptions, keyValue, chart.data.valueField);
        this.fillTooltipContent(contentBlock, markColor, text);
    }

    public static getRecalcedCoordinateByArrow(coordinate: [number, number], tooltipBlock: Selection<HTMLElement, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>, translateX: number = 0, translateY: number = 0): [number, number] {
        const tooltipBlockNode = tooltipBlock.node();
        const horizontalPad = TooltipHelper.getHorizontalPad(coordinate[0], tooltipBlockNode.getBoundingClientRect().width, blockSize, translateX);
        const verticalPad = TooltipHelper.getVerticalPad(coordinate[1], tooltipBlockNode.getBoundingClientRect().height, translateY);

        this.setTooltipArrowCoordinate(tooltipArrow, TooltipHelper.getTooltipArrowPadding(tooltipBlockNode.getBoundingClientRect().width, horizontalPad));

        return [coordinate[0] - TOOLTIP_ARROW_PADDING_X - horizontalPad,
        coordinate[1] - TOOLTIP_ARROW_PADDING_Y - tooltipBlockNode.getBoundingClientRect().height - verticalPad];
    }

    private static fillTooltipContent(contentBlock: Selection<BaseType, unknown, BaseType, unknown>, markColor: string, tooltipText: string): void {
        const group = contentBlock.append('div')
            .attr('class', this.tooltipGroupClass);

        group.append('div')
            .attr('class', 'tooltip-color')
            .append('span')
            .attr('class', 'tooltip-circle')
            .style('background-color', markColor);

        const textBlock = group.append('div')
            .attr('class', 'tooltip-texts')
            .append('div')
            .attr('class', 'tooltip-text-item')
            .html(tooltipText)
            .style('white-space', 'nowrap');

        if (textBlock.node().getBoundingClientRect().width >= 450) {
            textBlock.style('white-space', 'normal');
            contentBlock.select(`.${this.tooltipHeadClass}`).style('white-space', 'normal');
        }
    }

    private static getTooltipItemHtml(data: DataSource, dataOptions: OptionsModelData, keyValue: string, valueField: ValueField): string {
        const row = data[dataOptions.dataSource].find(d => d[dataOptions.keyField.name] === keyValue);
        let text: string;

        text = `<span class="tooltip-field-title">${valueField.title}</span><span class="tooltip-field-value">${ValueFormatter.formatField(valueField.format, row[valueField.name])}</span>`;

        return text;
    }

    private static setTooltipArrowCoordinate(tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>, horizontalPad: number): void {
        if (horizontalPad !== 0)
            tooltipArrow.style('left', `${ARROW_DEFAULT_POSITION + Math.floor(horizontalPad)}px`);
        else
            tooltipArrow.style('left', `${ARROW_DEFAULT_POSITION}px`);
    }
}