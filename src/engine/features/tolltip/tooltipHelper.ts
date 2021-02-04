import { ChartOrientation } from "../../../config/config";
import { DataRow, DataSource, Field, IntervalChartModel, PolarChartModel, Size, TwoDimensionalChartModel } from "../../../model/model";
import { ValueFormatter, } from "../../valueFormatter";

type ElementType = 'circle' | 'rect';

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
export interface DotEdgingAttrs {
    cx: number,
    cy: number
}

export const ARROW_DEFAULT_POSITION = 9;
const TOOLTIP_ARROW_PADDING_X = ARROW_DEFAULT_POSITION - 4.14 + 13.3;
const TOOLTIP_ARROW_PADDING_Y = 13;

export class TooltipHelper
{ 
    public static getMultyTooltipHtmlFor2DChart(chart: TwoDimensionalChartModel, data: DataSource, keyValue: string): string {
        let text = '';
        chart.data.valueFields.forEach((field, index) => {
            text += this.getTooltipHtml(chart, data, keyValue, field, chart.style.elementColors[index % chart.style.elementColors.length].toString());
        });
        return text;
    }

    public static getTooltipHtmlFor2DChart(chart: TwoDimensionalChartModel, data: DataSource, keyValue: string, index: number): string {
        return this.getTooltipHtml(chart, data, keyValue, chart.data.valueFields[index], chart.style.elementColors[index % chart.style.elementColors.length].toString());
    }

    public static getTooltipHtmlForPolarChart(chart: PolarChartModel, data: DataSource, keyValue: string, markColor: string): string {
        return this.getTooltipHtml(chart, data, keyValue, chart.data.valueField, markColor);
    }

    public static getTooltipHtmlForIntervalChart(chart: IntervalChartModel, data: DataSource, keyValue: string, markColor: string): string {
        return this.getTooltipHtml(chart, data, keyValue, chart.data.valueField1, markColor);
    }

    public static getTooltipCoordinate(pointer: [number, number]): TooltipCoordinate {
        const coordinate: TooltipCoordinate = {
            left: null,
            top: null,
            right: null,
            bottom: null
        }
        
        let left = pointer[0];
        let top = pointer[1];

        coordinate.left = left + 'px';
        coordinate.top = top + 'px';

        return coordinate;
    }

    public static getTooltipBlockCoordinateByRect(element: d3.Selection<d3.BaseType, DataRow, HTMLElement, any>, tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, chartOrientation: ChartOrientation): [number, number] {
        const blockPositionRatio = chartOrientation === 'vertical' ? 2 : 1;
        const coordinateTuple: [number, number] = [parseFloat(element.attr('x')) + parseFloat(element.attr('width')) / blockPositionRatio, parseFloat(element.attr('y'))];
        return this.getRecalcedCoordinateByArrow(coordinateTuple, tooltipBlock, blockSize, tooltipArrow);
    }

    public static getTooltipBlockCoordinateByDot(element: d3.Selection<d3.BaseType, DataRow, HTMLElement, any>, tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: d3.Selection<d3.BaseType, unknown, HTMLElement, any>): [number, number] {
        const coordinateTuple: [number, number] = [parseFloat(element.attr('cx')), parseFloat(element.attr('cy'))];
        return this.getRecalcedCoordinateByArrow(coordinateTuple, tooltipBlock, blockSize, tooltipArrow);
    }

    public static getRecalcedCoordinateByArrow(coordinate: [number, number], tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: d3.Selection<d3.BaseType, unknown, HTMLElement, any>): [number, number] {
        let pad = 0;
        if((tooltipBlock.node() as HTMLElement).getBoundingClientRect().width + coordinate[0] - TOOLTIP_ARROW_PADDING_X > blockSize.width)
            pad = (tooltipBlock.node() as HTMLElement).getBoundingClientRect().width + coordinate[0] - TOOLTIP_ARROW_PADDING_X - blockSize.width;
        this.setTooltipArrowCoordinate(tooltipArrow, pad);

        return [coordinate[0] - TOOLTIP_ARROW_PADDING_X - pad, coordinate[1] - TOOLTIP_ARROW_PADDING_Y - (tooltipBlock.node() as HTMLElement).getBoundingClientRect().height];
    }

    private static getTooltipHtml(chart: TwoDimensionalChartModel | PolarChartModel | IntervalChartModel, data: DataSource, keyValue: string, valueField: Field, markColor: string): string {
        let text = `<div class="tooltip-group"><div class="tooltip-color"><span class="tooltip-circle" style="background-color: ${markColor};"></span></div>`;
        text += `<div class="tooltip-texts">`;
        text += `<div class="tp-text-item" style="white-space: nowrap">${this.getTooltipItemText(chart, data, keyValue, valueField)}</div>`;
        text += '</div></div>';
        
        return text;
    }

    private static setTooltipArrowCoordinate(tooltipArrow: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, pad: number = 0): void {
        if(pad !== 0)
            tooltipArrow.style('left', `${ARROW_DEFAULT_POSITION + Math.floor(pad)}px`);
        else
            tooltipArrow.style('left', `${ARROW_DEFAULT_POSITION}px`);
    }

    public static getDotEdgingAttrs(element: d3.Selection<d3.BaseType, DataRow, HTMLElement, any>): DotEdgingAttrs {
        return {
            cx: parseFloat(element.attr('cx')),
            cy: parseFloat(element.attr('cy'))
        }
    }

    public static getKeyForTooltip(row: DataRow, keyFieldName: string, isSegmented: boolean): string {
        return isSegmented ? row.data[keyFieldName] : row[keyFieldName]; 
    }

    public static getFilteredElements(elements: d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown>, keyFieldName: string, keyValue: string, isSegmented: boolean): d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown> {
        if(isSegmented)
            return elements.filter(d => d.data[keyFieldName] !== keyValue);
        return elements.filter(d => d[keyFieldName] !== keyValue);
    }
    
    private static getTooltipItemText(chart: TwoDimensionalChartModel | PolarChartModel | IntervalChartModel, data: DataSource, keyValue: string, valueField: Field): string {
        const row = data[chart.data.dataSource].find(d => d[chart.data.keyField.name] === keyValue);
        return `${row[chart.data.keyField.name]} - ${ValueFormatter.formatValue(valueField.format, row[valueField.name])}`;
    }
}