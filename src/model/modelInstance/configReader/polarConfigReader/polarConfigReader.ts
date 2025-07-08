import { MdtChartsPolarOptions, MdtChartsConfig, MdtChartsField } from "../../../../config/config";
import { DesignerConfig } from "../../../../designer/designerConfig";
import { BlockMargin } from "../../../model";
import { BaseConfigReader } from "../baseConfigReader";

export class PolarConfigReader implements BaseConfigReader {
	private options: MdtChartsPolarOptions;

	constructor(config: MdtChartsConfig, private readonly designerConfig: DesignerConfig) {
		this.options = config.options as MdtChartsPolarOptions;
	}

	getValueFields(): MdtChartsField[] {
		return [this.options.chart.data.valueField];
	}

	getChartBlockMargin(): BlockMargin {
		const defaultBlockMargin: BlockMargin = {
			top: 5,
			bottom: 5,
			left: 5,
			right: 5
		};
		return {
			...defaultBlockMargin,
			...this.designerConfig.canvas.chartBlockMargin
		};
	}
}
