import {
	MdtChartsDataRow,
	MdtChartsDataSource,
	MdtChartsTwoDimensionalChart,
	MdtChartsTwoDimensionalOptions
} from "../../config/config";
import { getScaleLinearDomain, ScaleDomainCalculator } from "../../model/featuresModel/scaleModel/scaleDomainService";
import { ScaleModel } from "../../model/featuresModel/scaleModel/scaleModel";
import { getScaleKeyRangePeek, getScaleValueRangePeek } from "../../model/featuresModel/scaleModel/scaleModelServices";
import { CanvasModel } from "../../model/modelInstance/canvasModel/canvasModel";
import { CanvasSizesModel } from "../../model/modelInstance/canvasModel/canvasSizesModel/canvasSizeModel";

function getData(sourceName: "dataSet_poor" | "dataSet" | "dataSet_negative" = "dataSet"): MdtChartsDataRow[] {
	const data = {
		dataSet: [
			{ brand: "BMW", price: 10, count: 12 },
			{ brand: "LADA", price: 50, count: 10 },
			{ brand: "MERCEDES", price: 15, count: 12 },
			{ brand: "AUDI", price: 20, count: 5 },
			{ brand: "VOLKSWAGEN", price: 115, count: 6 },
			{ brand: "DODGE", price: 115, count: 4 },
			{ brand: "SAAB", price: 50, count: 11 },
			{ brand: "HONDA", price: 20, count: 2 },
			{ brand: "TOYOTA", price: 120, count: 20 }
		],
		dataSet_poor: [
			{ brand: "BMW", price: 120, count: 12, simple: 300 },
			{ brand: "LADA", price: 50, count: 10, simple: 30 },
			{ brand: "MERCEDES", price: 15, count: 12, simple: 500 }
		],
		dataSet_negative: [
			{ brand: "BMW", price: -120, count: 12, simple: 300 },
			{ brand: "LADA", price: -50, count: 10, simple: -30 },
			{ brand: "MERCEDES", price: 15, count: -12, simple: 500 },
			{ brand: "DODGE", price: -100, count: -52, simple: 500 }
		]
	};

	return data[sourceName];
}

