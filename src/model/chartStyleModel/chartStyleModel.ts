import * as chroma from "chroma-js";
import { ChartStyleConfig } from "../../designer/designerConfig";
import { ChartStyle } from "../model";

export class ChartStyleModelService {
	private static standardColors = ["#209DE3", "#FF3131", "#FFBA00", "#20B078"];

	static getCssClasses(chartIndex: number): string[] {
		const cssClasses = [`chart-${chartIndex}`];
		return cssClasses;
	}

	static getChartStyle(elementsAmount: number, styleConfig: ChartStyleConfig): ChartStyle {
		const baseColors = this.checkAndGet(styleConfig.baseColors);
		return {
			elementColors: this.getColorSet(baseColors, elementsAmount),
			opacity: 1
		};
	}

	static getColorSet(baseColors: string[], elementsAmount: number): string[] {
		return chroma
			.scale(baseColors)
			.mode("rgb")
			.domain([0, 0.55, 0.75, 1])
			.colors(elementsAmount <= 1 ? 2 : elementsAmount);
	}

	static checkAndGet(baseColors: string[]): string[] {
		if (
			baseColors.length === 0 ||
			baseColors.filter((color) => color === "rgba(0, 0, 0, 0)" || !color).length > 0
		) {
			return this.standardColors;
		}
		return baseColors;
	}
}
