import {
	ChartNotation,
	MdtChartsConfig,
	MdtChartsDataRow,
	MdtChartsDataSource,
	MdtChartsPolarOptions,
	MdtChartsTwoDimensionalChart,
	MdtChartsTwoDimensionalOptions,
	NumberDomain
} from "../config/config";
import { DesignerConfig, Transitions } from "../designer/designerConfig";

class ListenersHelper {
	static randInt(min: number, max: number): number {
		return Math.round(Math.random() * (max - min) + min);
	}
	static getCopy(obj: any) {
		const newObj: any = {};
		if (obj && typeof obj === "object") {
			for (let key in obj) {
				if (Array.isArray(obj[key])) {
					newObj[key] = this.getCopyOfArr(obj[key]);
				} else if (typeof obj[key] === "object") {
					newObj[key] = this.getCopy(obj[key]);
				} else {
					newObj[key] = obj[key];
				}
			}
		} else {
			return obj;
		}
		return newObj;
	}
	static getCopyOfArr(initial: any[]): any[] {
		const newArr: any[] = [];
		initial.forEach((d) => newArr.push(this.getCopy(d)));
		return newArr;
	}
	static getInputValue(selector: string): string {
		return (document.querySelector(selector) as HTMLInputElement)?.value;
	}
	static setInputValue(selector: string, value: any): void {
		(document.querySelector(selector) as HTMLInputElement).value = value.toString();
	}
	static setCheckboxValue(selector: string, value: boolean): void {
		(document.querySelector(selector) as HTMLInputElement).checked = value;
	}
}

class Listeners {
	private chart: ChartInstanceStorage;
	private config: MdtChartsConfig;
	private designerConfig: DesignerConfig;
	private data: MdtChartsDataSource;
	private transition: Transitions = {};
	constructor(
		chart: ChartInstanceStorage,
		config: MdtChartsConfig,
		designerConfig: DesignerConfig,
		data: MdtChartsDataSource
	) {
		this.chart = chart;
		this.config = config;
		this.designerConfig = designerConfig;
		this.data = data;

		this.setControlsValues();
		this.showControlsForNotation(this.config.options.type);
		this.setMainListeners();
		this.setDesignerListeners();
		this.setCommonListeners();
		this.setAxisListeners();
		this.set2DListeners();
	}

	private updateFull(): void {
		this.dropAxisDomain(this.config);
		this.chart.recreateChart(this.config, this.designerConfig, this.data);
	}
	private dropAxisDomain(config: MdtChartsConfig) {
		if (config.options.type === "2d") {
			(config.options.axis.value.domain as NumberDomain).end = -1;
			(config.options.axis.value.domain as NumberDomain).start = -1;
		}
	}

	private showControlsForNotation(notationType: ChartNotation): void {
		if (notationType === "2d") {
			(document.querySelector(".block-polar") as HTMLElement).style.display = "none";
			(document.querySelector(".block-2d") as HTMLElement).style.display = "block";
			(document.querySelector(".block-axis") as HTMLElement).style.display = "block";
		} else if (notationType === "polar") {
			(document.querySelector(".block-2d") as HTMLElement).style.display = "none";
			(document.querySelector(".block-polar") as HTMLElement).style.display = "block";
			(document.querySelector(".block-axis") as HTMLElement).style.display = "none";
		}
	}

	private getDataWithRandomValues(data: any, maxRand: number) {
		if (this.config.options.type === "2d")
			this.config.options.charts.forEach((chart: MdtChartsTwoDimensionalChart) => {
				data[config.options.data.dataSource].forEach((row: any) => {
					row[chart.data.valueFields[0].name] = ListenersHelper.randInt(0, maxRand);
				});
			});
		else if (this.config.options.type === "polar") {
			data[config.options.data.dataSource].forEach((row: any) => {
				if (this.config.options.type === "polar")
					row[this.config.options.chart.data.valueField.name] = ListenersHelper.randInt(0, maxRand);
			});
		}
		return data;
	}

