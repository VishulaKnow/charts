import { Color } from "d3";

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

    public static setChartElementColor(elements: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, colorPalette: Color[], styleType: StyleColorType): void {
        elements.style(styleType, colorPalette[0].toString());
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

    public static getCssClassesArray(cssClass: string): string[] {
        return cssClass.split(' ');
    }
}