describe("getScaleMaxValue test", () => {
	let charts: MdtChartsTwoDimensionalChart[];
	const calculator = new ScaleDomainCalculator();

	beforeEach(() => {
		charts = [
			{
				isSegmented: false,
				type: "line",
				data: {
					valueFields: [
						{
							name: "price",
							format: "money",
							title: "Количество автомобилей на душу населения"
						},
						{
							name: "count",
							format: "integer",
							title: "Количество автомобилей на душу населения"
						}
					]
				},
				markers: {
					show: true
				},
				embeddedLabels: "key"
			}
		];
	});

	describe("one chart", () => {
		describe("non-segmnted", () => {
			beforeEach(() => {
				charts[0].isSegmented = false;
			});

			test("should return 120 (max of all dataSet) for not-segmnted charts", () => {
				const result = calculator.getScaleMaxValue(charts, getData());
				expect(result).toBe(120);
			});

			test("should return 20 (max of count) for not-segmnted charts", () => {
				charts[0].data.valueFields = charts[0].data.valueFields.slice(1, 2);
				const result = calculator.getScaleMaxValue(charts, getData());
				expect(result).toBe(20);
			});

			test("should return 500", () => {
				charts[0].data.valueFields.push({
					format: "integer",
					name: "simple",
					title: ""
				});
				const result = calculator.getScaleMaxValue(charts, getData("dataSet_poor"));
				expect(result).toBe(500);
			});
		});

		describe("segmented", () => {
			beforeEach(() => {
				charts[0].isSegmented = true;
			});

			test("should return 140 (max of all sums) for segmented chart", () => {
				const result = calculator.getScaleMaxValue(charts, getData());
				expect(result).toBe(140);
			});

			test("should return 527", () => {
				charts[0].data.valueFields.push({
					format: "integer",
					name: "simple",
					title: ""
				});
				const result = calculator.getScaleMaxValue(charts, getData("dataSet_poor"));
				expect(result).toBe(527);
			});
		});
	});

	describe("With Negative values", () => {
		test("should return max sum of positive values if chart has negative values too", () => {
			charts[0].data.valueFields.push({ name: "simple", format: null, title: null });
			charts[0].isSegmented = true;

			const result = calculator.getScaleMaxValue(charts, getData("dataSet_negative"));
			expect(result).toBe(515);
		});
	});

	describe("two charts", () => {
		describe("segmented/non-segmented", () => {
			test("should return 500", () => {
				charts = [
					{
						isSegmented: true,
						type: "line",
						data: {
							valueFields: [
								{
									name: "price",
									format: "money",
									title: "Количество автомобилей на душу населения"
								},
								{
									name: "count",
									format: "integer",
									title: "Количество автомобилей на душу населения"
								}
							]
						},

						markers: {
							show: true
						},
						embeddedLabels: "key"
					},
					{
						isSegmented: false,
						type: "line",
						data: {
							valueFields: [
								{
									format: "integer",
									name: "simple",
									title: ""
								}
							]
						},

						markers: {
							show: true
						},
						embeddedLabels: "key"
					}
				];
				const result = calculator.getScaleMaxValue(charts, getData("dataSet_poor"));
				expect(result).toBe(500);
			});

			test("should return 500", () => {
				charts = [
					{
						isSegmented: true,
						type: "line",
						data: {
							valueFields: [
								{
									name: "price",
									format: "money",
									title: "Количество автомобилей на душу населения"
								},
								{
									name: "count",
									format: "integer",
									title: "Количество автомобилей на душу населения"
								}
							]
						},

						embeddedLabels: "key",
						markers: {
							show: true
						}
					},
					{
						isSegmented: true,
						type: "line",
						data: {
							valueFields: [
								{
									format: "integer",
									name: "simple",
									title: ""
								}
							]
						},

						markers: {
							show: true
						},
						embeddedLabels: "key"
					}
				];
				const result = calculator.getScaleMaxValue(charts, getData("dataSet_poor"));
				expect(result).toBe(500);
			});
		});

		describe("segmented/segmented", () => {
			test("should return 500", () => {
				charts = [
					{
						isSegmented: true,
						type: "line",
						markers: {
							show: true
						},
						data: {
							valueFields: [
								{
									name: "price",
									format: "money",
									title: "Количество автомобилей на душу населения"
								},
								{
									name: "count",
									format: "integer",
									title: "Количество автомобилей на душу населения"
								}
							]
						},

						embeddedLabels: "key"
					},
					{
						isSegmented: true,
						markers: {
							show: true
						},
						type: "line",
						data: {
							valueFields: [
								{
									format: "integer",
									name: "simple",
									title: ""
								}
							]
						},

						embeddedLabels: "key"
					}
				];
				const result = calculator.getScaleMaxValue(charts, getData("dataSet_poor"));
				expect(result).toBe(500);
			});

			test("should return 512", () => {
				charts = [
					{
						isSegmented: true,
						type: "line",
						markers: {
							show: true
						},
						data: {
							valueFields: [
								{
									name: "price",
									format: "money",
									title: "Количество автомобилей на душу населения"
								},
								{
									name: "count",
									format: "integer",
									title: "Количество автомобилей на душу населения"
								}
							]
						},
						embeddedLabels: "key"
					},
					{
						isSegmented: true,
						markers: {
							show: true
						},
						type: "line",
						data: {
							valueFields: [
								{
									format: "integer",
									name: "simple",
									title: ""
								},
								{
									name: "count",
									format: "integer",
									title: "Количество автомобилей на душу населения"
								}
							]
						},

						embeddedLabels: "key"
					}
				];
				const result = calculator.getScaleMaxValue(charts, getData("dataSet_poor"));
				expect(result).toBe(512);
			});

			test("should return 512", () => {
				charts = [
					{
						isSegmented: true,
						markers: {
							show: true
						},
						type: "line",
						data: {
							valueFields: [
								{
									name: "price",
									format: "money",
									title: "Количество автомобилей на душу населения"
								},
								{
									name: "count",
									format: "integer",
									title: "Количество автомобилей на душу населения"
								}
							]
						},
						embeddedLabels: "key"
					},
					{
						isSegmented: true,
						markers: {
							show: true
						},
						type: "line",
						data: {
							valueFields: [
								{
									name: "count",
									format: "integer",
									title: "Количество автомобилей на душу населения"
								}
							]
						},

						embeddedLabels: "key"
					},
					{
						isSegmented: false,
						markers: {
							show: true
						},
						type: "line",
						data: {
							valueFields: [
								{
									format: "integer",
									name: "simple",
									title: ""
								},
								{
									name: "count",
									format: "integer",
									title: "Количество автомобилей на душу населения"
								},
								{
									name: "price",
									format: "money",
									title: "Количество автомобилей на душу населения"
								}
							]
						},

						embeddedLabels: "key"
					}
				];
				const result = calculator.getScaleMaxValue(charts, getData("dataSet_poor"));
				expect(result).toBe(500);
			});
		});
	});
});