	private getDataConfig(notationType: "2d" | "polar"): any {
		if (notationType === "2d") {
			return {
				valueFields: [
					{
						name: "price",
						format: "money",
						title: "Цена автомобилей на рынке"
					},
					{
						name: "count",
						format: "integer",
						title: "Количество автомобилей на душу населения"
					}
				]
			};
		} else if (notationType === "polar") {
			return {
				valueField: {
					name: "price",
					format: "money",
					title: "Количество"
				}
			};
		}
	}

	private changeConfigOptions(notationType: "2d" | "polar"): void {
		if (notationType === "2d") {
			const options: MdtChartsTwoDimensionalOptions = {
				title: this.config.options.title,
				legend: this.config.options.legend,
				selectable: this.config.options.selectable,
				orientation: ListenersHelper.getInputValue("#chart-orient") as "horizontal" | "vertical",
				type: notationType,
				data: {
					dataSource: "dataSet",
					keyField: {
						format: "string",
						name: "brand"
					}
				},
				charts: [
					{
						data: this.getDataConfig(notationType),
						isSegmented: false,
						type:
							ListenersHelper.getInputValue("#chart-2d-type") === "barLine"
								? "bar"
								: (ListenersHelper.getInputValue("#chart-2d-type") as "line" | "bar" | "area"),
						embeddedLabels: "none",
						markers: {
							show: true
						}
					}
				],
				axis: {
					key: {
						visibility: true,
						position: ListenersHelper.getInputValue("#key-axis-orient") as "start" | "end",
						ticks: {
							flag: false
						}
					},
					value: {
						visibility: true,
						domain: {
							start: -1,
							end: -1
						},
						position: ListenersHelper.getInputValue("#value-axis-orient") as "start" | "end",
						ticks: {
							flag: false
						}
					}
				},
				additionalElements: {
					gridLine: {
						flag: {
							value: true,
							key: false
						}
					}
				},
				tooltip: this.config.options.tooltip
			};
			this.config.options = options;
		} else if (notationType === "polar") {
			const options: MdtChartsPolarOptions = {
				title: this.config.options.title,
				legend: this.config.options.legend,
				selectable: this.config.options.selectable,
				data: {
					dataSource: "dataSet",
					keyField: {
						format: "string",
						name: "brand"
					}
				},
				type: notationType,
				chart: {
					data: this.getDataConfig(notationType),
					type: "donut"
				},
				tooltip: this.config.options.tooltip
			};
			this.config.options = options;
		}
		this.updateFull();
	}

	private change2DChartConfig(chartType: "bar" | "line" | "area" | "barLine"): void {
		const config = this.config;
		if (config.options.type === "2d") {
			if (chartType === "barLine" && config.options.charts.length === 1) {
				config.options.charts.push(ListenersHelper.getCopy(config.options.charts[0]));
				config.options.charts[0].type = "bar";
				config.options.charts[1].type = "line";
			} else if (chartType === "barLine" && config.options.charts.length === 2) {
				config.options.charts[0].type = "bar";
				config.options.charts[1].type = "line";
			} else if (chartType !== "barLine") {
				config.options.charts.splice(1, 1);
				config.options.charts[0].type = chartType;
			}
		}
	}

	private setMainListeners(): void {
		const thisClass = this;
		document.querySelector("#notation").addEventListener("change", function () {
			thisClass.showControlsForNotation(this.value);
			thisClass.changeConfigOptions(this.value);
			thisClass.setControlsValues();
		});
		document.querySelector("#block-width").addEventListener("input", function () {
			thisClass.config.canvas.size.width = parseFloat(ListenersHelper.getInputValue("#block-width")) || 0;
			thisClass.updateFull();
		});
		document.querySelector("#block-height").addEventListener("input", function () {
			thisClass.config.canvas.size.height = parseFloat(ListenersHelper.getInputValue("#block-height")) || 0;
			thisClass.updateFull();
		});
		document.querySelector("#wrapper-border").addEventListener("change", function () {
			if (this.checked) {
				thisClass.config.canvas.class += " outline";
			} else {
				thisClass.config.canvas.class = thisClass.config.canvas.class.replace("outline", "");
			}
			thisClass.updateFull();
		});
	}

