import { select, Selection, BaseType } from 'd3-selection'
import { ChartOrientation } from "../../../config/config";
import { BlockMargin, DataRow, DataSource, Field, IntervalChartModel, OptionsModelData, PolarChartModel, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";
import { ValueFormatter, } from "../../valueFormatter";
import { Dot } from "../lineDots/dot";

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
    public static fillMultyFor2DChart(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, chart: TwoDimensionalChartModel, data: DataSource, dataOptions: OptionsModelData, keyValue: string): void {
        tooltipContentBlock.html('');
        chart.data.valueFields.forEach((field, index) => {
            this.fillTooltipContent(tooltipContentBlock, data, dataOptions, keyValue, field, chart.style.elementColors[index % chart.style.elementColors.length].toString());
        });
    }

    public static fillTooltipFor2DChart(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, chart: TwoDimensionalChartModel, data: DataSource, dataOptions: OptionsModelData, keyValue: string, index: number): void {
        tooltipContentBlock.html('');
        this.fillTooltipContent(tooltipContentBlock, data, dataOptions, keyValue, chart.data.valueFields[index], chart.style.elementColors[index % chart.style.elementColors.length].toString());
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

    public static getTooltipBlockCoordinateByDot(element: Selection<BaseType, DataRow, HTMLElement, any>, tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>): [number, number] {
        const coordinateTuple: [number, number] = [parseFloat(element.attr('cx')), parseFloat(element.attr('cy'))];
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

    public static getDotEdgingAttrs(element: Selection<BaseType, DataRow, HTMLElement, any>): DotEdgingAttrs {
        return {
            cx: parseFloat(element.attr('cx')),
            cy: parseFloat(element.attr('cy'))
        }
    }

    public static getKeyForTooltip(row: DataRow, keyFieldName: string, isSegmented: boolean): string {
        return isSegmented ? row.data[keyFieldName] : row[keyFieldName]; 
    }

    public static getFilteredElements(elements: Selection<BaseType, DataRow, BaseType, unknown>, keyFieldName: string, keyValue: string, isSegmented: boolean): Selection<BaseType, DataRow, BaseType, unknown> {
        if(isSegmented)
            return elements.filter(d => d.data[keyFieldName] !== keyValue);
        return elements.filter(d => d[keyFieldName] !== keyValue);
    }

    public static getElementIndex(elemets: Selection<BaseType, DataRow, BaseType, unknown>, dot: BaseType, keyValue: string, keyName: string, isSegmented: boolean): number {
        let index = -1;
        const filtered = isSegmented ? elemets.filter(d => d.data[keyName] === keyValue) : elemets.filter(d => d[keyName] === keyValue);
        filtered.each(function(d, i) {
            if(select(this).node() === select(dot).node()) {
                index = i;
            }
        });

        return index;
    }

    public static getOtherChartsElements(block: Block, chartIndex: number, chartsClasses: string[][]): Selection<BaseType, unknown, BaseType, unknown> {
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

    public static setElementsSemiOpacity(elements: Selection<BaseType, DataRow, BaseType, unknown>): void {
        if(elements)
            elements.style('opacity', 0.3);
    }

    public static setElementsFullOpacity(elements: Selection<BaseType, DataRow, BaseType, unknown>): void {
        if(elements)
            elements.style('opacity', 1);
    }

    public static setOtherChartsElementsDefaultOpacity(elements: Selection<BaseType, DataRow, BaseType, unknown>, chartsStyleSettings: ChartStyleSettings[]): void {
        if(!elements)
            return;
            
        const thisClass = this;
        elements.each(function() {
            const indexOfChart = thisClass.findChartIndexOfElement(select(this), chartsStyleSettings);
            if(!select(this).classed(Dot.dotClass) && !select(this).classed(Dot.innerDotClass))
                select(this).style('opacity', chartsStyleSettings[indexOfChart].opacity);
            else
                select(this).style('opacity', 1);
        });
    }

    public static getBarHighlighterAttrs(bar: Selection<BaseType, DataRow, HTMLElement, unknown>, chartOrientation: ChartOrientation, blockSize: Size, margin: BlockMargin): BarHighlighterAttrs {
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

    private static findChartIndexOfElement(element: Selection<BaseType, unknown, BaseType, unknown>, chartStyleSettings: ChartStyleSettings[]): number {
        let index: number = null;
        chartStyleSettings.forEach((styleSettings, i) => {
            if(element.classed(styleSettings.cssClasses.join(' '))) {
                index = i;
            }
        });
        return index;
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
        if(textBlock.node().getBoundingClientRect().width > 500)
            textBlock.style('white-space', 'normal');
    }

    private static getTooltipItemText(data: DataSource, dataOptions: OptionsModelData, keyValue: string, valueField: Field): string {
        const row = data[dataOptions.dataSource].find(d => d[dataOptions.keyField.name] === keyValue);
        return `${row[dataOptions.keyField.name]} - ${ValueFormatter.formatValue(valueField.format, row[valueField.name])}`;
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

    private static setTooltipArrowCoordinate(tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>, horizontalPad: number): void {
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