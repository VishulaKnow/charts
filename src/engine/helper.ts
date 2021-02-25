import { Color } from "d3-color";
import { Selection, BaseType } from 'd3-selection'
import { ChartStyle, DataRow, TwoDimensionalChartModel } from "../model/model";
import { Block } from "./block/block";
import { Dot } from "./features/lineDots/dot";
import { Bar } from "./twoDimensionalNotation/bar/bar";

type StyleColorType = 'fill' | 'stroke';

export class Helper {
    public static setCssClasses(elem: Selection<BaseType, unknown, any, unknown>, cssClasses: string[]): void {
        cssClasses.forEach(cssClass => {
            elem.classed(cssClass, true);
        });
    }

    /**
     * Возвращает все CSS-классы через точку. Используется для создания селектора для поиска
     * @param cssClasses 
     */
    public static getCssClassesLine(cssClasses: string[]): string {
        return '.' + cssClasses.join('.');
    }

    public static setChartStyle(elements: Selection<BaseType, unknown, BaseType, unknown>, chartStyle: ChartStyle, fieldIndex: number, styleType: StyleColorType): void {
        this.setChartElementColor(elements, chartStyle.elementColors, fieldIndex, styleType);
        this.setChartOpacity(elements, chartStyle.opacity);
    }

    public static setChartElementColor(elements: Selection<BaseType, unknown, BaseType, unknown>, colorPalette: Color[], fieldIndex: number, styleType: StyleColorType): void {
        elements.style(styleType, colorPalette[fieldIndex % colorPalette.length].toString());
    }

    public static cropLabels(labelBlocks: Selection<SVGGraphicsElement, unknown, BaseType, unknown>, maxWidth: number): void {
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

    public static getCssClassesArray(cssClass: string): string[] {
        return cssClass.split(' ');
    }

    public static getTranslateNumbers(transformValue: string): [number, number] {
        if (!transformValue)
            return [0, 0];

        const translateNumbers = transformValue.substring(10, transformValue.length - 1).split(', ');
        const translateX = parseFloat(translateNumbers[0]);
        const translateY = parseFloat(translateNumbers[1]);

        return [translateX, translateY];
    }

    public static getSumOfNumbers(numbers: number[]): number {
        let sum = 0;
        numbers.forEach(num => sum += num);
        return sum;
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

    /**
     * Если значение больше лимитера, то возвращается лимитер, иначе возвращается само значение
     * @param value 
     * @param limiter 
     * @param isBigger Если параметр установлен true, лимитр возвращается, если он меньше значения, в противном случае - если больше
     */
    public static getValueWithLimiter<T>(value: T, limiter: T, isBigger: boolean): T {
        if(isBigger)
            return value > limiter ? limiter : value;
        return value < limiter ? limiter : value;
    }

    public static getCssClassesWithElementIndex(cssClasses: string[], index: number): string[] {
        return cssClasses.concat([`chart-element-${index}`]);
    }

    public static getChartElements(block: Block, chart: TwoDimensionalChartModel): Selection<BaseType, DataRow, BaseType, unknown> {
        if(chart.type === 'line' || chart.type === 'area')
            return Dot.getAllDots(block, chart.cssClasses);
        else
            return Bar.getAllBarItems(block, chart.cssClasses);
    }

    private static setChartOpacity(elements: Selection<BaseType, unknown, BaseType, unknown>, opacity: number): void {
        elements.attr('opacity', opacity);
    }
}