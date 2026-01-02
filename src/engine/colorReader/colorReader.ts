import { MdtChartsColorField, MdtChartsDataRow } from "../../config/config";
import { DonutChartModel } from "../../model/model";

export class ColorReaderClass {
	getColorForArc(row: MdtChartsDataRow, chart: DonutChartModel, arcIndex: number) {
		if (chart.data.colorField) {
			return this.getColorFromData(row, chart.data.colorField);
		}
		return this.getColorFromPalette(chart.style.elementColors, arcIndex);
	}

	getChartColorField(chart: DonutChartModel) {
		return chart.data.colorField;
	}

	isNeedReadFromData(chart: DonutChartModel) {
		return !!this.getChartColorField(chart);
	}

	private getColorFromData(row: MdtChartsDataRow, colorField: MdtChartsColorField) {
		return row[colorField];
	}

	private getColorFromPalette(colorPalette: string[], arcIndex: number) {
		return colorPalette[arcIndex % colorPalette.length];
	}
}

export const ColorReader = new ColorReaderClass();
