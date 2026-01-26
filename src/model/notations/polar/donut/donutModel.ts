import { MdtChartsDataRow, DonutChart, Size } from "../../../../config/config";
import { DonutOptionsCanvas, MdtChartsDonutThicknessOptions } from "../../../../designer/designerConfig";
import {
	BlockMargin,
	DonutAggregatorModel,
	DonutChartSettings,
	DonutChartTranslateModel,
	DonutThicknessOptions
} from "../../../model";
import { DonutAggregatorService } from "./donutAggregatorService";
import { DonutThicknessService } from "./donutThicknessService";

export class DonutModel {
	private thicknessService = new DonutThicknessService();
	private aggregatorService = new DonutAggregatorService();

	getSettings(
		settingsFromConfig: DonutOptionsCanvas,
		chartOptions: DonutChart,
		rawDataRows: MdtChartsDataRow[]
	): DonutChartSettings {
		return {
			padAngle: settingsFromConfig.padAngle,
			thickness: this.thicknessService.buildThicknessOptions(settingsFromConfig.thickness),
			aggregator: this.getAggregatorOptions(settingsFromConfig, chartOptions, rawDataRows)
		};
	}

	private getAggregatorOptions(
		settingsFromConfig: DonutOptionsCanvas,
		chartOptions: DonutChart,
		rawDataRows: MdtChartsDataRow[]
	): DonutAggregatorModel {
		return {
			margin: settingsFromConfig.aggregatorPad,
			content: this.aggregatorService.getContent(chartOptions.aggregator, {
				rows: rawDataRows,
				valueFieldName: chartOptions.data.valueField.name
			}),
			valueFormat: chartOptions.data.valueField.format
		};
	}
}
