import { TwoDimConfigReader } from "./twoDimConfigReader";
import { MdtChartsConfig, MdtChartsTwoDimensionalOptions } from "../../../../config/config";
import { DesignerConfig, Formatter } from "../../../../designer/designerConfig";

describe("getFieldsBySegments", () => {
	let reader: TwoDimConfigReader;
	let config: any;

	beforeEach(() => {
		config = {
			canvas: null,
			options: {
				charts: [
					{
						type: "bar",
						isSegmented: true,
						embeddedLabels: null,
						markers: null,
						tooltip: null,
						data: {
							valueFields: [
								{ name: "Val1", title: "", format: "" },
								{ name: "Val2", title: "", format: "" }
							],
							valueGroup: "secondary"
						}
					},
					{
						type: "line",
						isSegmented: false,
						embeddedLabels: null,
						markers: null,
						tooltip: null,
						data: {
							valueFields: [
								{ name: "Val3", title: "", format: "" },
								{ name: "Val4", title: "", format: "" }
							],
							valueGroup: "main"
						}
					}
				],
				axis: {
					key: {
						position: "start"
					}
				}
			}
		};
		reader = new TwoDimConfigReader(config, null);
	});

	test('should return array of charts valueFields only with valueGroup equals "main"', () => {
		const result = reader.getFieldsBySegments("main");
		expect(result).toEqual([["Val3"], ["Val4"]]);
	});

	test("should return array of all valueFields in charts", () => {
		config.options.charts.forEach((chart: any) => {
			delete chart.data.valueGroup;
		});

		const result = reader.getFieldsBySegments("main");
		expect(result).toEqual([["Val1", "Val2"], ["Val3"], ["Val4"]]);
	});

	test("should return array of all valueFields in charts", () => {
		config.options.charts.forEach((chart: any) => {
			chart.data.valueGroup = "main";
		});

		const result = reader.getFieldsBySegments("main");
		expect(result).toEqual([["Val1", "Val2"], ["Val3"], ["Val4"]]);
	});
});

describe("getValueLabelsFormatter", () => {
	let config: MdtChartsConfig;
	let options: MdtChartsTwoDimensionalOptions;
	let reader: TwoDimConfigReader;
	let designerConfig: DesignerConfig;
	let formatters: Formatter;

	beforeEach(() => {
		options = {
			type: "2d",
			axis: {
				key: null,
				value: {
					domain: null,
					position: "start",
					ticks: { flag: false },
					visibility: false,
					labels: {
						format: () => ""
					}
				},
				valueSecondary: {
					domain: null,
					ticks: { flag: false },
					visibility: false,
					labels: {
						format: () => ""
					}
				}
			},
			charts: [
				{
					type: "bar",
					data: {
						valueFields: [{ name: "price", title: "", format: "money" }]
					},
					markers: null,
					barStyles: null,
					embeddedLabels: null,
					isSegmented: null,
					lineStyles: null,
					valueLabels: {
						on: true,
						format: (value) => ""
					}
				}
			],
			title: "",
			selectable: true,
			additionalElements: null,
			legend: null,
			orientation: null,
			data: null,
			tooltip: null
		};
		config = {
			canvas: null,
			options
		};
		formatters = jest.fn((value: any, options: { type?: string; title?: string; empty?: string } = {}) => {
			return `Formatted ${value} as ${options.type}`;
		});
		designerConfig = {
			canvas: null,
			chartStyle: null,
			transitions: null,
			dataFormat: {
				formatters
			}
		};
		reader = new TwoDimConfigReader(config, designerConfig);
	});

	test("should return valueLabels formatter", () => {
		const formatFn = reader.getValueLabelFormatterForChart(0);
		expect(formatFn).toBe(options.charts[0].valueLabels.format);
	});

	test("should return mainAxis labels formatter", () => {
		options.charts[0].valueLabels.format = null;

		const formatFn = reader.getValueLabelFormatterForChart(0);
		expect(formatFn).toBe(options.axis.value.labels.format);
	});

	test("should return secondaryAxis labels formatter", () => {
		options.charts[0].valueLabels.format = null;
		options.charts[0].data.valueGroup = "secondary";

		const formatFn = reader.getValueLabelFormatterForChart(0);
		expect(formatFn).toBe(options.axis.valueSecondary.labels.format);
	});

	test("should return designerConfig formatter", () => {
		options.charts[0].valueLabels.format = null;
		options.axis.value.labels = null;
		options.axis.valueSecondary.labels = null;

		const formatFn = reader.getValueLabelFormatterForChart(0);

		const testValue = 100;
		const expectedFormatType = "money";
		const expectedFormattedValue = `Formatted ${testValue} as ${expectedFormatType}`;

		const result = formatFn(testValue);

		expect(typeof formatFn).toBe("function");
		expect(designerConfig.dataFormat.formatters).toHaveBeenCalledWith(testValue, { type: expectedFormatType });
		expect(result).toBe(expectedFormattedValue);
	});
});
