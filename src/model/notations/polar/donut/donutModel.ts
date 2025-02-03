import { MdtChartsDataRow, PolarChart } from "../../../../config/config";
import { DonutOptionsCanvas, MdtChartsDonutThicknessOptions } from "../../../../designer/designerConfig";
import { DonutAggregatorModel, DonutChartSettings, DonutThicknessOptions } from "../../../model";
import { DonutAggregatorService } from "./donutAggregatorService";
import { DonutThicknessService } from "./donutThicknessService";

export class DonutModel {
    private thicknessService = new DonutThicknessService();
    private aggregatorService = new DonutAggregatorService();

    getSettings(
        settingsFromConfig: DonutOptionsCanvas,
        chartOptions: PolarChart,
        rawDataRows: MdtChartsDataRow[]
    ): DonutChartSettings {
        return {
            padAngle: settingsFromConfig.padAngle,
            thickness: this.getThicknessOptions(settingsFromConfig.thickness),
            aggregator: this.getAggregatorOptions(settingsFromConfig, chartOptions, rawDataRows)
        };
    }

    private getThicknessOptions(settingsFromConfig: MdtChartsDonutThicknessOptions): DonutThicknessOptions {
        return {
            unit: this.thicknessService.getUnit(settingsFromConfig),
            max: this.thicknessService.valueToNumber(settingsFromConfig.max),
            min: this.thicknessService.valueToNumber(settingsFromConfig.min),
            value: this.thicknessService.valueToNumber(settingsFromConfig.value)
        };
    }

    private getAggregatorOptions(
        settingsFromConfig: DonutOptionsCanvas,
        chartOptions: PolarChart,
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
