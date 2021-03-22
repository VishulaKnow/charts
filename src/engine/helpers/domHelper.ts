
import { Selection, BaseType } from 'd3-selection'
import { ChartStyle, DataRow, TwoDimensionalChartModel } from "../../model/model";
import { Block } from "../block/block";
import { MarkDot } from "../features/markDots/markDot";
import { Bar } from "../twoDimensionalNotation/bar/bar";

type StyleColorType = 'fill' | 'stroke';

export enum SelectionCondition {
    Include, Exclude
}

export class DomHelper {
    public static setCssClasses(elem: Selection<BaseType, unknown, any, unknown>, cssClasses: string[]): void {
        cssClasses.forEach(cssClass => {
            elem.classed(cssClass, true);
        });
    }

    public static get2DChartElements(block: Block, chart: TwoDimensionalChartModel): Selection<BaseType, DataRow, BaseType, unknown> {
        if (chart.type === 'line' || chart.type === 'area')
            return MarkDot.getMarkDotForChart(block, chart.cssClasses);
        else
            return Bar.getAllBarItems(block, chart.cssClasses);
    }

    public static getCssPropertyValue(node: Element, propertyName: string): string {
        return window.getComputedStyle(node).getPropertyValue(propertyName);
    }

    public static getSelectionNumericAttr(selection: Selection<BaseType, unknown, BaseType, unknown>, attrName: string): number {
        return parseFloat(selection.attr(attrName));
    }

    public static setChartStyle(elements: Selection<BaseType, unknown, BaseType, unknown>, chartStyle: ChartStyle, fieldIndex: number, styleType: StyleColorType): void {
        this.setChartElementColor(elements, chartStyle.elementColors, fieldIndex, styleType);
        this.setChartOpacity(elements, chartStyle.opacity);
    }

    public static setChartElementColor(elements: Selection<BaseType, unknown, BaseType, unknown>, colorPalette: string[], fieldIndex: number, styleType: StyleColorType): void {
        elements.style(styleType, colorPalette[fieldIndex % colorPalette.length]);
    }

    public static cropSvgLabels(labelBlocks: Selection<SVGGraphicsElement, unknown, BaseType, unknown>, maxWidth: number): void {
        labelBlocks.nodes().forEach(node => {
            if (node.getBBox().width > maxWidth) {
                const text = node.textContent;
                let textLength = text.length;
                while (node.getBBox().width > maxWidth && textLength > 0) {
                    node.textContent = text.substring(0, --textLength) + '...';
                }
                if (textLength === 0)
                    node.textContent = '';
            }
        });
    }

    public static get2DElementsByKey(initialSelection: Selection<BaseType, DataRow, BaseType, unknown>, isSegmented: boolean, keyFieldName: string, keyValue: string): Selection<BaseType, DataRow, BaseType, unknown> {
        if (!isSegmented)
            return initialSelection.filter(d => d[keyFieldName] === keyValue);
        else
            return initialSelection.filter(d => d.data[keyFieldName] === keyValue);
    }

    public static getChartElementsByKeys<T extends BaseType>(initialSelection: Selection<T, DataRow, BaseType, unknown>, dataWrapped: boolean, keyFieldName: string, keyValues: string[], condition: SelectionCondition): Selection<T, any, BaseType, unknown> {
        if (!dataWrapped) {
            return initialSelection.filter(d => {
                if (condition === SelectionCondition.Exclude) {
                    return keyValues.findIndex(kv => kv === d[keyFieldName]) === -1;
                }
                return keyValues.findIndex(kv => kv === d[keyFieldName]) !== -1;
            });
        } else {
            return initialSelection.filter(d => {
                if (condition === SelectionCondition.Exclude) {
                    return keyValues.findIndex(kv => kv === d.data[keyFieldName]) === -1;
                }
                return keyValues.findIndex(kv => kv === d.data[keyFieldName]) !== -1;
            });
        }
    }

    private static setChartOpacity(elements: Selection<BaseType, unknown, BaseType, unknown>, opacity: number): void {
        elements.attr('opacity', opacity);
    }
}