import { PolarChart } from "../../../../config/config";
import { DonutOptionsCanvas, MdtChartsDonutThicknessOptions } from "../../../../designer/designerConfig";
import { DonutChartSettings, DonutThicknessOptions } from "../../../model";
import { DonutThicknessService } from "./donutThicknessService";

export class DonutModel {
    private thicknessService = new DonutThicknessService();

    getSettings(settingsFromConfig: DonutOptionsCanvas, chartOptions: PolarChart): DonutChartSettings {
        return {
            padAngle: settingsFromConfig.padAngle,
            thickness: this.getThicknessOptions(settingsFromConfig.thickness),
            aggregator: {
                margin: settingsFromConfig.aggregatorPad,
                text: chartOptions.aggregator.text
            }
        }
    }

    private getThicknessOptions(settingsFromConfig: MdtChartsDonutThicknessOptions): DonutThicknessOptions {
        return {
            unit: this.thicknessService.getUnit(settingsFromConfig),
            max: this.thicknessService.valueToNumber(settingsFromConfig.max),
            min: this.thicknessService.valueToNumber(settingsFromConfig.min),
            value: this.thicknessService.valueToNumber(settingsFromConfig.value),
        }
    }
}