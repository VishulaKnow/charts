import * as d3 from "d3";
import { color, Color } from "d3";
import { TwoDimensionalChartType } from "../config/config";
import { ChartColors } from "../designer/designerConfig";
import { ChartStyle } from "./model";

export class ChartStyleModel
{
    public static get2DChartStyle(palette: ChartColors[], chartsAmount: number, chartType: TwoDimensionalChartType, chartsValueFieldsAmount: number[], chartIndex: number, isSegmented: boolean): ChartStyle {
        return {
            elementColors: this.get2DElementColorPalette(palette, chartsValueFieldsAmount, chartIndex, isSegmented),
            opacity: this.getChartOpacity(chartsAmount, chartType)
        }
    }

    public static getChartStyle(palette: ChartColors[], elementsAmount: number): ChartStyle {
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

    private static get2DElementColorPalette(palette: ChartColors[], chartsValueFieldAmount: number[], chartIndex: number, isSegmented: boolean): Color[] {
        let startIndex = 0;
        for(let i = 0; i < chartIndex; i++) {
            startIndex += chartsValueFieldAmount[i]
        }

        const result = this.getColorsForFields(palette, startIndex, chartsValueFieldAmount[chartIndex], chartIndex, isSegmented);
        return result;
    }   

    private static getElementColorPalette(palette: ChartColors[], elementsAmount: number): Color[] {
        return palette.slice(0, elementsAmount).map(colors => color(this.getBaseColor(colors)));   
    }

    private static getColorsForFields(palette: ChartColors[], startIndex: number, valueFieldsAmount: number, chartIndex: number, isSegmented: boolean): Color[] {
        if(!isSegmented) {
            return palette.slice(startIndex, startIndex + valueFieldsAmount).map(colors => color(this.getBaseColor(colors)));
        }

        for(let i = 0; i < valueFieldsAmount; i++)
            return this.getColorsSetByBase(palette[startIndex], valueFieldsAmount).map(colors => color(colors))
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

    private static getBaseColor(colorSet: ChartColors): string {
        let firstKey: string;
        for(let key in colorSet) {
            firstKey = firstKey || key;
            if(parseInt(key.split('-')[key.split('-').length - 1]) === 500)
                return colorSet[key];
        }
        return colorSet[firstKey];
    }

    private static getColorsSetByBase(colorSet: ChartColors, colorsAmount: number): string[] {
        const colors: string[] = [];
        for(let key in colorSet) {
            const colorCode = parseInt(key.split('-')[key.split('-').length - 1]);
            if(colorCode === 200 || colorCode === 300 || colorCode === 400 || colorCode === 500)
                colors.push(colorSet[key]);
        }

        colors.reverse();
        
        const chartColorSet: string[] = [];
        for(let i = 0; i < colorsAmount; i++) {
            chartColorSet.push(colors[i % colors.length]);
        }

        return chartColorSet;
    }
}