import { MdtChartsPolarOptions, MdtChartsConfig, MdtChartsField } from "../../../../config/config";
import { BaseConfigReader } from "../baseConfigReader";

export class PolarConfigReader implements BaseConfigReader {
	private options: MdtChartsPolarOptions;

	constructor(config: MdtChartsConfig) {
		this.options = config.options as MdtChartsPolarOptions;
	}

	getValueFields(): MdtChartsField[] {
		return [this.options.chart.data.valueField];
	}
}