	private setDesignerListeners(): void {
		const thisClass = this;
		document.querySelector("#tooltip-position").addEventListener("change", function () {
			designerConfig.elementsOptions.tooltip.position = this.value;
			thisClass.updateFull();
		});
		document.querySelector("#axis-label-width").addEventListener("input", function () {
			thisClass.designerConfig.canvas.axisLabel.maxSize.main = parseFloat(
				ListenersHelper.getInputValue("#axis-label-width")
			);
			thisClass.updateFull();
		});
		document.querySelector("#chart-block-margin-top").addEventListener("input", function () {
			thisClass.designerConfig.canvas.chartBlockMargin.top =
				parseFloat(ListenersHelper.getInputValue("#chart-block-margin-top")) || 0;
			thisClass.updateFull();
		});
		document.querySelector("#chart-block-margin-bottom").addEventListener("input", function () {
			thisClass.designerConfig.canvas.chartBlockMargin.bottom =
				parseFloat(ListenersHelper.getInputValue("#chart-block-margin-bottom")) || 0;
			thisClass.updateFull();
		});
		document.querySelector("#chart-block-margin-left").addEventListener("input", function () {
			thisClass.designerConfig.canvas.chartBlockMargin.left =
				parseFloat(ListenersHelper.getInputValue("#chart-block-margin-left")) || 0;
			thisClass.updateFull();
		});
		document.querySelector("#chart-block-margin-right").addEventListener("input", function () {
			thisClass.designerConfig.canvas.chartBlockMargin.right =
				parseFloat(ListenersHelper.getInputValue("#chart-block-margin-right")) || 0;
			thisClass.updateFull();
		});

		document.querySelector("#chart-block-transition-chartUpdate").addEventListener("input", function () {
			thisClass.transition.chartUpdate = parseFloat(
				ListenersHelper.getInputValue("#chart-block-transition-chartUpdate")
			);
			thisClass.designerConfig.transitions = thisClass.transition;
			thisClass.updateFull();
		});
		document.querySelector("#chart-block-transition-elementFadeOut").addEventListener("input", function () {
			thisClass.transition.elementFadeOut = parseFloat(
				ListenersHelper.getInputValue("#chart-block-transition-elementFadeOut")
			);
			thisClass.designerConfig.transitions = thisClass.transition;
			thisClass.updateFull();
		});
		document.querySelector("#chart-block-transition-tooltipSlide").addEventListener("input", function () {
			thisClass.transition.tooltipSlide = parseFloat(
				ListenersHelper.getInputValue("#chart-block-transition-tooltipSlide")
			);
			thisClass.designerConfig.transitions = thisClass.transition;
			thisClass.updateFull();
		});
		document.querySelector("#chart-block-transition-donutHover").addEventListener("input", function () {
			thisClass.transition.higlightedScale = parseFloat(
				ListenersHelper.getInputValue("#chart-block-transition-donutHover")
			);
			thisClass.designerConfig.transitions = thisClass.transition;
			thisClass.updateFull();
		});
		document.querySelector("#chart-block-transition-markerHover").addEventListener("input", function () {
			thisClass.transition.markerHover = parseFloat(
				ListenersHelper.getInputValue("#chart-block-transition-markerHover")
			);
			thisClass.designerConfig.transitions = thisClass.transition;
			thisClass.updateFull();
		});

		document.querySelector("#bar-distance").addEventListener("input", function () {
			thisClass.designerConfig.canvas.chartOptions.bar.barDistance =
				parseFloat(ListenersHelper.getInputValue("#bar-distance")) || 0;
			thisClass.updateFull();
		});
		document.querySelector("#min-bar-group-distance").addEventListener("input", function () {
			thisClass.designerConfig.canvas.chartOptions.bar.groupMinDistance = parseFloat(
				ListenersHelper.getInputValue("#min-bar-group-distance")
			);
			thisClass.updateFull();
		});
		document.querySelector("#max-bar-group-distance").addEventListener("input", function () {
			thisClass.designerConfig.canvas.chartOptions.bar.groupMaxDistance = parseFloat(
				ListenersHelper.getInputValue("#max-bar-group-distance")
			);
			thisClass.updateFull();
		});
		document.querySelector("#min-bar-size").addEventListener("input", function () {
			thisClass.designerConfig.canvas.chartOptions.bar.minBarWidth =
				parseFloat(ListenersHelper.getInputValue("#min-bar-size")) || 0;
			thisClass.updateFull();
		});
		document.querySelector("#max-bar-size").addEventListener("input", function () {
			thisClass.designerConfig.canvas.chartOptions.bar.maxBarWidth =
				parseFloat(ListenersHelper.getInputValue("#max-bar-size")) || 0;
			thisClass.updateFull();
		});
		document.querySelector("#pad-angle").addEventListener("input", function () {
			thisClass.designerConfig.canvas.chartOptions.donut.padAngle = parseFloat(
				ListenersHelper.getInputValue("#pad-angle")
			);
			thisClass.updateFull();
		});
		document.querySelector("#donut-min-thickness").addEventListener("input", function () {
			thisClass.designerConfig.canvas.chartOptions.donut.thickness.min = parseFloat(
				ListenersHelper.getInputValue("#donut-min-thickness")
			);
			thisClass.updateFull();
		});
		document.querySelector("#donut-max-thickness").addEventListener("input", function () {
			thisClass.designerConfig.canvas.chartOptions.donut.thickness.max = parseFloat(
				ListenersHelper.getInputValue("#donut-max-thickness")
			);
			thisClass.updateFull();
		});
		document.querySelector("#aggregator-pad").addEventListener("input", function () {
			thisClass.designerConfig.canvas.chartOptions.donut.aggregatorPad = parseFloat(this.value);
			thisClass.updateFull();
		});
		document.querySelector("#base-colors").addEventListener("keydown", function (e: any) {
			if (e.code === "Enter") {
				thisClass.designerConfig.chartStyle.baseColors = (this.value as string).split(", ");
				thisClass.updateFull();
			}
		});
	}

