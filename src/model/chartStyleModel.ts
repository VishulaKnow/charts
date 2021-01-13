import * as d3 from "d3";
import { color, Color } from "d3";
import { ChartNotation, ChartType } from "../config/config";

export class ChartStyleModel
{
    static getCssClasses(chartType: ChartType, chartIndex: number): string[] {
        const cssClasses = [`chart-${chartIndex}`];
        if(chartType === 'line')
            cssClasses.concat(['line']);
        if(chartType === 'bar')
            cssClasses.concat(['bar']);
        if(chartType === 'area')
            cssClasses.concat(['area']);
        if(chartType === 'donut')
            cssClasses.concat(['donut']);
        return cssClasses
    }
    
    static getElementColorPallete(palette: Color[], notation: ChartNotation, elementsAmount: number, chartIndex: number = 0): Color[] {
        if(notation === '2d') {
            const generatedPalette = this.generatePalette(palette, elementsAmount);
            return [generatedPalette[chartIndex % palette.length]];
        }  
        else {
            const generatedPalette = this.generatePalette(palette, elementsAmount);
            return generatedPalette;
        }    
    }

    static generatePalette(baseColors: Color[], colorAmount: number): Color[] {
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