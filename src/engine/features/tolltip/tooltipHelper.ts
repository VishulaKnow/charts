import { DataRow, DataSource, Field, PolarChartModel, TwoDimensionalChartModel } from "../../../model/model";
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


const TOOLTIP_ARROW_PADDING_X = 9 - 4.14 + 13.3;
const TOOLTIP_ARROW_PADDING_Y = 13;

export class TooltipHelper
{ 
    public static getTooltipHtmlFor2DCharts(chart: TwoDimensionalChartModel, data: DataSource, keyValue: string): string {
        let text = '';
        chart.data.valueField.forEach((field, index) => {
            text += `<div class="tooltip-group"><div class="tooltip-color"><span class="tooltip-circle" style="background-color: ${chart.elementColors[index % chart.elementColors.length]};"></span></div>`;
            text += `<div class="tooltip-texts">`;
            text += `<div class="tooltip-text-item">${this.getTooltipItemText(chart, data, keyValue, field)}</div>`;
            text += '</div></div>';
        });
        return text;
    }

    public static getTooltipHtmlForPolarChart(chart: PolarChartModel, data: DataSource, keyValue: string, markColor: string): string {
        let text = '';
        text += `<div class="tooltip-group"><div class="tooltip-color"><span class="tooltip-circle" style="background-color: ${markColor};"></span></div>`;
        text += `<div class="tooltip-texts">`;
        text += `<div class="tp-text-item">${this.getTooltipItemText(chart, data, keyValue, chart.data.valueField)}</div>`;
        text += '</div></div>';
        return text;
    }

    public static getTooltipTextForSingleChart(fields: Field[], dataRow: DataRow, keyField: string): string {
        let text = this.getTooltipKeyHeader(dataRow[keyField]);
        text += this.getTooltipText(fields, dataRow);
        return text;
    }

    public static getTooltipCoordinate(pointer: [number, number]): TooltipCoordinate {
        const tooltipCursorMargin = 0;
        const coordinate: TooltipCoordinate = {
            left: null,
            top: null,
            right: null,
            bottom: null
        }
        
        let left = pointer[0];
        let top = pointer[1];

        coordinate.left = left + tooltipCursorMargin + 'px';
        coordinate.top = top + tooltipCursorMargin + 'px';

        return coordinate;
    }

    public static getTooltipBlockCoordinate(element: d3.Selection<d3.BaseType, DataRow, HTMLElement, any>, tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, elementType: ElementType): [number, number] {
        let coordinateTuple: [number, number];
        
        if(elementType === 'rect')
            coordinateTuple = [parseFloat(element.attr('x')) + parseFloat(element.attr('width')) / 2, parseFloat(element.attr('y'))];
        else
            coordinateTuple = [parseFloat(element.attr('cx')), parseFloat(element.attr('cy'))];

        return this.getRecalcedCoordinateByArrow(coordinateTuple, tooltipBlock);
    }

    public static getRecalcedCoordinateByArrow(coordinate: [number, number], tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>): [number, number] {
        return [coordinate[0] - TOOLTIP_ARROW_PADDING_X, coordinate[1] - TOOLTIP_ARROW_PADDING_Y - (tooltipBlock.node() as HTMLElement).getBoundingClientRect().height];
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
    
    private static getTooltipItemText(chart: TwoDimensionalChartModel | PolarChartModel, data: DataSource, keyValue: string, valueField: Field): string {
        const row = data[chart.data.dataSource].find(d => d[chart.data.keyField.name] === keyValue);
        return `${row[chart.data.keyField.name]} - ${ValueFormatter.formatValue(valueField.format, row[valueField.name])}`;
    }

    private static getTooltipKeyHeader(keyValue: string): string {
        return `<div class="tooltip-header">${keyValue}</div>`;
    }

    private static getTooltipText(fields: Field[], dataRow: DataRow): string {
        let text = '';    
        fields.forEach(field => {
            text += `<span class="tooltip-field">${field.name}:</span> <span class="tooltip-value">${ValueFormatter.formatValue(field.format, dataRow[field.name])}</span><br>`;
        });
        
        return text;
    }
}