	private setCommonListeners(): void {
		const thisClass = this;
		const config = this.config;
		document.querySelector("#data-size").addEventListener("change", function () {
			if (config.options.type === "2d" || config.options.type === "polar") {
				config.options.data.dataSource = this.value === "normal" ? "dataSet" : "dataSet_large";
				thisClass.updateFull();
			}
		});
		document.querySelector("#legend").addEventListener("change", function () {
			config.options.legend.show = this.checked;
			thisClass.updateFull();
		});
		document.querySelector("#refresh").addEventListener("input", function () {
			DataUpdater.updateRefreshValue(parseFloat(ListenersHelper.getInputValue("#refresh")));
			thisClass.updateFull();
		});
		document.querySelector("#update-enabler").addEventListener("change", function () {
			DataUpdater.updateIsOn(this.checked);
			thisClass.updateFull();
			this.checked
				? document.querySelector("#refresh").setAttribute("disabled", "disabled")
				: document.querySelector("#refresh").removeAttribute("disabled");
		});
		const randomFunc = function () {
			if (config.options.type === "2d" || config.options.type === "polar") {
				const max = parseInt(ListenersHelper.getInputValue("#max-random-value")) || 120;
				const dataCopy = ListenersHelper.getCopy(thisClass.data);
				const newData = thisClass.getDataWithRandomValues(dataCopy, max);
				if (config.options.type === "2d" && (config.options.axis.value.domain as NumberDomain).end < max)
					(config.options.axis.value.domain as NumberDomain).end = -1;

				thisClass.chart.getChart().updateData(newData);
			}
		};
		document.querySelector(".btn-random").addEventListener("click", function () {
			randomFunc();
		});
		document.querySelector("#max-random-value").addEventListener("keydown", function (e: any) {
			if (e.code === "Enter") {
				randomFunc();
			}
		});
	}

