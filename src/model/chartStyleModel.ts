import * as d3 from "d3";
import { color, Color } from "d3";
import { ChartType, TwoDimensionalChart } from "../config/config";
import { ChartStyle } from "./model";

export class ChartStyleModel
{
    public static get2DChartStyle(palette: Color[], charts: TwoDimensionalChart[], chartIndex: number): ChartStyle {
        return {
            elementColors: this.get2DElementColorPalette(palette, charts, chartIndex),
            opacity: this.getChartOpacity(charts, chartIndex)
        }
    }

    public static getChartStyle(palette: Color[], elementsAmount: number): ChartStyle {
        return {
            elementColors: this.getElementColorPalette(palette, elementsAmount),
            opacity: 1
        }
    }

    public static getCssClasses(chartType: ChartType, chartIndex: number): string[] {
        const cssClasses = [`chart-${chartIndex}`];
        cssClasses.push(chartType);

        return cssClasses;
    }

    private static getChartOpacity(charts: TwoDimensionalChart[], chartIndex: number): number {
        if(charts.length > 1 && charts[chartIndex].type === 'area')
            return 0.5;
        return 1;
    }

    private static get2DElementColorPalette(palette: Color[], charts: TwoDimensionalChart[], chartIndex: number): Color[] {
        let startIndex = 0;
        for(let i = 0; i < chartIndex; i++) {
            startIndex += charts[i].data.valueField.length
        }
        
        return palette.slice(startIndex, startIndex + charts[chartIndex].data.valueField.length);
    }   

    private static getElementColorPalette(palette: Color[], elementsAmount: number): Color[] {
        return this.generatePalette(palette, elementsAmount);    
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