import { MdtChartsDonutThicknessOptions } from "../../../../designer/designerConfig";
import { getPxPercentUnitByValue } from "../../../helpers/unitsFromConfigReader";
import { DonutThicknessUnit } from "../../../model";

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
