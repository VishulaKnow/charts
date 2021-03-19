import { AxisScale } from 'd3-axis';
import { Selection, BaseType } from 'd3-selection'
import { ChartOrientation, ValueField } from "../../../config/config";
import { BlockMargin, DataSource, OptionsModelData, Orient, PolarChartModel, ScaleKeyType, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Block } from '../../block/block';
import { DomHelper } from '../../helpers/domHelper';
import { ValueFormatter, } from "../../valueFormatter";
import { Scale } from '../scale/scale';
import { TooltipHelper } from './tooltipHelper';

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

export const CONVEXSIZE = 5;

export class TooltipDomHelper {
    
    private static tooltipGroupClass = 'tooltip-group';
    private static tooltipHeadClass = 'tooltip-head';

    public static fillForMulty2DCharts(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, charts: TwoDimensionalChartModel[], data: DataSource, dataOptions: OptionsModelData, keyValue: string): void {
        tooltipContentBlock.html('');
        tooltipContentBlock.append('div')
            .attr('class', `${this.tooltipGroupClass} ${this.tooltipHeadClass}`)
            .text(keyValue);

        charts.forEach(chart => {
            chart.data.valueFields.forEach((field, index) => {
                const text = this.getTooltipItemText(data, dataOptions, keyValue, field);
                this.fillTooltipContent(tooltipContentBlock, chart.style.elementColors[index % chart.style.elementColors.length].toString(), text);
            });
        });
    }

    public static fillTooltipForPolarChart(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, chart: PolarChartModel, data: DataSource, dataOptions: OptionsModelData, keyValue: string, markColor: string): void {
        tooltipContentBlock.html('');
        tooltipContentBlock.append('div')
            .attr('class', `${this.tooltipGroupClass} ${this.tooltipHeadClass}`)
            .text(keyValue);

        const text = this.getTooltipItemText(data, dataOptions, keyValue, chart.data.valueField);
        this.fillTooltipContent(tooltipContentBlock, markColor, text);
    }

    public static getCoordinateByPointer(pointer: [number, number]): TooltipCoordinate {
        const coordinate: TooltipCoordinate = {
            left: null,
            top: null,
            right: null,
            bottom: null
        }

        coordinate.left = pointer[0] + 'px';
        coordinate.top = pointer[1] + 'px';

        return coordinate;
    }

    public static getTooltipFixedCoordinate(block: Block, scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size, keyValue: string, tooltipBlockElement: HTMLElement, keyAxisOrient: Orient): TooltipCoordinate {
        const coordinate: TooltipCoordinate = {
            top: null,
            bottom: null,
            left: null,
            right: null
        }
        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            coordinate.top = margin.top - 5 - tooltipBlockElement.getBoundingClientRect().height + 'px'
            coordinate.left = Scale.getScaledValue(scaleKey, keyValue) + margin.left - tooltipBlockElement.getBoundingClientRect().width / 2 + 'px';
        } 
        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            coordinate.top = Scale.getScaledValue(scaleKey, keyValue) + margin.top - tooltipBlockElement.getBoundingClientRect().height / 2 + 'px';
        }
        // Пересчет относительно viewPort'а
        return TooltipHelper.recalcToolTipCoordinateByViewPort(block, tooltipBlockElement, keyAxisOrient, coordinate);
        // Пересчет относительно block'а
        // return TooltipHelper.recalcToolTipCoordinateByBlock(block, scaleKey, margin, blockSize, keyValue, tooltipBlockElement, keyAxisOrient, coordinate);
    }
    
    public static getRecalcedCoordinateByArrow(coordinate: [number, number], tooltipBlock: Selection<HTMLElement, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>, translateX: number = 0, translateY: number = 0): [number, number] {
        const tooltipBlockNode = tooltipBlock.node();
        const horizontalPad = TooltipHelper.getHorizontalPad(coordinate[0], tooltipBlockNode.getBoundingClientRect().width, blockSize, translateX);
        const verticalPad = TooltipHelper.getVerticalPad(coordinate[1], tooltipBlockNode.getBoundingClientRect().height, translateY);

        this.setTooltipArrowCoordinate(tooltipArrow, TooltipHelper.getTooltipArrowPadding(tooltipBlockNode.getBoundingClientRect().width, horizontalPad));

        return [coordinate[0] - TOOLTIP_ARROW_PADDING_X - horizontalPad,
        coordinate[1] - TOOLTIP_ARROW_PADDING_Y - tooltipBlockNode.getBoundingClientRect().height - verticalPad];
    }

    public static getTooltipLineAttributes(scaleKey: AxisScale<any>, margin: BlockMargin, key: string, chartOrientation: ChartOrientation, blockSize: Size): TooltipLineAttributes {
        const attributes: TooltipLineAttributes = {
            x1: 0, x2: 0, y1: 0, y2: 0
        }

        if (chartOrientation === 'vertical') {
            attributes.x1 = Math.ceil(Scale.getScaledValue(scaleKey, key) + margin.left) - 0.5;
            attributes.x2 = Math.ceil(Scale.getScaledValue(scaleKey, key) + margin.left) - 0.5;
            attributes.y1 = margin.top - CONVEXSIZE;
            attributes.y2 = blockSize.height - margin.bottom + CONVEXSIZE * 2;
        } else {
            attributes.x1 = margin.left - CONVEXSIZE;
            attributes.x2 = blockSize.width - margin.right + CONVEXSIZE * 2;
            attributes.y1 = Scale.getScaledValue(scaleKey, key) + margin.top;
            attributes.y2 = Scale.getScaledValue(scaleKey, key) + margin.top;
        }

        return attributes;
    }

    private static fillTooltipContent(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, markColor: string, tooltipText: string): void {
        const group = tooltipContentBlock.append('div')
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

        if (textBlock.node().getBoundingClientRect().width >= 450)
            textBlock.style('white-space', 'normal');
    }

    private static getTooltipItemText(data: DataSource, dataOptions: OptionsModelData, keyValue: string, valueField: ValueField): string {
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