import * as d3 from "d3";
import { color, Color } from "d3";
import { TwoDimensionalChartType } from "../config/config";
import { ChartStyle } from "./model";

const colorJson = require('../assets/materialColors.json');

interface ChartColors {
    [colorName: string]: string
}


export class ChartStyleModel
{
    private static palette = colorJson.colors;

    public static getCssClasses(chartIndex: number): string[] {
        const cssClasses = [`chart-${chartIndex}`];
        return cssClasses;
    }

    public static get2DChartStyle(chartsAmount: number, chartType: TwoDimensionalChartType, chartsValueFieldsAmount: number[], chartIndex: number, isSegmented: boolean): ChartStyle {
        return {
            elementColors: this.get2DElementColorPalette(this.palette, chartsValueFieldsAmount, chartIndex, isSegmented),
            opacity: this.getChartOpacity(chartsAmount, chartType, chartsValueFieldsAmount[chartIndex], isSegmented)
        }
    }

    public static getChartStyle(elementsAmount: number): ChartStyle {
        return {
            elementColors: this.getElementColorPalette(this.palette, elementsAmount),
            opacity: 1
        }
    }

    private static getChartOpacity(chartsLength: number, chartType: TwoDimensionalChartType, chartsValueFieldAmount: number, isSegmented: boolean): number {
        if(chartType === 'area' && (chartsLength > 1 || chartsValueFieldAmount > 1) && !isSegmented)
            return 0.5; // combined area with other charts has 0.5 opacity
        return 1;
    }

    private static get2DElementColorPalette(palette: ChartColors[], chartsValueFieldAmount: number[], chartIndex: number, isSegmented: boolean): Color[] {
        let startIndex = 0;
        for(let i = 0; i < chartIndex; i++) {
            startIndex += chartsValueFieldAmount[i]
        }

        return this.getColorsForFields(palette, startIndex, chartsValueFieldAmount[chartIndex], chartIndex, isSegmented);
    }   

    private static getElementColorPalette(palette: ChartColors[], elementsAmount: number): Color[] {
        return palette.slice(0, elementsAmount).map(colors => color(this.getBaseColor(colors)));   
    }

    private static getColorsForFields(palette: ChartColors[], startIndex: number, valueFieldsAmount: number, chartIndex: number, isSegmented: boolean): Color[] {
        if(!isSegmented) {
            return this.getColorsWithAmountStep(palette, valueFieldsAmount, startIndex)
                .map(elementColor => color(elementColor));
        }

        for(let i = 0; i < valueFieldsAmount; i++)
            return this.getColorsSetByBase(palette[startIndex], valueFieldsAmount).map(colors => color(colors))
    }

    private static getColorsWithAmountStep(palette: ChartColors[], elementColors: number, startIndex: number): string[] {
        const step = Math.floor(19 / elementColors);
        const colors: string[] = [];
        let currentIndex = startIndex;
        for(let  i = 0; i < elementColors; i++) {
            colors.push(this.getBaseColor(palette[currentIndex % 19]));
            currentIndex += step;
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