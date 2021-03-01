import { AxisScale } from 'd3-axis';
import { easeLinear } from 'd3-ease';
import { Selection, BaseType, select } from 'd3-selection'
import { PieArcDatum } from 'd3-shape';
import { interrupt } from 'd3-transition';
import { ChartOrientation, TwoDimensionalValueField } from "../../../config/config";
import { BlockMargin, DataRow, DataSource, Field, IntervalChartModel, OptionsModelData, Orient, PolarChartModel, ScaleKeyType, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Block } from '../../block/block';
import { Helper } from '../../helper';
import { DonutHelper } from '../../polarNotation/DonutHelper';
import { ValueFormatter, } from "../../valueFormatter";
import { Scale } from '../scale/scale';

export interface TooltipLineAttributes {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    strokeLinecap: string;
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
export interface BarHighlighterAttrs {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const ARROW_SIZE = 20;
export const ARROW_DEFAULT_POSITION = 9;

const TOOLTIP_ARROW_PADDING_X = ARROW_DEFAULT_POSITION - (ARROW_SIZE * Math.sqrt(2) - ARROW_SIZE) / 2 + 14;
const TOOLTIP_ARROW_PADDING_Y = 13;

export class TooltipHelper {
    public static fillForMulty2DCharts(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, charts: TwoDimensionalChartModel[], data: DataSource, dataOptions: OptionsModelData, keyValue: string): void {
        tooltipContentBlock.html('');
        tooltipContentBlock.append('div')
            .attr('class', 'tooltip-group tooltip-head')
            .text(keyValue);

        charts.forEach(chart => {
            chart.data.valueFields.forEach((field, index) => {
                const text = this.getTooltipItemText(data, dataOptions, keyValue, field, false);
                this.fillTooltipContent(tooltipContentBlock, chart.style.elementColors[index % chart.style.elementColors.length].toString(), text);
            });
        })
    }

    public static fillFor2DChart(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, chart: TwoDimensionalChartModel, data: DataSource, dataOptions: OptionsModelData, keyValue: string, fieldIndex: number = null): void {
        tooltipContentBlock.html('');
        chart.data.valueFields.forEach((field, index) => {
            if(fieldIndex === null || index === fieldIndex) {
                const text = this.getTooltipItemText(data, dataOptions, keyValue, field);
                this.fillTooltipContent(tooltipContentBlock, chart.style.elementColors[index % chart.style.elementColors.length].toString(), text);
            }
        });
    }

    public static fillTooltipForPolarChart(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, chart: PolarChartModel, data: DataSource, dataOptions: OptionsModelData, keyValue: string, markColor: string): void {
        tooltipContentBlock.html('');
        const text = this.getTooltipItemText(data, dataOptions, keyValue, chart.data.valueField);
        this.fillTooltipContent(tooltipContentBlock, markColor, text);
    }

