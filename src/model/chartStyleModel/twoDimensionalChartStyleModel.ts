import * as chroma from "chroma-js";
import { MdtChartsTwoDimensionalChart, TwoDimensionalChartType } from "../../config/config";
import { ChartStyleConfig } from "../../designer/designerConfig";
import { ChartStyle } from "../model";
import { ModelHelper } from "../helpers/modelHelper";
import { ChartStyleModelService } from "./chartStyleModel";

export class TwoDimensionalChartStyleModel {
    private service = new TwoDimensionalChartStyleService();

    constructor(private charts: MdtChartsTwoDimensionalChart[], private chartStyleConfig: ChartStyleConfig) { }

    getChartStyle(chart: MdtChartsTwoDimensionalChart, chartIndex: number): ChartStyle {
        const fieldsAmounts = this.getChartsValueFieldsAmounts();
        return {
            elementColors: this.service.getChartColors(chart, this.chartStyleConfig, fieldsAmounts, chartIndex),
            opacity: this.service.getChartOpacity(this.charts.length, chart.type, fieldsAmounts[chartIndex], chart.isSegmented)
        }
    }

    private getChartsValueFieldsAmounts() {
        return this.charts.map(chart => chart.data.valueFields.length);
    }
}

export class TwoDimensionalChartStyleService {
    getChartColors(chart: MdtChartsTwoDimensionalChart, styleConfig: ChartStyleConfig, chartsFieldsAmounts: number[], chartIndex: number) {
        const generatedColors = this.generateNewChartColors(chart.type, styleConfig, chartsFieldsAmounts, chartIndex);

        chart.data.valueFields.forEach((field, fieldIndex) => {
            if (field.color) generatedColors[fieldIndex] = field.color;
        });

        return generatedColors;
    }

    getChartOpacity(chartsLength: number, chartType: TwoDimensionalChartType, chartsValueFieldAmount: number, isChartSegmented: boolean): number {
        if (chartType === 'area' && this.isMoreThanOneValueFieldOnCanvas(chartsLength, chartsValueFieldAmount) && !isChartSegmented)
            return 0.5; // combined area with other charts has 0.5 opacity
        return 1;
    }

    private generateNewChartColors(chartType: TwoDimensionalChartType, styleConfig: ChartStyleConfig, chartsFieldsAmounts: number[], chartIndex: number): string[] {
        const startIndex = this.getStartIndex(chartIndex, chartsFieldsAmounts);
        const baseColors = ChartStyleModelService.checkAndGet(styleConfig.baseColors);
        const palette = ChartStyleModelService.getColorSet(baseColors, ModelHelper.getSum(chartsFieldsAmounts));
        const elementsAmount = chartsFieldsAmounts[chartIndex];

        const selectedColors = palette.slice(startIndex, startIndex + elementsAmount);

        if (chartType !== 'line')
            return selectedColors;

        this.makeColorsBrighter(selectedColors);

        return selectedColors;
    }

    private isMoreThanOneValueFieldOnCanvas(chartsLength: number, chartsValueFieldAmount: number) {
        return (chartsLength > 1 || chartsValueFieldAmount > 1)
    }

    private makeColorsBrighter(initialColors: string[]) {
        for (let i = 0; i < initialColors.length; i++) {
            initialColors[i] = chroma.mix(initialColors[i], 'white', 0.2).saturate(3).hex();
        }
    }

    private getStartIndex(chartIndex: number, chartsFieldsAmounts: number[]): number {
        let startIndex = 0;
        for (let i = 0; i < chartIndex; i++) {
            startIndex += chartsFieldsAmounts[i];
        }
        return startIndex;
    }
}