describe("getScaleMinValue", () => {
	let charts: MdtChartsTwoDimensionalChart[];
	const calculator = new ScaleDomainCalculator();

	beforeEach(() => {
		charts = [
			{
				isSegmented: false,
				type: "line",
				data: {
					valueFields: [
						{
							name: "price",
							format: "money",
							title: "Количество автомобилей на душу населения"
						},
						{
							name: "count",
							format: "integer",
							title: "Количество автомобилей на душу населения"
						}
					]
				},
				markers: null,
				embeddedLabels: "key"
			}
		];
	});

	test("should return `0` if min value is more than 0", () => {
		const res = calculator.getScaleMinValue(charts, getData());
		expect(res).toBe(0);
	});

	test("should return min negative value if chart is not segmented and data has negative values", () => {
		const res = calculator.getScaleMinValue(charts, getData("dataSet_negative"));
		expect(res).toBe(-120);
	});

	test("should return min sum of negative values if chart is segmented and data has negative values", () => {
		charts[0].isSegmented = true;
		const res = calculator.getScaleMinValue(charts, getData("dataSet_negative"));
		expect(res).toBe(-152);
	});
});

describe("get scales tests", () => {
	let charts: MdtChartsTwoDimensionalChart[];
	let data: MdtChartsDataSource;
	let dataSource: string;
	let options: MdtChartsTwoDimensionalOptions;
	let scaleModel: ScaleModel;

	beforeEach(() => {
		charts = [
			{
				isSegmented: false,
				type: "line",
				data: {
					valueFields: [
						{
							name: "price",
							format: "money",
							title: "Количество автомобилей на душу населения"
						},
						{
							name: "count",
							format: "integer",
							title: "Количество автомобилей на душу населения"
						}
					]
				},
				markers: {
					show: true
				},
				embeddedLabels: "key"
			},
			{
				isSegmented: false,
				type: "bar",
				data: {
					valueFields: [
						{
							name: "price",
							format: "money",
							title: "Количество автомобилей на душу населения"
						},
						{
							name: "count",
							format: "integer",
							title: "Количество автомобилей на душу населения"
						}
					]
				},
				markers: {
					show: true
				},
				embeddedLabels: "key"
			}
		];
		data = {
			dataSet_poor: getData("dataSet_poor")
		};
		dataSource = "dataSet_poor";
		options = {
			legend: {
				show: false
			},
			additionalElements: null,
			axis: {
				key: {
					position: "start",
					ticks: null,
					visibility: true
				},
				value: {
					domain: {
						start: -1,
						end: -1
					},
					position: "end",
					ticks: null,
					visibility: true
				}
			},
			charts,
			data: {
				dataSource,
				keyField: {
					format: null,
					name: "price"
				}
			},
			orientation: "vertical",
			selectable: true,
			title: null,
			type: "2d",
			tooltip: {
				html: null
			}
		};

		const canvasModel = new CanvasModel();
		canvasModel.initMargin({ bottom: 20, left: 20, right: 20, top: 20 });
		canvasModel.initBlockSize({ height: 500, width: 1000 });

		scaleModel = new ScaleModel(options, canvasModel);
	});

	test("get scale key band", () => {
		const result = scaleModel.getScaleKey(["BMW", "LADA", "MECEDES"]);
		expect(result).toEqual({
			domain: ["BMW", "LADA", "MECEDES"],
			range: {
				start: 0,
				end: 960
			},
			type: "band",
			elementsAmount: 2
		});
	});

	test("get scale key", () => {
		charts[1].type = "line";
		const result = scaleModel.getScaleKey(["BMW", "LADA", "MECEDES"]);
		expect(result).toEqual({
			domain: ["BMW", "LADA", "MECEDES"],
			range: {
				start: 0,
				end: 960
			},
			type: "point",
			elementsAmount: 1
		});
	});

	test("should make scale for one band if there are dotted charts without bars", () => {
		charts[1].type = "dot";
		charts[0].type = "dot";

		const result = scaleModel.getScaleKey(["BMW", "LADA", "MECEDES"]);
		expect(result).toEqual({
			domain: ["BMW", "LADA", "MECEDES"],
			range: {
				start: 0,
				end: 960
			},
			type: "band",
			elementsAmount: 1
		});
	});

	test("get scale linear", () => {
		const result = scaleModel.getScaleLinear(data[dataSource]);
		expect(result).toEqual({
			domain: [0, 120],
			range: {
				start: 0,
				end: 460
			},
			formatter: null,
			type: "linear"
		});
	});
});

