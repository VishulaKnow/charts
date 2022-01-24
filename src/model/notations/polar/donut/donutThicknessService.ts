import { MdtChartsDonutThicknessOptions } from "../../../../designer/designerConfig";
import { DonutThicknessUnit } from "../../../model";

export class DonutThicknessService {
    getUnit(settingsFromConfig: MdtChartsDonutThicknessOptions): DonutThicknessUnit {
        if (settingsFromConfig.value) return this.getUnitByValue(settingsFromConfig.value);

        const minUnit = this.getUnitByValue(settingsFromConfig.min);
        const maxUnit = this.getUnitByValue(settingsFromConfig.max);

        return minUnit === maxUnit ? minUnit : "px";
    }

    valueToNumber(value: string | number) {
        if (typeof value === "number") return value;
        return parseInt(value);
    }

    private getUnitByValue(value: string | number): DonutThicknessUnit {
        if (typeof value !== "string") return "px";
        return this.getLastUnitFromString(value);
    }

    private getLastUnitFromString(value: string): DonutThicknessUnit {
        let resultUnit: DonutThicknessUnit = "px";

        (<DonutThicknessUnit[]>["%", "px"]).forEach(unit => {
            if (value.endsWith(unit)) resultUnit = unit;
        });

        return resultUnit;
    }
}