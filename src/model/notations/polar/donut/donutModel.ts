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
			thickness: this.getThicknessOptions(settingsFromConfig.thickness),
			aggregator: this.getAggregatorOptions(settingsFromConfig, chartOptions, rawDataRows)
		};
	}

	public getTranslate(margin: BlockMargin, blockSize: Size): DonutChartTranslateModel {
		return {
			x: (blockSize.width - margin.left - margin.right) / 2 + margin.left,
			y: (blockSize.height - margin.top - margin.bottom) / 2 + margin.top
		};
	}

	private getThicknessOptions(settingsFromConfig: MdtChartsDonutThicknessOptions): DonutThicknessOptions {
		return {
			unit: this.thicknessService.getUnit(settingsFromConfig),
			max: this.thicknessService.valueToNumber(settingsFromConfig.max),
			min: this.thicknessService.valueToNumber(settingsFromConfig.min),
			value: settingsFromConfig.value ? this.thicknessService.valueToNumber(settingsFromConfig.value) : undefined
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
			})
		};
	}
}
