import { TwoDimensionalChartType } from "../config/config";
import { ChartStyleConfig } from "../designer/designerConfig";
import { ChartStyle } from "./model";

const colorsTemplate = require('../assets/materialColors.json');

interface ChartColors {
    colorName: string;
    colorPalette: ColorSet;
}

interface ColorSet {
    [colorCode: string]: string;
}

export class ChartStyleModel {
    private static palette = colorsTemplate.colors;

    public static getCssClasses(chartIndex: number): string[] {
        const cssClasses = [`chart-${chartIndex}`];
        return cssClasses;
    }

    public static get2DChartStyle(chartsAmount: number, chartType: TwoDimensionalChartType, chartsValueFieldAmount: number[], chartIndex: number, isSegmented: boolean, chartStyleConfig: ChartStyleConfig): ChartStyle {
        let startIndex = 0;
        for (let i = 0; i < chartIndex; i++) {
            startIndex += chartsValueFieldAmount[i];
        }
        const valueFieldsAmount = chartsValueFieldAmount[chartIndex];

        return {
            elementColors: this.getColors(this.palette, valueFieldsAmount, startIndex, chartStyleConfig),
            opacity: this.getChartOpacity(chartsAmount, chartType, chartsValueFieldAmount[chartIndex], isSegmented)
        }
    }

    public static getChartStyle(elementsAmount: number, chartStyleConfig: ChartStyleConfig): ChartStyle {
        return {
            elementColors: this.getColors(this.palette, elementsAmount, 0, chartStyleConfig),
            opacity: 1
        }
    }

    private static getChartOpacity(chartsLength: number, chartType: TwoDimensionalChartType, chartsValueFieldAmount: number, isSegmented: boolean): number {
        if (chartType === 'area' && (chartsLength > 1 || chartsValueFieldAmount > 1) && !isSegmented)
            return 0.5; // combined area with other charts has 0.5 opacity
        return 1;
    }

    private static getColors(palette: ChartColors[], elementsAmount: number, startIndex: number, styleConfig: ChartStyleConfig): string[] {
        if (elementsAmount <= 0)
            return [];

        const selectedColors: string[] = [];
        const baseColorIndex = this.getColorIndex(palette, styleConfig.baseColor);
        startIndex *= styleConfig.step;
        do {
            const indexOfDesired = (baseColorIndex + startIndex + selectedColors.length * styleConfig.step) % palette.length;
            selectedColors.push(this.getBaseColor(palette[indexOfDesired].colorPalette));
        } while (selectedColors.length !== elementsAmount);

        return selectedColors;
    }

    private static getBaseColor(colorSet: ColorSet): string {
        let firstKey: string;
        for (let key in colorSet) {
            firstKey = firstKey || key;
            if (key === "500")
                return colorSet[key];
        }
        return colorSet[firstKey];
    }

    private static getColorIndex(palette: ChartColors[], baseColorName: string): number {
        const index = palette.findIndex(colorObject => colorObject.colorName === baseColorName);
        return index === -1 ? 0 : index;
    }
}