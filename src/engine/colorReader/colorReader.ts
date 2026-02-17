import { MdtChartsColorField, MdtChartsDataRow } from "../../config/config";
import { DonutChartModel } from "../../model/model";

export class ColorReaderClass {
	getChartColorField(chart: DonutChartModel) {
		return chart.data.colorField;
	}

	isNeedReadFromData(chart: DonutChartModel) {
		return !!this.getChartColorField(chart);
	}
}

export const ColorReader = new ColorReaderClass();
