import { Color } from "d3";


export class Helper
{
    static setCssClasses(elem: any, cssClasses: string[]): void {
        cssClasses.forEach(cssClass => {
            elem.classed(cssClass, true);
        })
    }

    static getCssClassesLine(cssClasses: string[]): string {
        return '.' + cssClasses.join('.');
    }

    static setChartColor(elements: any, colorPalette: Color[], chartType: 'line' | 'bar' | 'area'): void {
        if(chartType === 'line') {
            elements.style('stroke', colorPalette[0])
        } else {
            elements.style('fill', colorPalette[0])
        }
    }

    static cropLabels(labelBlocks: any, maxWidth: number) {
        for(let i = 0; i < labelBlocks.nodes().length; i++) {
            if(labelBlocks.nodes()[i].getBBox().width > maxWidth) {
                const text: string = labelBlocks.nodes()[i].textContent;
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