import { AxisScale } from 'd3-axis';
import { Selection, BaseType } from 'd3-selection'
import { ChartOrientation } from "../../../config/config";
import { BlockMargin, DataRow, DataSource, Field, IntervalChartModel, OptionsModelData, PolarChartModel, ScaleKeyType, Size, TwoDimensionalChartModel } from "../../../model/model";
import { ValueFormatter, } from "../../valueFormatter";
import { Scale } from '../scale/scale';

export interface TooltipLineAttributes {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
}
export interface TipBoxAttributes {
    x: number;
    y: number;
    width: number;
    height: number;
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
    public static fillMultyFor2DChart(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, charts: TwoDimensionalChartModel[], data: DataSource, dataOptions: OptionsModelData, keyValue: string): void {
        tooltipContentBlock.html('');
        charts.forEach(chart => {
            chart.data.valueFields.forEach((field, index) => {
                this.fillTooltipContent(tooltipContentBlock, data, dataOptions, keyValue, field, chart.style.elementColors[index % chart.style.elementColors.length].toString());
            });
        })
    }

    public static fillTooltipForPolarChart(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, chart: PolarChartModel, data: DataSource, dataOptions: OptionsModelData, keyValue: string, markColor: string): void {
        tooltipContentBlock.html('');
        this.fillTooltipContent(tooltipContentBlock, data, dataOptions, keyValue, chart.data.valueField, markColor);
    }

