import { AxisLabelFormatter, MdtChartsConfig, MdtChartsField, MdtChartsFieldName, MdtChartsPolarOptions, MdtChartsTwoDimensionalOptions, TwoDimensionalChartType } from "../../config/config";
import { DesignerConfig } from "../../designer/designerConfig";
import { DataRepositoryModel } from "../../model/modelInstance/dataModel/dataRepository";
import { getResolvedDomain } from "../../model/featuresModel/scaleModel/scaleDomainService";

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

    calculateBiggestValueAndDecremented(repository: DataRepositoryModel) {
        const domain = this.options.axis.value.domain;
        const resolvedDomain = getResolvedDomain(domain, repository.getRawRows())

        if (resolvedDomain && resolvedDomain.end !== -1) {
            return [resolvedDomain.end, resolvedDomain.end - 1];
        }

        return repository.getBiggestValueAndDecremented(this.getFieldsBySegments());
    }

    getFieldsBySegments(): MdtChartsFieldName[][] {
        const segments: MdtChartsFieldName[][] = [];
        this.options.charts.forEach(chart => {
            if (!chart.isSegmented) segments.push(...chart.data.valueFields.map(vf => [vf.name]));
            else segments.push(...[chart.data.valueFields.map(vf => vf.name)])
        });
        return segments;
    }

    getAxisLabelFormatter(): AxisLabelFormatter {
        if (this.options.axis.value.labels?.format) return this.options.axis.value.labels?.format;
        const valueFieldFormat = this.options.charts[0].data.valueFields[0].format;
        return (v) => this.designerConfig.dataFormat.formatters(v, { type: valueFieldFormat });
    }

    getLegendItemInfo() {
        const info: { text: string; chartType: TwoDimensionalChartType }[] = [];
        this.options.charts.forEach(c => {
            c.data.valueFields.forEach(vf => {
                info.push({ text: vf.title ?? vf.name, chartType: c.type });
            });
        });
        return info;
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