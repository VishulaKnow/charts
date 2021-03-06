import { Color } from "d3-color";
import { Selection, BaseType } from 'd3-selection'
import { ChartStyle, DataRow, TwoDimensionalChartModel } from "../model/model";
import { Block } from "./block/block";
import { MarkDotHelper } from "./features/markDots/markDotsHelper";
import { Bar } from "./twoDimensionalNotation/bar/bar";

type StyleColorType = 'fill' | 'stroke';

export enum SelectionCondition {
    Include, Exclude
}

//TODO: Подумать над разделением
export class Helper {
    public static setCssClasses(elem: Selection<BaseType, unknown, any, unknown>, cssClasses: string[]): void {
        cssClasses.forEach(cssClass => {
            elem.classed(cssClass, true);
        });
    }

    public static getCssClassesLine(cssClasses: string[]): string {
        return '.' + cssClasses.join('.');
    }

    public static getCssClassesArray(cssClass: string): string[] {
        return cssClass.split(' ');
    }

    public static getCssClassesWithElementIndex(cssClasses: string[], index: number): string[] {
        return cssClasses.concat([`chart-element-${index}`]);
    }

    public static setChartStyle(elements: Selection<BaseType, unknown, BaseType, unknown>, chartStyle: ChartStyle, fieldIndex: number, styleType: StyleColorType): void {
        this.setChartElementColor(elements, chartStyle.elementColors, fieldIndex, styleType);
        this.setChartOpacity(elements, chartStyle.opacity);
    }

    public static setChartElementColor(elements: Selection<BaseType, unknown, BaseType, unknown>, colorPalette: Color[], fieldIndex: number, styleType: StyleColorType): void {
        elements.style(styleType, colorPalette[fieldIndex % colorPalette.length].toString());
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

    public static getTranslateNumbers(transformValue: string): [number, number] {
        if (!transformValue)
            return [0, 0];

        const translateNumbers = transformValue.substring(10, transformValue.length - 1).split(', ');
        const translateX = parseFloat(translateNumbers[0]);
        const translateY = parseFloat(translateNumbers[1]);

        return [translateX, translateY];
    }

    public static getSumOfNumeric(numbers: number[]): number {
        return numbers.reduce((acc, value) => acc + value, 0);
    }

    public static getCssPropertyValue(node: Element, propertyName: string): string {
        return window.getComputedStyle(node).getPropertyValue(propertyName);
    }

    public static getPXValueFromString(propertyValue: string): number {
        return parseFloat(propertyValue);
    }

    public static getSelectionNumericAttr(selection: Selection<BaseType, unknown, BaseType, unknown>, attrName: string): number {
        return parseFloat(selection.attr(attrName));
    }

    public static getChartElements(block: Block, chart: TwoDimensionalChartModel): Selection<BaseType, DataRow, BaseType, unknown> {
        if (chart.type === 'line' || chart.type === 'area')
            return MarkDotHelper.getMarkDotForChart(block, chart.cssClasses);
        else
            return Bar.getAllBarItems(block, chart.cssClasses);
    }

    public static parseFormattedToNumber(value: string): number {
        return parseFloat(value.replace(',', '.').split(/\s/).join(''));
    }

    public static calcDigitsAfterDot(value: number): number {
        const valueInString = value.toString();
        const dotIndex = valueInString.lastIndexOf('.') === -1 ? valueInString.length : valueInString.lastIndexOf('.') + 1;
        return valueInString.substring(dotIndex).length;
    }

    public static checkDomainsEqual(oldDomain: string[], newDomain: string[]): boolean {
        if (oldDomain.length !== newDomain.length)
            return false;

        let isEqual = true;
        oldDomain.forEach((keyValue, index) => {
            if (keyValue !== newDomain[index])
                isEqual = false;
        });
        return isEqual;
    }

    public static get2DElementsByKey(initialSelection: Selection<BaseType, DataRow, BaseType, unknown>, isSegmented: boolean, keyFieldName: string, keyValue: string): Selection<BaseType, DataRow, BaseType, unknown> {
        if (!isSegmented)
            return initialSelection.filter(d => d[keyFieldName] === keyValue);
        else
            return initialSelection.filter(d => d.data[keyFieldName] === keyValue);
    }

    public static get2DElementsByKeys(initialSelection: Selection<BaseType, DataRow, BaseType, unknown>, isSegmented: boolean, keyFieldName: string, keyValues: string[], condition: SelectionCondition): Selection<BaseType, DataRow, BaseType, unknown> {
        if (!isSegmented) {
            return initialSelection.filter(d => {
                if (condition === SelectionCondition.Exclude) {
                    return keyValues.findIndex(kv => kv === d[keyFieldName]) === -1;
                }
                return keyValues.findIndex(kv => kv === d[keyFieldName]) !== -1;
            });
        }
        else {
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