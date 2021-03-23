import * as chroma from "chroma-js";
import { TwoDimensionalChartType } from "../config/config";
import { ChartStyleConfig } from "../designer/designerConfig";
import { ChartStyle } from "./model";
import { ModelHelper } from "./modelHelper";

export class ChartStyleModel {
    public static getCssClasses(chartIndex: number): string[] {
        const cssClasses = [`chart-${chartIndex}`];
        return cssClasses;
    }

    public static get2DChartStyle(chartsAmount: number, chartType: TwoDimensionalChartType, chartsFieldsAmounts: number[], chartIndex: number, isSegmented: boolean, styleConfig: ChartStyleConfig): ChartStyle {
        const startIndex = this.getStartIndex(chartIndex, chartsFieldsAmounts);
        const palette = chroma.scale(styleConfig.baseColors).mode('rgb').colors(ModelHelper.getSum(chartsFieldsAmounts) <= 1 ? 2 : ModelHelper.getSum(chartsFieldsAmounts));

        return {
            elementColors: this.getColors(palette, chartsFieldsAmounts[chartIndex], startIndex, chartType),
            opacity: this.getChartOpacity(chartsAmount, chartType, chartsFieldsAmounts[chartIndex], isSegmented)
        }
    }

    public static getChartStyle(elementsAmount: number, styleConfig: ChartStyleConfig): ChartStyle {
        const palette = chroma.scale(styleConfig.baseColors).mode('rgb').colors(elementsAmount <= 1 ? 2 : elementsAmount);

        return {
            elementColors: palette,
            opacity: 1
        }
    }

    private static getChartOpacity(chartsLength: number, chartType: TwoDimensionalChartType, chartsValueFieldAmount: number, isSegmented: boolean): number {
        if (chartType === 'area' && (chartsLength > 1 || chartsValueFieldAmount > 1) && !isSegmented)
            return 0.5; // combined area with other charts has 0.5 opacity
        return 1;
    }

    private static getColors(palette: string[], elementsAmount: number, startIndex: number, chartType: TwoDimensionalChartType): string[] {
        const selectedColors = palette.slice(startIndex, startIndex + elementsAmount);
        if (chartType !== 'line')
            return selectedColors;

        for (let i = 0; i < selectedColors.length; i++) {
            selectedColors[i] = chroma.mix(selectedColors[i], 'white', 0.2).saturate(3).hex();
        }
        return selectedColors;
    }

    private static getStartIndex(chartIndex: number, chartsFieldsAmounts: number[]): number {
        let startIndex = 0;
        for (let i = 0; i < chartIndex; i++) {
            startIndex += chartsFieldsAmounts[i];
        }
        return startIndex;
    }
}