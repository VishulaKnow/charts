import { BlockMargin, MdtChartsConfig, MdtChartsField, MdtChartsSunburstOptions } from "../../../../config/config";
import { DesignerConfig } from "../../../../designer/designerConfig";
import { BaseConfigReader } from "../baseConfigReader";

export class SunburstConfigReader implements BaseConfigReader {
	private readonly options: MdtChartsSunburstOptions;

	constructor(
		config: MdtChartsConfig,
		private readonly designerConfig: DesignerConfig
	) {
		this.options = config.options as MdtChartsSunburstOptions;
	}

	getFieldInLegend() {
		return this.options.levels[0].data.keyField.name;
	}

	getValueFields(): MdtChartsField[] {
		return [this.options.data.valueField];
	}

	getChartBlockMargin(): BlockMargin {
		return {
			top: 5,
			bottom: 5,
			left: 5,
			right: 5,
			...this.designerConfig.canvas.chartBlockMargin
		};
	}
}