    public static fillTooltipForIntervalChart(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, chart: IntervalChartModel, data: DataSource, dataOptions: OptionsModelData, keyValue: string, markColor: string): void {
        tooltipContentBlock.html('');
        const text = this.getTooltipItemText(data, dataOptions, keyValue, chart.data.valueField1);
        this.fillTooltipContent(tooltipContentBlock, markColor, text);
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

    public static getTooltipBlockCoordinateByRect(element: Selection<BaseType, DataRow, HTMLElement, any>, tooltipBlock: Selection<HTMLElement, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>, chartOrientation: ChartOrientation): [number, number] {
        const blockPositionRatio = chartOrientation === 'vertical' ? 2 : 1; // If chart has horizontal orientation, block takes coordinte of end of bar, if chart vertical, block takes center of bar.
        const coordinateTuple: [number, number] = [parseFloat(element.attr('x')) + parseFloat(element.attr('width')) / blockPositionRatio, parseFloat(element.attr('y'))];
        return this.getRecalcedCoordinateByArrow(coordinateTuple, tooltipBlock, blockSize, tooltipArrow);
    }

    public static getRecalcedCoordinateByArrow(coordinate: [number, number], tooltipBlock: Selection<HTMLElement, unknown, HTMLElement, any>, blockSize: Size, tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>, translateX: number = 0, translateY: number = 0): [number, number] {
        const tooltipBlockNode = tooltipBlock.node();
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

    public static changeDonutHighlightAppearance(segment: Selection<SVGGElement, PieArcDatum<DataRow>, BaseType, unknown>, margin: BlockMargin, blockSize: Size, donutThickness: number, on: boolean): void {
        interrupt(segment.select('path').node());
        
        let scaleSize = 0;
        if(on)
            scaleSize = 5; // Если нужно выделить сегмент, то scaleSize не равен нулю и отображается увеличенным

        segment
            .select('path')
            .transition()
            .duration(200)
            .attr('d', (d, i) => DonutHelper.getArcGeneratorObject(blockSize, margin, donutThickness)
                .outerRadius(DonutHelper.getOuterRadius(margin, blockSize) + scaleSize)
                .innerRadius(DonutHelper.getOuterRadius(margin, blockSize) - donutThickness - scaleSize)(d, i));
    }

    public static highlight2DElements(block: Block, keyFieldName: string, keyValue: string, charts: TwoDimensionalChartModel[]): void {     
        this.remove2DElementsHighlighting(block, charts);

        charts.forEach(chart => {
            const elems = Helper.getChartElements(block, chart);
            if(chart.type === 'area' || chart.type === 'line') {
                elems.call(this.scaled, false);

                if(!chart.isSegmented)
                    elems.filter(d => d[keyFieldName] === keyValue)
                        .call(this.scaled, true);
                else 
                    elems.filter(d => d.data[keyFieldName] === keyValue)
                        .call(this.scaled, true);
            } else {
                let selectedElems: Selection<BaseType, DataRow, BaseType, unknown>;

                if(!chart.isSegmented)
                    selectedElems = elems.filter(d => d[keyFieldName] === keyValue)
                        .call(this.scaled, true);
                else 
                    selectedElems = elems.filter(d => d.data[keyFieldName] === keyValue)
                        .call(this.scaled, true);

                        
                let clones = selectedElems.clone();
                clones.classed('bar-clone', true);
                clones.classed('chart-element-highlight', true);
                selectedElems.style('filter', 'url(#shadow)');
            }
        });
    }

    public static remove2DElementsHighlighting(block: Block, charts: TwoDimensionalChartModel[]): void {
        charts.forEach(chart => {
            const elems = Helper.getChartElements(block, chart);
            if(chart.type === 'area' || chart.type === 'line') {
                elems.call(this.scaled, false);
            } else {
                elems.classed('chart-element-highlight', false);
                elems.style('filter', null);
                block.getChartBlock()
                    .selectAll('.bar-clone')
                    .remove();
            }
        });
    }

    private static scaled(elementSelection: Selection<BaseType, DataRow, BaseType, unknown>, isScaled: boolean) : void {
        elementSelection.nodes().forEach(node => {
            interrupt(node);
        });
        
        elementSelection
            .transition()
            .duration(50)
            .ease(easeLinear)
            .attr('r', isScaled ? 6 : 4)
            .style('stroke-width', (isScaled ? 4.3 : 3) + 'px')
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
        } else {
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

    public static getTipBoxAttributes(margin: BlockMargin, blockSize: Size): TipBoxAttributes {
        const pad = 5;
        return {
            x: margin.left - pad,
            y: margin.top - pad,
            width: blockSize.width - margin.left - margin.right + pad * 2,
            height: blockSize.height - margin.top - margin.bottom + pad * 2,
        }
    }

    public static getTooltipLineAttributes(scaleKey: AxisScale<any>, margin: BlockMargin, key: string, chartOrientation: ChartOrientation, blockSize: Size): TooltipLineAttributes {
        const convexSize = 5;        
        const attributes: TooltipLineAttributes = {
            x1: 0, x2: 0, y1: 0, y2: 0, strokeLinecap: 'round'
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

    public static getBarHighlighterAttrs(barSelection: Selection<BaseType, DataRow, BaseType, unknown>, chartOrientation: ChartOrientation, blockSize: Size, margin: BlockMargin, isGrouped: boolean): BarHighlighterAttrs {
        const pad = 3;
        if(!isGrouped) {
            if(chartOrientation === 'vertical')
                return {
                    x: Helper.getSelectionNumericAttr(barSelection, 'x') - pad,
                    y: margin.top,
                    width: Helper.getSelectionNumericAttr(barSelection, 'width') + pad * 2,
                    height: blockSize.height - margin.top - margin.bottom
                }
            return {
                x: margin.left,
                y: Helper.getSelectionNumericAttr(barSelection, 'y') - pad,
                width: blockSize.width - margin.left - margin.right,
                height: Helper.getSelectionNumericAttr(barSelection, 'height') + pad * 2
            }
        }

        const firstBar = barSelection.filter(':first-child');
        const lastBar = barSelection.filter(':last-child');
        if(chartOrientation === 'vertical')
            return {
                x: Helper.getSelectionNumericAttr(firstBar, 'x') - pad,
                y: margin.top,
                width: Helper.getSelectionNumericAttr(lastBar, 'x') + Helper.getSelectionNumericAttr(lastBar, 'width') - Helper.getSelectionNumericAttr(firstBar, 'x') + pad * 2,
                height: blockSize.height - margin.top - margin.bottom
            }
        return {
            x: margin.left,
            y: Helper.getSelectionNumericAttr(firstBar, 'y') - pad,
            width: blockSize.width - margin.left - margin.right,
            height: Helper.getSelectionNumericAttr(lastBar, 'y') + Helper.getSelectionNumericAttr(lastBar, 'height') - Helper.getSelectionNumericAttr(firstBar, 'y') + pad * 2
        }
    }

    private static fillTooltipContent(tooltipContentBlock: Selection<BaseType, unknown, BaseType, unknown>, markColor: string, tooltipText: string): void {
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
            .html(tooltipText)
            .style('white-space', 'nowrap');

        if (textBlock.node().getBoundingClientRect().width >= 450)
            textBlock.style('white-space', 'normal');
    }

    private static getTooltipItemText(data: DataSource, dataOptions: OptionsModelData, keyValue: string, valueField: Field, showKey: boolean = true): string {
        const row = data[dataOptions.dataSource].find(d => d[dataOptions.keyField.name] === keyValue);
        let text: string;
        if(showKey)
            text = `${row[dataOptions.keyField.name]} - ${ValueFormatter.formatValue(valueField.format, row[valueField.name])}`;
        else
            text = `<span class="tooltip-field-title">${(valueField as TwoDimensionalValueField).title + ' ' || ''}</span><span class="tooltip-field-value">${ValueFormatter.formatValue(valueField.format, row[valueField.name])}</span>`;
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