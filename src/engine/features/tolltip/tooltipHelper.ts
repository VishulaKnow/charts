import { ChartOrientation } from "../../../config/config";
import { BlockMargin, DataRow, DataSource, Field, ScaleKeyType, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Scale } from "../../twoDimensionalNotation/scale/scale";
import { ValueFormatter, } from "../../valueFormatter";

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

export class TooltipHelper
{ 
    public static getTooltipTextForMultyCharts(charts: TwoDimensionalChartModel[], data: DataSource, keyValue: string): string {
        let text = this.getTooltipKeyHeader(keyValue);
        charts.forEach((chart: TwoDimensionalChartModel) => {
            if(chart.tooltip.data.fields.length !== 0) {
                text += `<div class="tooltip-chart-item"><span class="legend-circle" style="background-color: ${chart.elementColors[0]}"></span><br>`;
                if(chart.tooltip.data.fields.length !== 0)
                    text += this.getTooltipText(chart.tooltip.data.fields, data[chart.data.dataSource].find((d: DataRow) => d[chart.data.keyField.name] === keyValue));
                text += '</div>'
            }
        });
        return text;
    }

    public static getTooltipTextForSingleChart(fields: Field[], dataRow: DataRow, keyField: string): string {
        let text = this.getTooltipKeyHeader(dataRow[keyField]);
        text += this.getTooltipText(fields, dataRow);
        return text;
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

    public static getTooltipCoordinate(pointer: [number, number], tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, blockSize: Size): TooltipCoordinate {
        const tooltipCursorMargin = 10;
        const coordinate: TooltipCoordinate = {
            left: null,
            top: null,
            right: null,
            bottom: null
        }
        let left = pointer[0];
        let top = pointer[1];
        const width = (tooltip.node() as any).getBoundingClientRect().width;
        const height = (tooltip.node() as any).getBoundingClientRect().height;
        if(left + width + tooltipCursorMargin >= blockSize.width) {
            coordinate.right = '0px';
        } else {
            coordinate.left = left + tooltipCursorMargin + 'px';
        }   
        if(top + height + tooltipCursorMargin >= blockSize.height) {
            coordinate.bottom = '0px';
        } else {
            coordinate.top = top + tooltipCursorMargin + 'px';
        }
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
            attributes.x1 = Scale.getScaleKeyPoint(scaleKey, key) + margin.left;
            attributes.x2 = Scale.getScaleKeyPoint(scaleKey, key) + margin.left;
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
}