	private set2DListeners(): void {
		const thisClass = this;
		const config = this.config;
		document.querySelector("#chart-2d-type").addEventListener("change", function () {
			if (config.options.type === "2d") {
				thisClass.change2DChartConfig(this.value);
				thisClass.updateFull();
			}
		});
		document.querySelector("#embedded-labels").addEventListener("change", function () {
			if (config.options.type === "2d") {
				config.options.charts.forEach((chart) => (chart.embeddedLabels = this.value));
				thisClass.updateFull();
			}
		});
		document.querySelector("#is-segmented").addEventListener("change", function () {
			if (config.options.type === "2d") {
				config.options.charts.forEach((chart) => {
					chart.isSegmented = this.checked;
				});
				thisClass.updateFull();
			}
		});
		document.querySelector("#markers").addEventListener("change", function () {
			if (config.options.type === "2d") {
				config.options.charts.forEach((chart) => {
					chart.markers.show = this.checked;
				});
				thisClass.updateFull();
			}
		});
	}

	private setAxisListeners(): void {
		const thisClass = this;
		const config = this.config;
		document.querySelector("#chart-orient").addEventListener("change", function () {
			if (config.options.type === "2d") {
				config.options.orientation = this.value;
				thisClass.updateFull();
			}
		});
		document.querySelector("#key-axis-orient").addEventListener("change", function () {
			if (config.options.type === "2d") {
				config.options.axis.key.position = this.value;
				thisClass.updateFull();
			}
		});
		document.querySelector("#key-axis-visibility").addEventListener("change", function () {
			if (config.options.type === "2d") {
				config.options.axis.key.visibility = this.checked;
				thisClass.updateFull();
			}
		});
		document.querySelector("#value-axis-orient").addEventListener("change", function () {
			if (config.options.type === "2d") {
				config.options.axis.value.position = this.value;
				thisClass.updateFull();
			}
		});
		document.querySelector("#value-axis-visibility").addEventListener("change", function () {
			if (config.options.type === "2d") {
				config.options.axis.value.visibility = this.checked;
				thisClass.updateFull();
			}
		});
		document.querySelector("#config-key-grid").addEventListener("change", function () {
			if (config.options.type === "2d") {
				config.options.additionalElements.gridLine.flag.key = this.checked;
				thisClass.updateFull();
			}
		});
		document.querySelector("#config-value-grid").addEventListener("change", function () {
			if (config.options.type === "2d") {
				config.options.additionalElements.gridLine.flag.value = this.checked;
				thisClass.updateFull();
			}
		});
		document.querySelector("#config-tick-key").addEventListener("change", function () {
			if (config.options.type === "2d") {
				config.options.axis.key.ticks.flag = this.checked;
				thisClass.updateFull();
			}
		});
		document.querySelector("#config-tick-value").addEventListener("change", function () {
			if (config.options.type === "2d") {
				config.options.axis.value.ticks.flag = this.checked;
				thisClass.updateFull();
			}
		});
	}

