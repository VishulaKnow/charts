import * as chroma from "chroma-js";
import { TwoDimensionalChartType } from "../config/config";
import { ChartStyleConfig } from "../designer/designerConfig";
import { ChartStyle } from "./model";
import { ModelHelper } from "./modelHelper";

export class ChartStyleModel {
    private static safeColorsAmount = 8;

    public static getCssClasses(chartIndex: number): string[] {
        const cssClasses = [`chart-${chartIndex}`];
        return cssClasses;
    }

    public static get2DChartStyle(chartsAmount: number, chartType: TwoDimensionalChartType, chartsFieldsAmounts: number[], chartIndex: number, isSegmented: boolean, styleConfig: ChartStyleConfig): ChartStyle {
        const startIndex = this.getStartIndex(chartIndex, chartsFieldsAmounts);
        const palette = this.getColorSet(styleConfig.baseColors, ModelHelper.getSum(chartsFieldsAmounts));

        return {
            elementColors: this.getChartColors(palette, chartsFieldsAmounts[chartIndex], startIndex, chartType),
            opacity: this.getChartOpacity(chartsAmount, chartType, chartsFieldsAmounts[chartIndex], isSegmented)
        }
    }

    public static getChartStyle(elementsAmount: number, styleConfig: ChartStyleConfig): ChartStyle {
        return {
            elementColors: this.getColorSet(styleConfig.baseColors, elementsAmount),
            opacity: 1
        }
    }

    private static getChartColors(palette: string[], elementsAmount: number, startIndex: number, chartType: TwoDimensionalChartType): string[] {
        const selectedColors = palette.slice(startIndex, startIndex + elementsAmount);
        if (chartType !== 'line')
            return selectedColors;

        for (let i = 0; i < selectedColors.length; i++) {
            selectedColors[i] = chroma.mix(selectedColors[i], 'white', 0.2).saturate(3).hex();
        }
        return selectedColors;
    }

    private static getChartOpacity(chartsLength: number, chartType: TwoDimensionalChartType, chartsValueFieldAmount: number, isSegmented: boolean): number {
        if (chartType === 'area' && (chartsLength > 1 || chartsValueFieldAmount > 1) && !isSegmented)
            return 0.5; // combined area with other charts has 0.5 opacity
        return 1;
    }

    private static getColorSet(baseColors: string[], elementsAmount: number): string[] {
        return chroma.scale(baseColors).mode('rgb').colors(elementsAmount <= 1 ? 2 : elementsAmount);

        // if (elementsAmount < this.safeColorsAmount)
        //     return chroma.scale(baseColors).mode('rgb').colors(elementsAmount <= 1 ? 2 : elementsAmount);

        // const basePalette = chroma.scale(baseColors).mode('rgb').colors(this.safeColorsAmount);
        // const finalPalette = [...basePalette];
        // for (let i = this.safeColorsAmount; i < elementsAmount; i++) {
        //     finalPalette.push(this.resetColor(i, basePalette[i % this.safeColorsAmount]));
        // }
        // return finalPalette;
    }

    private static resetColor(index: number, baseColor: string): string {
        let color = chroma(baseColor)
            .luminance(0.5)
            .saturate(1.5 - Math.floor(index / this.safeColorsAmount) * 0.1)
            .hex();

        color = chroma(color).set('hsl.h', chroma(color).get('hsl.h') + Math.floor(index / this.safeColorsAmount) * 2).hex();
        return color;
    }

    private static getStartIndex(chartIndex: number, chartsFieldsAmounts: number[]): number {
        let startIndex = 0;
        for (let i = 0; i < chartIndex; i++) {
            startIndex += chartsFieldsAmounts[i];
        }
        return startIndex;
    }
}