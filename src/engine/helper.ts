import { Color } from "d3";
import { TwoDimensionalChartType } from "../config/config";

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

    public static setChartColor(elements: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, colorPalette: Color[], chartType: TwoDimensionalChartType): void {
        if(chartType === 'line') {
            elements.style('stroke', colorPalette[0].toString())
        } else {
            elements.style('fill', colorPalette[0].toString())
        }
    }

    public static cropLabels(labelBlocks: d3.Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>, maxWidth: number): void {
        for(let i = 0; i < labelBlocks.nodes().length; i++) {
            if(labelBlocks.nodes()[i].getBBox().width > maxWidth) {
                const text = labelBlocks.nodes()[i].textContent;
                let textLength = text.length;
                while(labelBlocks.nodes()[i].getBBox().width > maxWidth && textLength > 0) {
                    labelBlocks.nodes()[i].textContent = text.substring(0, --textLength) + '...';
                }
                if(textLength === 0)
                    labelBlocks.nodes()[i].textContent = '';
            }
        }
    }
}