	private setControlsValues(): void {
		const config = this.config;
		const designerConfig = this.designerConfig;

		ListenersHelper.setInputValue("#notation", config.options.type);
		ListenersHelper.setInputValue("#block-width", config.canvas.size.width);
		ListenersHelper.setInputValue("#block-height", config.canvas.size.height);
		ListenersHelper.setCheckboxValue("#wrapper-border", config.canvas.class.includes("outline"));

		ListenersHelper.setCheckboxValue("#legend", (<any>config.options).legend?.show);
		ListenersHelper.setInputValue(
			"#data-size",
			config.options.data.dataSource.includes("large") ? "large" : "normal"
		);
		ListenersHelper.setInputValue("#axis-label-width", designerConfig.canvas.axisLabel.maxSize.main);
		ListenersHelper.setInputValue("#chart-block-margin-top", designerConfig.canvas.chartBlockMargin.top);
		ListenersHelper.setInputValue("#chart-block-margin-bottom", designerConfig.canvas.chartBlockMargin.bottom);
		ListenersHelper.setInputValue("#chart-block-margin-left", designerConfig.canvas.chartBlockMargin.left);
		ListenersHelper.setInputValue("#chart-block-margin-right", designerConfig.canvas.chartBlockMargin.right);
		ListenersHelper.setInputValue(
			"#min-bar-group-distance",
			designerConfig.canvas.chartOptions.bar.groupMinDistance
		);
		ListenersHelper.setInputValue(
			"#max-bar-group-distance",
			designerConfig.canvas.chartOptions.bar.groupMaxDistance
		);
		ListenersHelper.setInputValue("#bar-distance", designerConfig.canvas.chartOptions.bar.barDistance);
		ListenersHelper.setInputValue("#min-bar-size", designerConfig.canvas.chartOptions.bar.minBarWidth);
		ListenersHelper.setInputValue("#max-bar-size", designerConfig.canvas.chartOptions.bar.maxBarWidth);
		ListenersHelper.setInputValue("#base-colors", designerConfig.chartStyle.baseColors.join(", "));
		ListenersHelper.setInputValue("#pad-angle", designerConfig.canvas.chartOptions.donut.padAngle);
		ListenersHelper.setInputValue("#pad-angle", designerConfig.canvas.chartOptions.donut.padAngle);
		ListenersHelper.setInputValue("#aggregator-pad", designerConfig.canvas.chartOptions.donut.aggregatorPad);
		ListenersHelper.setInputValue("#donut-max-thickness", designerConfig.canvas.chartOptions.donut.thickness.max);
		ListenersHelper.setInputValue("#donut-min-thickness", designerConfig.canvas.chartOptions.donut.thickness.min);
		ListenersHelper.setInputValue("#tooltip-position", designerConfig.elementsOptions.tooltip.position);

		if (config.options.type === "2d") {
			ListenersHelper.setInputValue("#chart-2d-type", config.options.charts[0].type);
			ListenersHelper.setInputValue("#chart-orient", config.options.orientation);
			ListenersHelper.setInputValue("#key-axis-orient", config.options.axis.key.position);
			ListenersHelper.setInputValue("#value-axis-orient", config.options.axis.value.position);
			ListenersHelper.setCheckboxValue(
				"#config-value-grid",
				config.options.additionalElements.gridLine.flag.value
			);
			ListenersHelper.setCheckboxValue("#config-key-grid", config.options.additionalElements.gridLine.flag.key);
			ListenersHelper.setCheckboxValue("#config-tick-key", config.options.axis.key.ticks.flag);
			ListenersHelper.setCheckboxValue("#config-tick-value", config.options.axis.value.ticks.flag);
			ListenersHelper.setCheckboxValue(
				"#is-segmented",
				config.options.charts.findIndex((ch) => ch.isSegmented) !== -1
			);
			ListenersHelper.setCheckboxValue(
				"#markers",
				config.options.charts.findIndex((ch) => ch.markers.show) !== -1
			);
			ListenersHelper.setInputValue("#embedded-labels", config.options.charts[0].embeddedLabels);
			ListenersHelper.setCheckboxValue("#key-axis-visibility", config.options.axis.key.visibility);
			ListenersHelper.setCheckboxValue("#value-axis-visibility", config.options.axis.value.visibility);
		} else if (config.options.type === "polar") {
			ListenersHelper.setInputValue("#chart-polar-type", config.options.chart.type);
		}
	}
}

import "../style/fonts.css";
import "../style/charts-main.css";
import config from "./configsExamples/configExample";
import designerConfig from "./configsExamples/designerConfigExample";
import { Chart } from "../main";

const data = require("./assets/dataSet.json");

class ChartInstanceStorage {
	private chart: Chart;

	constructor(config: MdtChartsConfig, designerConfig: DesignerConfig, data: MdtChartsDataSource) {
		this.recreateChart(config, designerConfig, data);
	}

