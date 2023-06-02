import { AxisLabelFormatter, MdtChartsConfig, MdtChartsField, MdtChartsPolarOptions, MdtChartsTwoDimensionalOptions } from "../../config/config";
import { DesignerConfig } from "../../designer/designerConfig";

interface BaseConfigReader {
    getValueFields(): MdtChartsField[];
}

export function getConfigReader(config: MdtChartsConfig, designerConfig: DesignerConfig): BaseConfigReader {
    if (config.options.type === "2d") return new TwoDimConfigReader(config, designerConfig);
    if (config.options.type === "polar") return new PolarConfigReader(config);
    throw new Error(`Config reader for type "${config.options.type}" not exists`);
}

export class TwoDimConfigReader implements BaseConfigReader {
    readonly options: MdtChartsTwoDimensionalOptions;

    constructor(config: MdtChartsConfig, private designerConfig: DesignerConfig) {
        this.options = config.options as MdtChartsTwoDimensionalOptions;
    }

    getValueFields(): MdtChartsField[] {
        const fields: MdtChartsField[] = [];
        this.options.charts.forEach(chart => {
            fields.push(...chart.data.valueFields);
        });
        return fields;
    }

    getAxisLabelFormatter(): AxisLabelFormatter {
        if (this.options.axis.value.labels?.format) return this.options.axis.value.labels?.format;
        const valueFieldFormat = this.options.charts[0].data.valueFields[0].format;
        return (v) => this.designerConfig.dataFormat.formatters(v, { type: valueFieldFormat });
    }
}

export class PolarConfigReader implements BaseConfigReader {
    private options: MdtChartsPolarOptions;

    constructor(config: MdtChartsConfig) {
        this.options = config.options as MdtChartsPolarOptions;
    }

    getValueFields(): MdtChartsField[] {
        return [this.options.chart.data.valueField];
    }
}