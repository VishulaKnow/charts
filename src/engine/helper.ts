import { Color } from "d3";
import { ChartStyle } from "../model/model";

type StyleColorType = 'fill' | 'stroke';

export class Helper
{
    public static setCssClasses(elem: d3.Selection<d3.BaseType, unknown, any, unknown>, cssClasses: string[]): void {
        cssClasses.forEach(cssClass => {
            elem.classed(cssClass, true);
        });
    }

    public static getCssClassesLine(cssClasses: string[]): string {
        return '.' + cssClasses.join('.');
    }

    public static setChartStyle(elements: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, chartStyle: ChartStyle, fieldIndex: number, styleType: StyleColorType): void {
        this.setChartElementColor(elements, chartStyle.elementColors, fieldIndex, styleType);
        this.setChartOpacity(elements, chartStyle.opacity);
    }

    public static setChartElementColor(elements: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, colorPalette: Color[], fieldIndex: number, styleType: StyleColorType): void {
        elements.style(styleType, colorPalette[fieldIndex % colorPalette.length].toString());
    }

    public static cropLabels(labelBlocks: d3.Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>, maxWidth: number): void {
        labelBlocks.nodes().forEach(node => {
            if(node.getBBox().width > maxWidth) {
                const text = node.textContent;
                let textLength = text.length;
                while(node.getBBox().width > maxWidth && textLength > 0) {
                    node.textContent = text.substring(0, --textLength) + '...';
                }
                if(textLength === 0)
                    node.textContent = '';
            }
        });
    }

    public static getCssClassesArray(cssClass: string): string[] {
        return cssClass.split(' ');
    }

    public static getTranslateNumbers(transformValue: string): [number, number] {
        const translateNumbers = transformValue.substring(10, transformValue.length - 1).split(', ');
        const translateX = parseFloat(translateNumbers[0]);
        const translateY = parseFloat(translateNumbers[1]);

        return [translateX, translateY];
    }

    /**
     * get number from value format: '[number]px'
     * @param propertyValue 
     */
    public static getPXpropertyValue(propertyValue: string): number {
        return parseFloat(propertyValue.substr(0, propertyValue.length - 2));
    }

    public static getSumOfNumbers(numbers: number[]): number {
        let sum = 0;
        numbers.forEach(num => sum += num);
        return sum;
    }

    public static getPropertyValue(node: HTMLElement, propertyName: string): string {
        return window.getComputedStyle(node).getPropertyValue(propertyName);
    }

    private static setChartOpacity(elements: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, opacity: number): void {
        elements.attr('opacity', opacity);
    }
}