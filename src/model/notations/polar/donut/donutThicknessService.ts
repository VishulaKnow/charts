import { Size } from "../../../../config/config";
import { MdtChartsDonutThicknessOptions } from "../../../../designer/designerConfig";
import { getPxPercentUnitByValue } from "../../../helpers/unitsFromConfigReader";
import { BlockMargin, DonutChartSettings, DonutThicknessUnit } from "../../../model";

const MIN_CHART_BLOCK_SIZE_FOR_MAX_THICKNESS = 400;

export class DonutThicknessService {
	private defaultUnit: DonutThicknessUnit = "px";

	getUnit(settingsFromConfig: MdtChartsDonutThicknessOptions): DonutThicknessUnit {
		if (settingsFromConfig.value) return getPxPercentUnitByValue(settingsFromConfig.value);

		const minUnit = getPxPercentUnitByValue(settingsFromConfig.min);
		const maxUnit = getPxPercentUnitByValue(settingsFromConfig.max);

		return minUnit === maxUnit ? minUnit : this.defaultUnit;
	}

	valueToNumber(value: string | number) {
		if (typeof value === "number") return value;
		return parseInt(value);
	}
}

export class DonutThicknessCalculator {
	public static getThickness(donutSettings: DonutChartSettings, blockSize: Size, margin: BlockMargin): number {
		const thicknessOpts = donutSettings.thickness;
		const chartBlockSize = this.getChartBlockSize(blockSize, margin);

		if (thicknessOpts.value)
			return this.getThicknessByUnit(chartBlockSize, thicknessOpts.value, thicknessOpts.unit);

		if (Math.min(chartBlockSize.width, chartBlockSize.height) > MIN_CHART_BLOCK_SIZE_FOR_MAX_THICKNESS)
			return this.getThicknessByUnit(chartBlockSize, thicknessOpts.max, thicknessOpts.unit);
		return this.getThicknessByUnit(chartBlockSize, thicknessOpts.min, thicknessOpts.unit);
	}

	private static getThicknessByUnit(chartBlockSize: Size, valueInPx: number, unit: DonutThicknessUnit) {
		if (unit === "px") return valueInPx;

		const minSideSize = Math.min(chartBlockSize.width, chartBlockSize.height);
		return (minSideSize / 2) * (valueInPx / 100);
	}

	private static getChartBlockSize(blockSize: Size, margin: BlockMargin): Size {
		return {
			height: blockSize.height - margin.top - margin.bottom,
			width: blockSize.width - margin.left - margin.right
		};
	}
}