	recreateChart(config: MdtChartsConfig, designerConfig: DesignerConfig, data: MdtChartsDataSource): void {
		this.chart?.destroy();
		this.chart = new Chart(
			config,
			designerConfig,
			data,
			false,
			(rows: MdtChartsDataRow[]) => {
				console.log(
					"Selected keys:",
					rows.map((row) => row.brand)
				);
			},
			undefined
		);
		this.chart.render(document.querySelector(".main-wrapper"));
	}

	getChart(): Chart {
		return this.chart;
	}
}

const instance = new ChartInstanceStorage(config, designerConfig, data);

new Listeners(instance, config, designerConfig, data);

// setTimeout(() => {
//     const newData = { dataSet: data.dataSet.map((r: any) => ({ ...r })) };
//     newData.dataSet[4].price = 10_000;
//     newData.dataSet[8].count = 1000;
//     instance.getChart().updateData(newData);
//     instance.getChart().updateColors(["red", "yellow", "blue"])
// }, 5000);

const chart2 = new Chart(require("./configsExamples/configTest2D.json"), designerConfig, data, false);
chart2.render(document.querySelector(".main-wrapper2"));

const chart3 = new Chart(require("./configsExamples/configTestPolar.json"), designerConfig, data, false);
chart3.render(document.querySelector(".main-wrapper2"));

//====================================================================================================== Data updating
class DataUpdater {
	private static timeOut: any = null;
	private static refresh: number = 4000;

	private static dataSetName = "dataSet";
	private static keyFieldName = "brand";
	private static valueFieldNames = ["price", "count"];
	private static colorFieldName = "color";

	static counter = 1;

	public static updateIsOn(value: boolean) {
		if (value) DataUpdater.startDataChanging(DataUpdater.refresh);
		else DataUpdater.destroyDataChanging();
	}

	public static updateRefreshValue(value: number) {
		if (value < 1) return;

		DataUpdater.refresh = value;
	}

	private static startDataChanging(ms: number) {
		this.destroyDataChanging();
		const run = () => {
			DataUpdater.timeOut = setTimeout(() => {
				const newData = ListenersHelper.getCopy(data);

				this.changeData(newData);

				instance.getChart().updateData(newData);
				run();
			}, ms);
		};
		run();
	}

	private static destroyDataChanging() {
		clearTimeout(DataUpdater.timeOut);
	}

	private static changeData(newData: MdtChartsDataSource) {
		const random = Math.random();
		if (random > 0.66) {
			for (let i = 0; i < ListenersHelper.randInt(1, 4); i++) {
				const row: any = {
					$id: ListenersHelper.randInt(100, 5000000)
				};
				row[this.keyFieldName] = this.makeHASH(ListenersHelper.randInt(4, 10)).toUpperCase();
				this.valueFieldNames.forEach((vField) => (row[vField] = ListenersHelper.randInt(0, 130_000)));
				row[this.colorFieldName] = this.getRandomColor();
				newData[this.dataSetName].push(row);
			}
		} else if (random < 0.33) {
			newData[this.dataSetName].splice(ListenersHelper.randInt(0, 4), ListenersHelper.randInt(1, 3));
		}

		// newData[this.dataSetName][0]['price'] = ListenersHelper.randInt(-100, 100);
		// newData[this.dataSetName][0]['count'] = ListenersHelper.randInt(-100, 100);

		newData[this.dataSetName][ListenersHelper.randInt(0, newData[this.dataSetName].length - 1)]["price"] =
			ListenersHelper.randInt(0, 100000);
		newData[this.dataSetName][ListenersHelper.randInt(0, newData[this.dataSetName].length - 1)]["count"] =
			ListenersHelper.randInt(0, 1000);
	}

	private static makeHASH(length: number): string {
		var result = "";
		var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result + "  AAA";
	}

	private static getRandomColor(): string {
		const colors = ["red", "green", "blue", "orange", "yellow"];
		return colors[Math.floor(Math.random() * colors.length)];
	}
}