    public static fillTooltipForIntervalChart(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, chart: IntervalChartModel, data: DataSource, dataOptions: OptionsModelData, keyValue: string, markColor: string): void {
        tooltipContentBlock.html('');
        this.fillTooltipContent(tooltipContentBlock, data, dataOptions, keyValue, chart.data.valueField1, markColor);
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

    public static getTooltipBlockCoordinateByRect(element: Selection<BaseType, DataRow, HTMLElement, any>, tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>, chartOrientation: ChartOrientation): [number, number] {
        const blockPositionRatio = chartOrientation === 'vertical' ? 2 : 1; // If chart has horizontal orientation, block takes coordinte of end of bar, if chart vertical, block takes center of bar.
        const coordinateTuple: [number, number] = [parseFloat(element.attr('x')) + parseFloat(element.attr('width')) / blockPositionRatio, parseFloat(element.attr('y'))];
        return this.getRecalcedCoordinateByArrow(coordinateTuple, tooltipBlock, blockSize, tooltipArrow);
    }

    public static getRecalcedCoordinateByArrow(coordinate: [number, number], tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>, translateX: number = 0, translateY: number = 0): [number, number] {
        const tooltipBlockNode = tooltipBlock.node() as HTMLElement;
        const horizontalPad = this.getHorizontalPad(coordinate[0], tooltipBlockNode, blockSize, translateX);
        const verticalPad = this.getVerticalPad(coordinate[1], tooltipBlockNode, translateY);

        this.setTooltipArrowCoordinate(tooltipArrow, this.getTooltipArrowPadding(tooltipBlockNode, horizontalPad));

        return [coordinate[0] - TOOLTIP_ARROW_PADDING_X - horizontalPad,
        coordinate[1] - TOOLTIP_ARROW_PADDING_Y - tooltipBlockNode.getBoundingClientRect().height - verticalPad];
    }

    public static getKeyForTooltip(row: DataRow, keyFieldName: string, isSegmented: boolean): string {
        return isSegmented ? row.data[keyFieldName] : row[keyFieldName];
    }

    public static getFilteredElements(elements: Selection<BaseType, DataRow, BaseType, unknown>, keyFieldName: string, keyValue: string, isSegmented: boolean): Selection<BaseType, DataRow, BaseType, unknown> {
        if (isSegmented)
            return elements.filter(d => d.data[keyFieldName] !== keyValue);
        return elements.filter(d => d[keyFieldName] !== keyValue);
    }

    public static setElementsSemiOpacity(elements: Selection<BaseType, DataRow, BaseType, unknown>): void {
        if (elements)
            elements.style('opacity', 0.3);
    }

    public static setElementsFullOpacity(elements: Selection<BaseType, DataRow, BaseType, unknown>): void {
        if (elements)
            elements.style('opacity', 1);
    }

    public static getTipBoxAttributes(margin: BlockMargin, blockSize: Size): TipBoxAttributes {
        return {
            x: margin.left,
            y: margin.top,
            width: blockSize.width - margin.left - margin.right,
            height: blockSize.height - margin.top - margin.bottom,
        }
    }

    public static getKeyIndex(pointer: [number, number], orient: ChartOrientation, margin: BlockMargin, blockSize: Size, scaleKey: AxisScale<any>, scaleKeyType: ScaleKeyType): number {
        const pointerAxisType = orient === 'vertical' ? 0 : 1; // 0 - координата поинтера по оси x, 1 - по оси y
        const marginByOrient = orient === 'vertical' ? margin.left : margin.top;
        const scaleStep = Scale.getScaleStep(scaleKey);

        if (scaleKeyType === 'point') {
            const point = pointer[pointerAxisType] - marginByOrient + scaleStep / 2;
            if (point < 0)
                return 0;

            return Math.floor(point / scaleStep);
        }
        else {
            const chartBlockSizeByDir = orient === 'vertical'
                ? blockSize.width - margin.left - margin.right
                : blockSize.height - margin.top - margin.bottom;

            const outerPadding = chartBlockSizeByDir - scaleStep * scaleKey.domain().length;

            if (pointer[pointerAxisType] - marginByOrient - 1 < outerPadding / 2)
                return 0; // Самый первый элемент
            if (pointer[pointerAxisType] - marginByOrient - 1 + outerPadding / 2 > chartBlockSizeByDir)
                return scaleKey.domain().length - 1; // последний индекс

            const point = pointer[pointerAxisType] - outerPadding / 2 - marginByOrient - 1;

            return Math.floor(point / scaleStep);
        }
    }

    public static getTooltipLineAttributes(scaleKey: AxisScale<any>, margin: BlockMargin, key: string, chartOrientation: ChartOrientation, blockSize: Size): TooltipLineAttributes {
        const attributes: TooltipLineAttributes = {
            x1: 0, x2: 0, y1: 0, y2: 0
        }
        if (chartOrientation === 'vertical') {
            attributes.x1 = Math.ceil(Scale.getScaleKeyPoint(scaleKey, key) + margin.left);
            attributes.x2 = Math.ceil(Scale.getScaleKeyPoint(scaleKey, key) + margin.left);
            attributes.y1 = margin.top;
            attributes.y2 = blockSize.height - margin.bottom;
        } else {
            attributes.x1 = margin.left;
            attributes.x2 = blockSize.width - margin.right;
            attributes.y1 = Scale.getScaleKeyPoint(scaleKey, key) + margin.top;
            attributes.y2 = Scale.getScaleKeyPoint(scaleKey, key) + margin.top;
        }

        return attributes;
    }


    private static fillTooltipContent(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, data: DataSource, dataOptions: OptionsModelData, keyValue: string, valueField: Field, markColor: string): void {
        const group = tooltipContentBlock.append('div')
            .attr('class', 'tooltip-group');

        group.append('div')
            .attr('class', 'tooltip-color')
            .append('span')
            .attr('class', 'tooltip-circle')
            .style('background-color', markColor);

        const textBlock = group.append('div')
            .attr('class', 'tooltip-texts')
            .append('div')
            .attr('class', 'tooltip-text-item')
            .text(this.getTooltipItemText(data, dataOptions, keyValue, valueField))
            .style('white-space', 'nowrap');

        if (textBlock.node().getBoundingClientRect().width > 500)
            textBlock.style('white-space', 'normal');
    }

    private static getTooltipItemText(data: DataSource, dataOptions: OptionsModelData, keyValue: string, valueField: Field): string {
        const row = data[dataOptions.dataSource].find(d => d[dataOptions.keyField.name] === keyValue);
        return `${row[dataOptions.keyField.name]} - ${ValueFormatter.formatValue(valueField.format, row[valueField.name])}`;
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