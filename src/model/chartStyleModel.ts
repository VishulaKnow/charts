import * as d3 from "d3";
import { color, Color } from "d3";
import { ChartNotation, ChartType, TwoDimensionalChart } from "../config/config";

export class ChartStyleModel
{
    public static getCssClasses(chartType: ChartType, chartIndex: number): string[] {
        const cssClasses = [`chart-${chartIndex}`];
        cssClasses.push(chartType);

        return cssClasses;
    }

    public static get2DElementColorPalette(palette: Color[], charts: TwoDimensionalChart[], chartIndex: number): Color[] {
        let startIndex = 0;
        for(let i = 0; i < chartIndex; i++) {
            startIndex += charts[i].data.valueField.length
        }
        
        return palette.slice(startIndex, startIndex + charts[chartIndex].data.valueField.length);
    }   

    public static getElementColorPalette(palette: Color[], notation: ChartNotation, elementsAmount: number, chartIndex: number = 0): Color[] {
        if(notation === 'interval') {
            return palette;
        }  
        else {
            const generatedPalette = this.generatePalette(palette, elementsAmount);
            return generatedPalette;
        }    
    }

    private static generatePalette(baseColors: Color[], colorAmount: number): Color[] {
        const hslColor = d3.hsl(baseColors[0].toString());
        let step = 360 / colorAmount;
        if(step < 31)
            step = 31;
        const colors = [];
        for(let i = 0; i < colorAmount; i++) {
            colors.push(color(hslColor));
            hslColor.h += step;
        }
        return colors;
    }
}