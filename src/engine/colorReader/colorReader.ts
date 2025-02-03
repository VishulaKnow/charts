import { MdtChartsColorField, MdtChartsDataRow } from "../../config/config";
import { PolarChartModel } from "../../model/model";

export class ColorReaderClass {
	getColorForArc(row: MdtChartsDataRow, chart: PolarChartModel, arcIndex: number) {
		if (chart.data.colorField) {
			return this.getColorFromData(row, chart.data.colorField);
		}
		return this.getColorFromPalette(chart.style.elementColors, arcIndex);
	}

	getChartColorField(chart: PolarChartModel) {
		return chart.data.colorField;
	}

	isNeedReadFromData(chart: PolarChartModel) {
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
