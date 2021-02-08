import * as d3 from "d3";
import { color, Color } from "d3";
import { TwoDimensionalChart, TwoDimensionalChartType } from "../config/config";
import { ChartStyle } from "./model";

export class ChartStyleModel
{
    public static get2DChartStyle(palette: Color[], chartsAmount: number, chartType: TwoDimensionalChartType, chartsValueFieldsAmount: number[], chartIndex: number): ChartStyle {
        return {
            elementColors: this.get2DElementColorPalette(palette, chartsValueFieldsAmount, chartIndex),
            opacity: this.getChartOpacity(chartsAmount, chartType)
        }
    }

    public static getChartStyle(palette: Color[], elementsAmount: number): ChartStyle {
        return {
            elementColors: this.getElementColorPalette(palette, elementsAmount),
            opacity: 1
        }
    }

    public static getCssClasses(chartIndex: number): string[] {
        const cssClasses = [`chart-${chartIndex}`];

        return cssClasses;
    }

    private static getChartOpacity(chartsLength: number, chartType: TwoDimensionalChartType): number {
        if(chartsLength > 1 && chartType === 'area')
            return 0.5; // combined area with other charts has 0.5 opacity
        return 1;
    }

    private static get2DElementColorPalette(palette: Color[], chartsValueFieldAmount: number[], chartIndex: number): Color[] {
        let startIndex = 0;
        for(let i = 0; i < chartIndex; i++) {
            startIndex += chartsValueFieldAmount[i]
        }
        
        return palette.slice(startIndex, startIndex + chartsValueFieldAmount[chartIndex]);
    }   

    private static getElementColorPalette(palette: Color[], elementsAmount: number): Color[] {
        // return this.generatePalette(palette, elementsAmount);    
        return palette;    
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