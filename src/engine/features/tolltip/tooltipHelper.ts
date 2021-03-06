import { AxisScale } from 'd3-axis';
import { Selection, BaseType } from 'd3-selection'
import { ChartOrientation, ValueField } from "../../../config/config";
import { BlockMargin, DataSource, OptionsModelData, Orient, PolarChartModel, ScaleKeyType, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from '../../helper';
import { ValueFormatter, } from "../../valueFormatter";
import { Scale } from '../scale/scale';

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

const TOOLTIP_ARROW_PADDING_X = ARROW_DEFAULT_POSITION - (ARROW_SIZE * Math.sqrt(2) - ARROW_SIZE) / 2 + 14;
const TOOLTIP_ARROW_PADDING_Y = 13;

export class TooltipHelper {
    private static tooltipGroupClass = 'tooltip-group';
    private static tooltipHeadClass = 'tooltip-head';

    public static fillForMulty2DCharts(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, charts: TwoDimensionalChartModel[], data: DataSource, dataOptions: OptionsModelData, keyValue: string): void {
        tooltipContentBlock.html('');
        tooltipContentBlock.append('div')
            .attr('class', `${this.tooltipGroupClass} ${this.tooltipHeadClass}`)
            .text(keyValue);

        charts.forEach(chart => {
            chart.data.valueFields.forEach((field, index) => {
                const text = this.getTooltipItemText(data, dataOptions, keyValue, field, false);
                this.fillTooltipContent(tooltipContentBlock, chart.style.elementColors[index % chart.style.elementColors.length].toString(), text);
            });
        });
    }

    public static fillTooltipForPolarChart(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, chart: PolarChartModel, data: DataSource, dataOptions: OptionsModelData, keyValue: string, markColor: string): void {
        tooltipContentBlock.html('');
        tooltipContentBlock.append('div')
            .attr('class', `${this.tooltipGroupClass} ${this.tooltipHeadClass}`)
            .text(keyValue);

        const text = this.getTooltipItemText(data, dataOptions, keyValue, chart.data.valueField, false);
        this.fillTooltipContent(tooltipContentBlock, markColor, text);
    }

    public static getTooltipCoordinate(pointer: [number, number]): TooltipCoordinate {
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

    public static getTooltipFixedCoordinate(scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size, keyValue: string, tooltipBlockElement: HTMLElement, keyAxisOrient: Orient): TooltipCoordinate {
        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            const coordinate: TooltipCoordinate = {
                top: margin.top - 5 - tooltipBlockElement.getBoundingClientRect().height + 'px',
                bottom: null,
                left: Scale.getScaledValue(scaleKey, keyValue) + margin.left - tooltipBlockElement.getBoundingClientRect().width / 2 + 'px',
                right: null
            }

            if (Helper.getPXValueFromString(coordinate.left) < 0)
                coordinate.left = 0 + 'px';

            if (Helper.getPXValueFromString(coordinate.left) + tooltipBlockElement.getBoundingClientRect().width > blockSize.width) {
                coordinate.left = null;
                coordinate.right = 0 + 'px';
            }

            if (keyAxisOrient === 'top') {
                coordinate.top = null;
                coordinate.bottom = 0 + 'px';
            }

            return coordinate;
        } else {
            const coordinate: TooltipCoordinate = {
                top: Scale.getScaledValue(scaleKey, keyValue) + margin.top - tooltipBlockElement.getBoundingClientRect().height / 2 + 'px',
                left: 0 + 'px',
                bottom: null,
                right: null
            }

            if (Helper.getPXValueFromString(coordinate.top) < 0)
                coordinate.top = 0 + 'px';

            if (Helper.getPXValueFromString(coordinate.top) + tooltipBlockElement.getBoundingClientRect().height > blockSize.height) {
                coordinate.top = null;
                coordinate.bottom = 0 + 'px';
            }

            if (keyAxisOrient === 'left') {
                coordinate.left = null;
                coordinate.right = 0 + 'px';
            }

            return coordinate;
        }
    }

    public static getRecalcedCoordinateByArrow(coordinate: [number, number], tooltipBlock: Selection<HTMLElement, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>, translateX: number = 0, translateY: number = 0): [number, number] {
        const tooltipBlockNode = tooltipBlock.node();
        const horizontalPad = this.getHorizontalPad(coordinate[0], tooltipBlockNode, blockSize, translateX);
        const verticalPad = this.getVerticalPad(coordinate[1], tooltipBlockNode, translateY);

        this.setTooltipArrowCoordinate(tooltipArrow, this.getTooltipArrowPadding(tooltipBlockNode, horizontalPad));

        return [coordinate[0] - TOOLTIP_ARROW_PADDING_X - horizontalPad,
        coordinate[1] - TOOLTIP_ARROW_PADDING_Y - tooltipBlockNode.getBoundingClientRect().height - verticalPad];
    }

    public static getTooltipLineAttributes(scaleKey: AxisScale<any>, margin: BlockMargin, key: string, chartOrientation: ChartOrientation, blockSize: Size): TooltipLineAttributes {
        const convexSize = 5;
        const attributes: TooltipLineAttributes = {
            x1: 0, x2: 0, y1: 0, y2: 0
        }

        if (chartOrientation === 'vertical') {
            attributes.x1 = Math.ceil(Scale.getScaledValue(scaleKey, key) + margin.left) - 0.5;
            attributes.x2 = Math.ceil(Scale.getScaledValue(scaleKey, key) + margin.left) - 0.5;
            attributes.y1 = margin.top - convexSize;
            attributes.y2 = blockSize.height - margin.bottom + convexSize * 2;
        } else {
            attributes.x1 = margin.left - convexSize;
            attributes.x2 = blockSize.width - margin.right + convexSize * 2;
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

    private static getTooltipItemText(data: DataSource, dataOptions: OptionsModelData, keyValue: string, valueField: ValueField, showKey: boolean = true): string {
        const row = data[dataOptions.dataSource].find(d => d[dataOptions.keyField.name] === keyValue);
        let text: string;

        text = `<span class="tooltip-field-title">${valueField.title}</span><span class="tooltip-field-value">${ValueFormatter.formatField(valueField.format, row[valueField.name])}</span>`;

        return text;
    }

    private static getHorizontalPad(coordinateX: number, tooltipBlockNode: HTMLElement, blockSize: Size, translateX: number): number {
        let pad = 0;
        if (tooltipBlockNode.getBoundingClientRect().width + coordinateX - TOOLTIP_ARROW_PADDING_X + translateX > blockSize.width)
            pad = tooltipBlockNode.getBoundingClientRect().width + coordinateX - TOOLTIP_ARROW_PADDING_X + translateX - blockSize.width;

        return pad;
    }

    private static getVerticalPad(coordinateY: number, tooltipBlockNode: HTMLElement, translateY: number): number {
        let pad = 0;
        if (coordinateY - TOOLTIP_ARROW_PADDING_Y - tooltipBlockNode.getBoundingClientRect().height + translateY < -tooltipBlockNode.getBoundingClientRect().height - TOOLTIP_ARROW_PADDING_Y)
            pad = coordinateY;

        return pad; // return zero or sub zero
    }

    private static setTooltipArrowCoordinate(tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>, horizontalPad: number): void {
        if (horizontalPad !== 0)
            tooltipArrow.style('left', `${ARROW_DEFAULT_POSITION + Math.floor(horizontalPad)}px`);
        else
            tooltipArrow.style('left', `${ARROW_DEFAULT_POSITION}px`);
    }

    private static getTooltipArrowPadding(tooltipBlockNode: HTMLElement, horizontalPad: number): number {
        return horizontalPad > tooltipBlockNode.getBoundingClientRect().width
            ? tooltipBlockNode.getBoundingClientRect().width - ARROW_DEFAULT_POSITION - 20 * Math.sqrt(2)
            : horizontalPad; // If tooltip arrow has coordinate outside svg, it take X position in end of tooltip block
    }
}