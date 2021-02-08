import * as d3 from "d3";
import { color, Color } from "d3";
import { TwoDimensionalChartType } from "../config/config";
import { ChartColors } from "../designer/designerConfig";
import { ChartStyle } from "./model";

export class ChartStyleModel
{
    public static get2DChartStyle(palette: ChartColors, chartsAmount: number, chartType: TwoDimensionalChartType, chartsValueFieldsAmount: number[], chartIndex: number, isSegmented: boolean): ChartStyle {
        return {
            elementColors: this.get2DElementColorPalette(palette, chartsValueFieldsAmount, chartIndex, isSegmented),
            opacity: this.getChartOpacity(chartsAmount, chartType)
        }
    }

    public static getChartStyle(palette: ChartColors, elementsAmount: number): ChartStyle {
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

    private static get2DElementColorPalette(palette: ChartColors, chartsValueFieldAmount: number[], chartIndex: number, isSegmented: boolean): Color[] {
        let startIndex = 0;
        for(let i = 0; i < chartIndex; i++) {
            startIndex += chartsValueFieldAmount[i]
        }
        
        return this.getColorsForFields(palette, startIndex, chartsValueFieldAmount[chartIndex], chartIndex, isSegmented);
    }   

    private static getElementColorPalette(palette: ChartColors, elementsAmount: number): Color[] {
        return this.getArrayOfProperties(palette, 0, elementsAmount);    
    }

    private static getColorsForFields(palette: ChartColors, startIndex: number, valueFieldsAmount: number, chartIndex: number, isSegmented: boolean): Color[] {
        if(!isSegmented) {
            return this.getArrayOfProperties(palette, startIndex, valueFieldsAmount);
        }

        const colors: Color[] = [];
        for(let i = 0; i < valueFieldsAmount; i++)
            colors.push(color(this.getPropertyByIndex(palette, 14 * chartIndex + 5 - i)));
        return colors;
    }

    private static getArrayOfProperties(palette: ChartColors, startIndex: number, amount: number): Color[] {
        const arr: Color[] = [];
        for(let i = startIndex; i < startIndex + amount; i++) {
            arr.push(color(this.getPropertyByIndex(palette, 14 * i + 5)))
        }
        return arr;
    }

    private static getPropertyByIndex(obj: any, index: number): string {
        let i = 0;
        for(let key in obj) {
            if(i === index)
                return obj[key];
            i++;
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