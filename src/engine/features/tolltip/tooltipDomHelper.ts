import { Selection, BaseType } from 'd3-selection'
import { MdtChartsDataSource, TooltipHtml, MdtChartsValueField } from "../../../config/config";
import { ChartLegendModel, OptionsModelData, PolarChartModel, TwoDimensionalChartModel } from "../../../model/model";
import { ValueFormatter, } from "../../valueFormatter";
import { TooltipHelper } from './tooltipHelper';
import { Size } from "../../../config/config";
import { Helper } from '../../helpers/helper';
import { MarkerCreator, getMarkerCreator } from '../legend/legendMarkerCreator';

export interface TooltipLineAttributes {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
}

export const ARROW_SIZE = 20;
export const ARROW_DEFAULT_POSITION = 9;
export const TOOLTIP_ARROW_PADDING_X = ARROW_DEFAULT_POSITION - (ARROW_SIZE * Math.sqrt(2) - ARROW_SIZE) / 2 + 14;
export const TOOLTIP_ARROW_PADDING_Y = 13;

export class TooltipDomHelper {
    private static readonly groupClass = 'tooltip-group';
    private static readonly headClass = 'tooltip-head';
    private static readonly textItemClass = 'tooltip-text-item';
    private static readonly tooltipLegendDefaultMarker = 'tooltip-circle';

    public static fillForMulti2DCharts(contentBlock: Selection<HTMLElement, unknown, BaseType, unknown>, charts: TwoDimensionalChartModel[], data: MdtChartsDataSource, dataOptions: OptionsModelData, keyValue: string, htmlHandler?: TooltipHtml): void {
        contentBlock.html('');

        if (!htmlHandler) {
            this.renderHead(contentBlock, keyValue);
            charts.forEach(chart => {
                chart.data.valueFields.forEach((field, index) => {
                    const html = this.getTooltipItemHtml(data, dataOptions, keyValue, field);
                    this.fillValuesContent(
                        contentBlock,
                        chart.style.elementColors[index % chart.style.elementColors.length],
                        html,
                        this.getMarkerCreator(chart.legend)
                    );
                });
            });
        } else {
            this.fillContentByFunction(contentBlock, data, dataOptions, keyValue, htmlHandler);
        }
    }

    public static fillForPolarChart(contentBlock: Selection<HTMLElement, unknown, BaseType, unknown>, chart: PolarChartModel, data: MdtChartsDataSource, dataOptions: OptionsModelData, keyValue: string, markColor: string, htmlHandler?: TooltipHtml): void {
        contentBlock.html('');

        if (!htmlHandler) {
            this.renderHead(contentBlock, keyValue);
            const html = this.getTooltipItemHtml(data, dataOptions, keyValue, chart.data.valueField);
            this.fillValuesContent(
                contentBlock,
                markColor,
                html,
                this.getMarkerCreator(chart.legend)
            );
        } else {
            this.fillContentByFunction(contentBlock, data, dataOptions, keyValue, htmlHandler);
        }
    }

    public static getRecalcedCoordinateByArrow(coordinate: [number, number], tooltipBlock: Selection<HTMLElement, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>, translateX: number = 0, translateY: number = 0): [number, number] {
        const tooltipBlockNode = tooltipBlock.node();
        const horizontalPad = TooltipHelper.getHorizontalPad(coordinate[0], tooltipBlockNode.getBoundingClientRect().width, blockSize, translateX);
        const verticalPad = TooltipHelper.getVerticalPad(coordinate[1], tooltipBlockNode.getBoundingClientRect().height, translateY);

        this.setTooltipArrowCoordinate(tooltipArrow, TooltipHelper.getTooltipArrowPadding(tooltipBlockNode.getBoundingClientRect().width, horizontalPad));

        return [coordinate[0] - TOOLTIP_ARROW_PADDING_X - horizontalPad,
        coordinate[1] - TOOLTIP_ARROW_PADDING_Y - tooltipBlockNode.getBoundingClientRect().height - verticalPad];
    }

    private static renderHead(contentBlock: Selection<BaseType, unknown, BaseType, unknown>, keyValue: string): void {
        contentBlock.append('div')
            .attr('class', `${this.groupClass} ${this.headClass}`)
            .text(keyValue);
    }

    private static fillValuesContent(contentBlock: Selection<BaseType, unknown, BaseType, unknown>, markColor: string, tooltipHtml: string, markerCreator?: MarkerCreator): void {
        const group = contentBlock.append('div')
            .attr('class', this.groupClass);

        if (markColor) {
            const colorBlock = group.append('div').attr('class', 'tooltip-color')
            markerCreator?.renderMarker(colorBlock, markColor);
        }

        group.append('div')
            .attr('class', 'tooltip-texts')
            .append('div')
            .attr('class', this.textItemClass)
            .html(tooltipHtml)
    }

    private static getTooltipItemHtml(data: MdtChartsDataSource, dataOptions: OptionsModelData, keyValue: string, valueField: MdtChartsValueField): string {
        const row = data[dataOptions.dataSource].find(d => d[dataOptions.keyField.name] === keyValue);
        const text = `<span class="tooltip-field-title">${valueField.title}</span>
            <span class="tooltip-field-value">${ValueFormatter.formatField(valueField.format, row[valueField.name])}</span>`;

        return text;
    }

    private static setTooltipArrowCoordinate(tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>, horizontalPad: number): void {
        if (horizontalPad !== 0)
            tooltipArrow.style('left', `${ARROW_DEFAULT_POSITION + Math.floor(horizontalPad)}px`);
        else
            tooltipArrow.style('left', `${ARROW_DEFAULT_POSITION}px`);
    }

    private static fillContentByFunction(contentBlock: Selection<HTMLElement, unknown, BaseType, unknown>, data: MdtChartsDataSource, dataOptions: OptionsModelData, keyValue: string, htmlHandler: TooltipHtml): void {
        const row = Helper.getRowsByKeys([keyValue], dataOptions.keyField.name, data[dataOptions.dataSource])[0];
        contentBlock.html(htmlHandler(row));
        this.setWhiteSpaceForTextBlocks(contentBlock);
        contentBlock.selectAll('.tooltip-text-item').style('display', 'block');
    }

    private static setWhiteSpaceForTextBlocks(contentBlock: Selection<HTMLElement, unknown, BaseType, unknown>): void {
        contentBlock.selectAll(`.${this.textItemClass}`).style('white-space', 'pre-wrap');
    }

    private static getMarkerCreator(options: ChartLegendModel): MarkerCreator {
        return getMarkerCreator(options, { default: { cssClass: TooltipDomHelper.tooltipLegendDefaultMarker } })
    }
}