import {
	BlockMargin,
	MdtChartsConfig,
	MdtChartsField,
	MdtChartsSunburstLevel,
	MdtChartsSunburstOptions
} from "../../../../config/config";
import { DesignerConfig } from "../../../../designer/designerConfig";
import { BaseConfigReader } from "../baseConfigReader";

export class SunburstConfigReader implements BaseConfigReader {
	static createFromGlobalConfig(config: MdtChartsConfig, designerConfig: DesignerConfig): SunburstConfigReader {
		return new SunburstConfigReader(config.options as MdtChartsSunburstOptions, designerConfig);
	}

	constructor(
		public readonly options: MdtChartsSunburstOptions,
		private readonly designerConfig: DesignerConfig
	) {}

	getFieldsInLegend(): string[] {
		const levelsWithLegendTurnedOn = this.getLevelsWithLegendTurnedOn();
		return levelsWithLegendTurnedOn.map(({ level }) => level.data.keyField.name);
	}

	getLevelsWithLegendTurnedOn(): { level: MdtChartsSunburstLevel; levelIndex: number }[] {
		const levelsWithIndexes = this.options.levels.map((level, levelIndex) => ({ level, levelIndex }));
		const levelsWithLegendConfig = levelsWithIndexes.filter(({ level }) => level.legend?.show != null);
		if (levelsWithLegendConfig.length === 0) return [{ level: this.options.levels[0], levelIndex: 0 }];
		return levelsWithLegendConfig.filter(({ level }) => level.legend?.show);
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
