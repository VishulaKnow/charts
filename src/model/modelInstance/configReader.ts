import {
	AxisLabelFormatter,
	AxisNumberDomain,
	MdtChartsConfig,
	MdtChartsField,
	MdtChartsFieldName,
	MdtChartsPolarOptions,
	MdtChartsTwoDimensionalChart,
	MdtChartsTwoDimensionalOptions,
	NumberAxisOptions,
	NumberSecondaryAxisOptions,
	TwoDimensionalChartType,
	TwoDimensionalValueGroup,
	ValueLabelsFormatter
} from "../../config/config";
import { DesignerConfig } from "../../designer/designerConfig";
import { DataRepositoryModel } from "../../model/modelInstance/dataModel/dataRepository";
import { getResolvedDomain } from "../../model/featuresModel/scaleModel/scaleDomainService";
import { ValueLabelsStyleModel } from "../model";

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
		this.options.charts.forEach((chart) => {
			fields.push(...chart.data.valueFields);
		});
		return fields;
	}

	getBiggestValueAndDecremented(repository: DataRepositoryModel) {
		return this.calculateBiggestValueAndDecremented(
			repository,
			this.options.axis.value.domain,
			this.getFieldsBySegments("main")
		);
	}

	getBiggestValueAndDecrementedSecondary(repository: DataRepositoryModel) {
		return this.calculateBiggestValueAndDecremented(
			repository,
			this.options.axis.valueSecondary.domain,
			this.getFieldsBySegments("secondary")
		);
	}

	getFieldsBySegments(valueGroup: TwoDimensionalValueGroup): MdtChartsFieldName[][] {
		const segments: MdtChartsFieldName[][] = [];
		const valueGroupCharts: MdtChartsTwoDimensionalChart[] = this.options.charts.filter(
			(chart) => (chart.data.valueGroup ?? "main") === valueGroup
		);

		valueGroupCharts.forEach((chart) => {
			if (!chart.isSegmented) segments.push(...chart.data.valueFields.map((vf) => [vf.name]));
			else segments.push(...[chart.data.valueFields.map((vf) => vf.name)]);
		});

		return segments;
	}

	getAxisLabelFormatter(): AxisLabelFormatter {
		return this.calculateAxisLabelFormatter(this.options.axis.value);
	}

	getSecondaryAxisLabelFormatter(): AxisLabelFormatter {
		return this.calculateAxisLabelFormatter(this.options.axis.valueSecondary);
	}

	getLegendItemInfo() {
		const info: { text: string; chartType: TwoDimensionalChartType }[] = [];
		this.options.charts.forEach((c) => {
			c.data.valueFields.forEach((vf) => {
				info.push({ text: vf.title ?? vf.name, chartType: c.type });
			});
		});
		return info;
	}

	containsSecondaryAxis(): boolean {
		return (
			!!this.options.axis.valueSecondary &&
			this.options.charts.some((chart) => chart.data.valueGroup === "secondary")
		);
	}

	getValueLabelFormatterForChart(chartIndex: number): ValueLabelsFormatter {
		const chart = this.options.charts[chartIndex];
		const axis = this.options.axis;

		if (chart.valueLabels?.format) return chart.valueLabels.format;

		if (chart.data.valueGroup === "secondary") {
			if (axis.valueSecondary.labels?.format) return axis.valueSecondary.labels.format;
			else if (axis.value.labels?.format) return axis.value.labels.format;
		} else if (axis.value.labels?.format) return axis.value.labels.format;

		const valueFieldFormat = chart.data.valueFields[0].format;
		return (v) => this.designerConfig.dataFormat.formatters(v, { type: valueFieldFormat });
	}

	calculateDefaultAxisLabelFormatter(): AxisLabelFormatter {
		const valueFieldFormat = this.options.charts[0].data.valueFields[0].format;
		return (v) => this.designerConfig.dataFormat.formatters(v, { type: valueFieldFormat });
	}

	areValueLabelsOn(): boolean {
		return this.options.charts.some((chart) => chart.valueLabels?.on);
	}

	areValueLabelsNeedIncreaseMargin(): boolean {
		return !this.options.charts.every((chart) => chart.valueLabels?.position?.mode === "center");
	}

	getValueLabelsStyleModel(): ValueLabelsStyleModel {
		return {
			fontSize: this.options.valueLabels?.style?.fontSize ?? 10,
			color: this.options.valueLabels?.style?.color ?? "rgba(68, 68, 68, 0.5)",
			cssClassName: this.options.valueLabels?.style?.cssClassName
		};
	}

	private calculateBiggestValueAndDecremented(
		repository: DataRepositoryModel,
		domain: AxisNumberDomain,
		fields: MdtChartsFieldName[][]
	): number[] {
		const resolvedDomain = getResolvedDomain(domain, repository.getRawRows());

		if (resolvedDomain && resolvedDomain.end !== -1) {
			return [resolvedDomain.end, resolvedDomain.end - 1];
		}

		return repository.getBiggestValueAndDecremented(fields);
	}

	private calculateAxisLabelFormatter(axisValue: NumberAxisOptions | NumberSecondaryAxisOptions): AxisLabelFormatter {
		if (axisValue.labels?.format) return axisValue.labels?.format;
		return this.calculateDefaultAxisLabelFormatter();
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