describe("Model Services", () => {
	let sizesModel: CanvasSizesModel;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();

		sizesModel = {
			getChartBlockHeight: jest.fn(),
			getChartBlockWidth: jest.fn()
		};
	});

	describe("getScaleKeyRangePeek", () => {
		test("should call chart block width if orientation is vertical", () => {
			(sizesModel.getChartBlockWidth as jest.Mock).mockReturnValueOnce(42);
			const res = getScaleKeyRangePeek("vertical", sizesModel);
			expect(sizesModel.getChartBlockWidth).toHaveBeenCalled();
			expect(res).toBe(42);
		});

		test("should call chart block height if orientation is horizontal", () => {
			(sizesModel.getChartBlockHeight as jest.Mock).mockReturnValueOnce(42);
			const res = getScaleKeyRangePeek("horizontal", sizesModel);
			expect(sizesModel.getChartBlockHeight).toHaveBeenCalled();
			expect(res).toBe(42);
		});
	});

	describe("getScaleValueRangePeek", () => {
		test("should call chart block width if orientation is horizontal", () => {
			(sizesModel.getChartBlockHeight as jest.Mock).mockReturnValueOnce(42);
			const res = getScaleValueRangePeek("vertical", sizesModel);
			expect(sizesModel.getChartBlockHeight).toHaveBeenCalled();
			expect(res).toBe(42);
		});

		test("should call chart block height if orientation is vertical", () => {
			(sizesModel.getChartBlockWidth as jest.Mock).mockReturnValueOnce(42);
			const res = getScaleValueRangePeek("horizontal", sizesModel);
			expect(sizesModel.getChartBlockWidth).toHaveBeenCalled();
			expect(res).toBe(42);
		});
	});
});

