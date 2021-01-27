import { ChartOrientation } from "../../../config/config";
import { BlockMargin, DataRow, DataSource, Field, PolarChartModel, ScaleKeyType, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Scale } from "../scale/scale";
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
            text += `<div class="tp-texts">`;
            text += `<div class="tp-text-item">${this.getTooltipItemText(chart, data, keyValue, field)}</div>`;
            text += '</div></div>';
        });
        return text;
    }

    public static getTooltipHtmlForPolarChart(chart: PolarChartModel, data: DataSource, keyValue: string, markColor: string): string {
        let text = '';
        text += `<div class="tooltip-group"><div class="tooltip-color"><span class="tooltip-circle" style="background-color: ${markColor};"></span></div>`;
        text += `<div class="tp-texts">`;
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

    public static getKeyIndex(pointer: [number, number], orient: ChartOrientation, margin: BlockMargin, bandSize: number, scaleKeyType: ScaleKeyType): number {
        const pointerAxis = orient === 'vertical' ? 0 : 1;
        const marginByOrient = orient === 'vertical' ? margin.left : margin.top;
        
        const point = scaleKeyType === 'point' 
            ? pointer[pointerAxis] - marginByOrient + bandSize / 2 
            : pointer[pointerAxis] - marginByOrient - 1;
        if(point < 0)
            return 0;

        return Math.floor(point / bandSize);
    }

    public static getTooltipLineAttributes(scaleKey: d3.AxisScale<any>, margin: BlockMargin, key: string, chartOrientation: ChartOrientation,  blockSize: Size): TooltipLineAttributes {
        const attributes: TooltipLineAttributes = {
            x1: 0, x2: 0, y1: 0, y2: 0
        }
        if(chartOrientation === 'vertical') {
            attributes.x1 = Math.ceil(Scale.getScaleKeyPoint(scaleKey, key) + margin.left);
            attributes.x2 = Math.ceil(Scale.getScaleKeyPoint(scaleKey, key) + margin.left);
            attributes.y1 = margin.top;
            attributes.y2 = blockSize.height - margin.bottom;
        }  else {
            attributes.x1 = margin.left;
            attributes.x2 = blockSize.width - margin.right;
            attributes.y1 = Scale.getScaleKeyPoint(scaleKey, key) + margin.top;
            attributes.y2 = Scale.getScaleKeyPoint(scaleKey, key) + margin.top;
        }
        
        return attributes;
    }

    public static getTipBoxAttributes(margin: BlockMargin, blockSize: Size): TipBoxAttributes {
        return {
            x: margin.left,
            y: margin.top,
            width: blockSize.width - margin.left - margin.right,
            height: blockSize.height - margin.top - margin.bottom,
        }
    } 

    public static getBarTooltipCoordinate(element: d3.Selection<d3.BaseType, DataRow, HTMLElement, any>, tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, elementType: ElementType): [number, number] {
        let coordinateTuple: [number, number];
        
        if(elementType === 'rect')
            coordinateTuple = [parseFloat(element.attr('x')) + parseFloat(element.attr('width')) / 2,
                parseFloat(element.attr('y'))];
        else
            coordinateTuple = [parseFloat(element.attr('cx')), 
                parseFloat(element.attr('cy'))];
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
    
    private static getTooltipItemText(chart: TwoDimensionalChartModel | PolarChartModel, data: DataSource, keyValue: string, valueField: Field): string {
        const row = data[chart.data.dataSource].find(d => d[chart.data.keyField.name] === keyValue);
        return `${row[chart.data.keyField.name]} - ${ValueFormatter.formatValue(valueField.format, row[valueField.name])}`;
    }

    private static getTooltipKeyHeader(keyValue: string): string {
        return `<div class="tooltip-header">${keyValue}</div>`
    }

    private static getTooltipText(fields: Field[], dataRow: DataRow): string {
        let text = '';    
        fields.forEach(field => {
            text += `<span class="tooltip-field">${field.name}:</span> <span class="tooltip-value">${ValueFormatter.formatValue(field.format, dataRow[field.name])}</span><br>`;
        });
        return text;
    }
}