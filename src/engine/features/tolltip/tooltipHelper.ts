import * as d3 from "d3";
import { ChartOrientation } from "../../../config/config";
import { BlockMargin, DataRow, DataSource, Field, IntervalChartModel, PolarChartModel, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";
import { ValueFormatter, } from "../../valueFormatter";
import { Dot } from "../lineDots/dot";

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
export interface BarHighlighterAttrs {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface ChartStyleSettings {
    cssClasses: string[];
    opacity: number;
}

export const ARROW_SIZE = 20;
export const ARROW_DEFAULT_POSITION = 9;

const TOOLTIP_ARROW_PADDING_X = ARROW_DEFAULT_POSITION - (ARROW_SIZE * Math.sqrt(2) - ARROW_SIZE) / 2 + 14;
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

        coordinate.left = pointer[0] + 'px';
        coordinate.top = pointer[1] + 'px';

        return coordinate;
    }

    public static getTooltipBlockCoordinateByRect(element: d3.Selection<d3.BaseType, DataRow, HTMLElement, any>, tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, chartOrientation: ChartOrientation): [number, number] {
        const blockPositionRatio = chartOrientation === 'vertical' ? 2 : 1; // If chart has horizontal orientation, block takes coordinte of end of bar, if chart vertical, block takes center of bar.
        const coordinateTuple: [number, number] = [parseFloat(element.attr('x')) + parseFloat(element.attr('width')) / blockPositionRatio, parseFloat(element.attr('y'))];
        return this.getRecalcedCoordinateByArrow(coordinateTuple, tooltipBlock, blockSize, tooltipArrow);
    }

    public static getTooltipBlockCoordinateByDot(element: d3.Selection<d3.BaseType, DataRow, HTMLElement, any>, tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: d3.Selection<d3.BaseType, unknown, HTMLElement, any>): [number, number] {
        const coordinateTuple: [number, number] = [parseFloat(element.attr('cx')), parseFloat(element.attr('cy'))];
        return this.getRecalcedCoordinateByArrow(coordinateTuple, tooltipBlock, blockSize, tooltipArrow);
    }

    public static getRecalcedCoordinateByArrow(coordinate: [number, number], tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, translateX: number = 0, translateY: number = 0): [number, number] {
        const tooltipBlockNode = tooltipBlock.node() as HTMLElement;
        const horizontalPad = this.getHorizontalPad(coordinate[0], tooltipBlockNode, blockSize, translateX);
        const verticalPad = this.getVerticalPad(coordinate[1], tooltipBlockNode, translateY);        

        this.setTooltipArrowCoordinate(tooltipArrow, this.getTooltipArrowPadding(tooltipBlockNode, horizontalPad));  

        return [coordinate[0] - TOOLTIP_ARROW_PADDING_X - horizontalPad,
            coordinate[1] - TOOLTIP_ARROW_PADDING_Y - tooltipBlockNode.getBoundingClientRect().height - verticalPad];
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

    public static getElementIndex(elemets: d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown>, dot: d3.BaseType, keyValue: string, keyName: string, isSegmented: boolean): number {
        let index = -1;
        const filtered = isSegmented ? elemets.filter(d => d.data[keyName] === keyValue) : elemets.filter(d => d[keyName] === keyValue);
        filtered.each(function(d, i) {
            if(d3.select(this).node() === d3.select(dot).node()) {
                index = i;
            }
        });

        return index;
    }

    public static getOtherChartsElements(block: Block, chartIndex: number, chartsClasses: string[][]): d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown> {
        let classes = '';
        chartsClasses.forEach((cssClasses, index) => {
            if(chartIndex !== index) {
                if(classes !== '')
                    classes += ', ';
                classes += Helper.getCssClassesLine(cssClasses);
            }
        });

        if(classes === '')
            return null;
        return block.getChartBlock()
            .selectAll(classes);
    }

    public static setElementsSemiOpacity(elements: d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown>): void {
        if(elements)
            elements.style('opacity', 0.3);
    }

    public static setElementsFullOpacity(elements: d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown>): void {
        if(elements)
            elements.style('opacity', 1);
    }

    public static setOtherChartsElementsDefaultOpacity(elements: d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown>, chartsStyleSettings: ChartStyleSettings[]): void {
        const thisClass = this;
        elements.each(function() {
            const indexOfChart = thisClass.findChartIndexOfElement(d3.select(this), chartsStyleSettings);
            if(!d3.select(this).classed(Dot.dotClass) && !d3.select(this).classed(Dot.innerDotClass))
                d3.select(this).style('opacity', chartsStyleSettings[indexOfChart].opacity);
            else
                d3.select(this).style('opacity', 1);
        });
    }

    public static getBarHighlighterAttrs(bar: d3.Selection<d3.BaseType, DataRow, HTMLElement, unknown>, chartOrientation: ChartOrientation, blockSize: Size, margin: BlockMargin): BarHighlighterAttrs {
        const pad = 3;
        if(chartOrientation === 'vertical')
            return {
                x: Helper.getSelectionNumericAttr(bar, 'x') - pad,
                y: margin.top,
                width: Helper.getSelectionNumericAttr(bar, 'width') + pad * 2,
                height: blockSize.height - margin.top - margin.bottom
            }
        return {
            x: margin.left,
            y: Helper.getSelectionNumericAttr(bar, 'y') - pad,
            width: blockSize.width - margin.left - margin.right,
            height: Helper.getSelectionNumericAttr(bar, 'height') + pad * 2
        }
    }

    public static getChartStyleSettings(chart: TwoDimensionalChartModel): ChartStyleSettings {
        return {
            cssClasses: chart.cssClasses,
            opacity: chart.style.opacity
        }
    }

    private static findChartIndexOfElement(element: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, chartStyleSettings: ChartStyleSettings[]): number {
        let index: number = null;
        chartStyleSettings.forEach((styleSettings, i) => {
            if(element.classed(styleSettings.cssClasses.join(' '))) {
                index = i;
            }
        });
        return index;
    }   

    private static getTooltipHtml(chart: TwoDimensionalChartModel | PolarChartModel | IntervalChartModel, data: DataSource, keyValue: string, valueField: Field, markColor: string): string {
        let text = `<div class="tooltip-group"><div class="tooltip-color"><span class="tooltip-circle" style="background-color: ${markColor};"></span></div>`;
        text += `<div class="tooltip-texts">`;
        text += `<div class="tp-text-item" style="white-space: nowrap">${this.getTooltipItemText(chart, data, keyValue, valueField)}</div>`;
        text += '</div></div>';
        
        return text;
    }

    private static getTooltipItemText(chart: TwoDimensionalChartModel | PolarChartModel | IntervalChartModel, data: DataSource, keyValue: string, valueField: Field): string {
        const row = data[chart.data.dataSource].find(d => d[chart.data.keyField.name] === keyValue);
        return `${row[chart.data.keyField.name]} - ${ValueFormatter.formatValue(valueField.format, row[valueField.name])}`;
    }

    private static getHorizontalPad(coordinateX: number, tooltipBlockNode: HTMLElement, blockSize: Size, translateX: number): number {
        let pad = 0;
        if(tooltipBlockNode.getBoundingClientRect().width + coordinateX - TOOLTIP_ARROW_PADDING_X + translateX > blockSize.width)
            pad = tooltipBlockNode.getBoundingClientRect().width + coordinateX - TOOLTIP_ARROW_PADDING_X + translateX - blockSize.width;
        
        return pad;
    }

    private static getVerticalPad(coordinateY: number, tooltipBlockNode: HTMLElement, translateY: number): number {
        let pad = 0;
        if(coordinateY - TOOLTIP_ARROW_PADDING_Y - tooltipBlockNode.getBoundingClientRect().height + translateY < -tooltipBlockNode.getBoundingClientRect().height - TOOLTIP_ARROW_PADDING_Y)
            pad = coordinateY;

        return pad; // return zero or sub zero
    }

    private static setTooltipArrowCoordinate(tooltipArrow: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, horizontalPad: number): void {
        if(horizontalPad !== 0)
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