describe("getScaleLinearDomain", () => {
	let config: MdtChartsTwoDimensionalOptions;
	let dataRow: MdtChartsDataRow[];

	beforeEach(() => {
		config = {
			type: "2d",
			title: "",
			selectable: true,
			axis: {
				key: {
					visibility: true,
					position: "end",
					ticks: {
						flag: false
					}
				},
				value: {
					visibility: true,
					domain: { start: -1, end: -1 },
					position: "start",
					ticks: {
						flag: false
					},
					labels: {
						format: (v) => (v === 0 ? "0" : Math.floor(v / 100) + " млн")
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
			legend: {
				show: true
			},
			orientation: "vertical",
			data: {
				dataSource: "dataSet",
				keyField: {
					name: "brand",
					format: "string"
				}
			},
			charts: [
				{
					isSegmented: false,
					type: "line",
					data: {
						valueFields: [
							{
								name: "price",
								format: "money",
								title: "Стоимость за 2020 год"
							}
						],
						valueGroup: "secondary"
					},
					embeddedLabels: "none",
					markers: {
						show: false
					},
					lineStyles: {
						dash: {
							on: true,
							dashSize: 3,
							gapSize: 3
						}
					},
					barStyles: {
						hatch: {
							on: false
						}
					}
				},
				{
					isSegmented: false,
					type: "bar",
					data: {
						valueFields: [
							{
								name: "count",
								format: "money",
								title: "Стоимость за 2020 год"
							}
						],
						valueGroup: "main"
					},
					embeddedLabels: "none",
					markers: {
						show: false
					},
					lineStyles: {
						dash: {
							on: true,
							dashSize: 3,
							gapSize: 3
						}
					},
					barStyles: {
						hatch: {
							on: false
						}
					}
				}
			],
			tooltip: {
				aggregator: {
					content: ({ row }) => {
						return { type: "captionValue", caption: "Общая сумма", value: row.price + row.count };
					},
					position: "underValues"
				}
			}
		};

		dataRow = [
			{ brand: "BMW", price: 10, count: 12 },
			{ brand: "LADA", price: 50, count: 10 },
			{ brand: "MERCEDES", price: 15, count: 12 },
			{ brand: "AUDI", price: 20, count: 5 },
			{ brand: "VOLKSWAGEN", price: 115, count: 6 },
			{ brand: "DODGE", price: 115, count: 4 },
			{ brand: "SAAB", price: 50, count: 11 },
			{ brand: "HONDA", price: 20, count: 2 },
			{ brand: "TOYOTA", price: 120, count: 20 }
		];
	});

	test('should return array equals [120, 0] because valueGroup of first chart equals "secondary"', () => {
		const res = getScaleLinearDomain(config.axis.value.domain, dataRow, config, "secondary");
		expect(res).toEqual([120, 0]);
	});

	test('should return array equals [20, 0] because valueGroup of first chart equals "main"', () => {
		const res = getScaleLinearDomain(config.axis.value.domain, dataRow, config);
		expect(res).toEqual([20, 0]);
	});

	test("should return array equals [120, 0] because valueGroup does not exist in charts", () => {
		config.charts.forEach((chart) => {
			delete chart.data.valueGroup;
		});

		const res = getScaleLinearDomain(config.axis.value.domain, dataRow, config);
		expect(res).toEqual([120, 0]);
	});

	test("should return array equals [0, 0] because valueGroup does not exist in charts", () => {
		config.charts.forEach((chart) => {
			delete chart.data.valueGroup;
		});

		const res = getScaleLinearDomain(config.axis.value.domain, dataRow, config, "secondary");
		expect(res).toEqual([0, 0]);
	});

	test('should return array equals [120, 0] because valueGroup of every chart equals "main"', () => {
		config.charts.forEach((chart) => {
			chart.data.valueGroup = "main";
		});

		const res = getScaleLinearDomain(config.axis.value.domain, dataRow, config);
		expect(res).toEqual([120, 0]);
	});

	test('should return array equals [0, 20] because position of axisKey equals "start"', () => {
		config.axis.key.position = "start";

		const res = getScaleLinearDomain(config.axis.value.domain, dataRow, config);
		expect(res).toEqual([0, 20]);
	});
});
