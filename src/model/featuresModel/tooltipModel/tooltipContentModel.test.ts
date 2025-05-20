import { MdtChartsDataRow } from "../../../config/config";
import { TooltipContent } from "../../model";
import {
	PolarInitialRowsProvider,
	PolarInitialRowsProviderOptions
} from "./contentByNotations/polarInitialRowsProvider";
import { TooltipContentInitialRowsProvider } from "./contentByNotations/tooltipContentInitialRowsProvider";
import {
	TwoDimInitialRowsProvider,
	TwoDimInitialRowsProviderOptions
} from "./contentByNotations/twoDimInitialRowsProvider";
import { TooltipContentGeneratorOptions, TwoDimTooltipContentGenerator } from "./tooltipContentModel";

const createDatasource: () => MdtChartsDataRow[] = () => [
	{
		$id: 1,
		brand: "BMW",
		price: 109000,
		count: 10000
	},
	{
		$id: 2,
		brand: "LADA",
		price: 12000,
		count: 1000
	},
	{
		$id: 3,
		brand: "MERCEDES",
		price: 15000,
		count: 1200
	}
];
const createInitialOptions = (
	initialRowsProvider: TooltipContentInitialRowsProvider
): TooltipContentGeneratorOptions => ({
	datasource: createDatasource(),
	keyFieldName: "brand",
	valueGlobalFormatter: (value) => value.toString(),
	initialRowsProvider
});

const getTwoDimInitialRowsProviderOptions = (): TwoDimInitialRowsProviderOptions => ({
	chartsInfo: [
		{
			legend: {
				markerShape: "bar",
				barViewOptions: {
					borderRadius: {
						topLeft: 0,
						topRight: 0,
						bottomLeft: 0,
						bottomRight: 0
					},
					width: 10,
					hatch: {
						on: false
					}
				}
			},
			style: {
				opacity: 0,
				elementColors: ["green", "blue"]
			},
			data: {
				valueFields: [
					{
						name: "price",
						title: "Price",
						format: "money"
					},
					{
						name: "count",
						title: "Count",
						format: "number"
					}
				]
			}
		}
	]
});

const getPolarInitialRowsProviderOptions = (): PolarInitialRowsProviderOptions => ({
	datasource: createDatasource(),
	chartColors: ["red", "blue", "green"],
	valueField: {
		name: "price",
		title: "Price",
		format: "money"
	},
	keyFieldName: "brand"
});

describe("TwoDimTooltipContentGenerator", () => {
	it("should render defined html if it is defined in public options", () => {
		const options = createInitialOptions(new TwoDimInitialRowsProvider(getTwoDimInitialRowsProviderOptions()));
		options.publicOptions = { html: (dataRow) => `<div>${dataRow.brand}</div>` };
		const generator = new TwoDimTooltipContentGenerator(options);
		const content = generator.generateContent("LADA");

		expect(content).toEqual(<TooltipContent>{
			type: "html",
			htmlContent: "<div>LADA</div>"
		});
	});

	describe("for 2d notation", () => {
		it("should generate content rows by value fields by default", () => {
			const generator = new TwoDimTooltipContentGenerator(
				createInitialOptions(new TwoDimInitialRowsProvider(getTwoDimInitialRowsProviderOptions()))
			);
			const content = generator.generateContent("BMW");

			expect(content).toEqual(<TooltipContent>{
				type: "rows",
				rows: [
					{
						textContent: {
							caption: "BMW"
						},
						wrapper: {
							cssClassName: "tooltip-head"
						}
					},
					{
						textContent: {
							caption: "Price",
							value: "109000"
						},
						marker: {
							color: "green",
							markerShape: "bar",
							barViewOptions: {
								borderRadius: {
									topLeft: 0,
									topRight: 0,
									bottomLeft: 0,
									bottomRight: 0
								},
								width: 10,
								hatch: {
									on: false
								}
							}
						}
					},
					{
						textContent: {
							caption: "Count",
							value: "10000"
						},
						marker: {
							color: "blue",
							markerShape: "bar",
							barViewOptions: {
								borderRadius: {
									topLeft: 0,
									topRight: 0,
									bottomLeft: 0,
									bottomRight: 0
								},
								width: 10,
								hatch: {
									on: false
								}
							}
						}
					}
				]
			});
		});

		it("should handle rows for multiple charts", () => {
			const initialRowsProviderOptions = getTwoDimInitialRowsProviderOptions();

			initialRowsProviderOptions.chartsInfo.push({
				data: {
					valueFields: [{ name: "price", title: "Price2", format: "money" }]
				},
				style: {
					opacity: 0,
					elementColors: ["red", "yellow"]
				},
				legend: {
					markerShape: "line",
					lineViewOptions: {
						length: 10,
						strokeWidth: 2,
						dashedStyles: {
							on: true,
							dashSize: 10,
							gapSize: 2
						}
					}
				}
			});
			const generator = new TwoDimTooltipContentGenerator(
				createInitialOptions(new TwoDimInitialRowsProvider(initialRowsProviderOptions))
			);
			const content = generator.generateContent("LADA");

			expect(content).toEqual(<TooltipContent>{
				type: "rows",
				rows: [
					{
						textContent: {
							caption: "LADA"
						},
						wrapper: {
							cssClassName: "tooltip-head"
						}
					},
					{
						textContent: {
							caption: "Price",
							value: "12000"
						},
						marker: {
							color: "green",
							markerShape: "bar",
							barViewOptions: {
								borderRadius: {
									topLeft: 0,
									topRight: 0,
									bottomLeft: 0,
									bottomRight: 0
								},
								width: 10,
								hatch: {
									on: false
								}
							}
						}
					},
					{
						textContent: {
							caption: "Count",
							value: "1000"
						},
						marker: {
							color: "blue",
							markerShape: "bar",
							barViewOptions: {
								borderRadius: {
									topLeft: 0,
									topRight: 0,
									bottomLeft: 0,
									bottomRight: 0
								},
								width: 10,
								hatch: {
									on: false
								}
							}
						}
					},
					{
						textContent: {
							caption: "Price2",
							value: "12000"
						},
						marker: {
							color: "red",
							markerShape: "line",
							lineViewOptions: {
								length: 10,
								strokeWidth: 2,
								dashedStyles: {
									on: true,
									dashSize: 10,
									gapSize: 2
								}
							}
						}
					}
				]
			});
		});

		it("should accept formatter from public options if it is defined", () => {
			const options = createInitialOptions(new TwoDimInitialRowsProvider(getTwoDimInitialRowsProviderOptions()));
			options.publicOptions = { formatValue: ({ rawValue }) => `$${rawValue}` };

			const generator = new TwoDimTooltipContentGenerator(options);
			const content = generator.generateContent("BMW");

			expect(content).toEqual(<TooltipContent>{
				type: "rows",
				rows: [
					{
						textContent: {
							caption: "BMW"
						},
						wrapper: {
							cssClassName: "tooltip-head"
						}
					},
					{
						textContent: {
							caption: "Price",
							value: "$109000"
						},
						marker: {
							color: "green",
							markerShape: "bar",
							barViewOptions: {
								borderRadius: {
									topLeft: 0,
									topRight: 0,
									bottomLeft: 0,
									bottomRight: 0
								},
								width: 10,
								hatch: {
									on: false
								}
							}
						}
					},
					{
						textContent: {
							caption: "Count",
							value: "$10000"
						},
						marker: {
							color: "blue",
							markerShape: "bar",
							barViewOptions: {
								borderRadius: {
									topLeft: 0,
									topRight: 0,
									bottomLeft: 0,
									bottomRight: 0
								},
								width: 10,
								hatch: {
									on: false
								}
							}
						}
					}
				]
			});
		});

		it("should put aggregator content under values if it is defined in public options", () => {
			const options = createInitialOptions(new TwoDimInitialRowsProvider(getTwoDimInitialRowsProviderOptions()));
			options.publicOptions = {
				aggregator: {
					content: () => [
						{
							type: "captionValue",
							caption: "Total",
							value: 100000
						},
						{ type: "plainText", textContent: "Data is not official" }
					],
					position: "underValues"
				}
			};
			const generator = new TwoDimTooltipContentGenerator(options);

			const content = generator.generateContent("BMW");

			expect(content).toEqual(<TooltipContent>{
				type: "rows",
				rows: [
					{
						textContent: {
							caption: "BMW"
						},
						wrapper: {
							cssClassName: "tooltip-head"
						}
					},
					{
						textContent: {
							caption: "Price",
							value: "109000"
						},
						marker: {
							color: "green",
							markerShape: "bar",
							barViewOptions: {
								borderRadius: {
									topLeft: 0,
									topRight: 0,
									bottomLeft: 0,
									bottomRight: 0
								},
								width: 10,
								hatch: {
									on: false
								}
							}
						}
					},
					{
						textContent: {
							caption: "Count",
							value: "10000"
						},
						marker: {
							color: "blue",
							markerShape: "bar",
							barViewOptions: {
								borderRadius: {
									topLeft: 0,
									topRight: 0,
									bottomLeft: 0,
									bottomRight: 0
								},
								width: 10,
								hatch: {
									on: false
								}
							}
						}
					},
					{
						textContent: {
							caption: "Total",
							value: 100000
						}
					},
					{
						textContent: {
							caption: "Data is not official",
							value: undefined
						}
					}
				]
			});
		});

		it("should put aggregator content under key if it is defined in public options", () => {
			const options = createInitialOptions(new TwoDimInitialRowsProvider(getTwoDimInitialRowsProviderOptions()));
			options.publicOptions = {
				aggregator: {
					content: () => [
						{
							type: "captionValue",
							caption: "Total",
							value: 100000
						},
						{ type: "plainText", textContent: "Data is not official" }
					],
					position: "underKey"
				}
			};
			const generator = new TwoDimTooltipContentGenerator(options);

			const content = generator.generateContent("BMW");

			expect(content).toEqual(<TooltipContent>{
				type: "rows",
				rows: [
					{
						textContent: {
							caption: "BMW"
						},
						wrapper: {
							cssClassName: "tooltip-head"
						}
					},
					{
						textContent: {
							caption: "Total",
							value: 100000
						}
					},
					{
						textContent: {
							caption: "Data is not official",
							value: undefined
						}
					},
					{
						textContent: {
							caption: "Price",
							value: "109000"
						},
						marker: {
							color: "green",
							markerShape: "bar",
							barViewOptions: {
								borderRadius: {
									topLeft: 0,
									topRight: 0,
									bottomLeft: 0,
									bottomRight: 0
								},
								width: 10,
								hatch: {
									on: false
								}
							}
						}
					},
					{
						textContent: {
							caption: "Count",
							value: "10000"
						},
						marker: {
							color: "blue",
							markerShape: "bar",
							barViewOptions: {
								borderRadius: {
									topLeft: 0,
									topRight: 0,
									bottomLeft: 0,
									bottomRight: 0
								},
								width: 10,
								hatch: {
									on: false
								}
							}
						}
					}
				]
			});
		});

		it("should handle aggregator when it provided as one value instead of array", () => {
			const options = createInitialOptions(new TwoDimInitialRowsProvider(getTwoDimInitialRowsProviderOptions()));
			options.publicOptions = {
				aggregator: {
					content: () => ({
						type: "captionValue",
						caption: "Total",
						value: 100000
					}),
					position: "underKey"
				}
			};
			const generator = new TwoDimTooltipContentGenerator(options);

			const content = generator.generateContent("BMW");

			expect(content).toEqual(<TooltipContent>{
				type: "rows",
				rows: [
					{
						textContent: {
							caption: "BMW"
						},
						wrapper: {
							cssClassName: "tooltip-head"
						}
					},
					{
						textContent: {
							caption: "Total",
							value: 100000
						}
					},
					{
						textContent: {
							caption: "Price",
							value: "109000"
						},
						marker: {
							color: "green",
							markerShape: "bar",
							barViewOptions: {
								borderRadius: {
									topLeft: 0,
									topRight: 0,
									bottomLeft: 0,
									bottomRight: 0
								},
								width: 10,
								hatch: {
									on: false
								}
							}
						}
					},
					{
						textContent: {
							caption: "Count",
							value: "10000"
						},
						marker: {
							color: "blue",
							markerShape: "bar",
							barViewOptions: {
								borderRadius: {
									topLeft: 0,
									topRight: 0,
									bottomLeft: 0,
									bottomRight: 0
								},
								width: 10,
								hatch: {
									on: false
								}
							}
						}
					}
				]
			});
		});

		it("should filter rows by predicate if it is defined in public options", () => {
			const options = createInitialOptions(new TwoDimInitialRowsProvider(getTwoDimInitialRowsProviderOptions()));
			options.datasource[0].price = undefined;
			options.publicOptions = {
				rows: {
					filterPredicate: (row) => row.textContent.value !== undefined
				}
			};
			const generator = new TwoDimTooltipContentGenerator(options);
			const content = generator.generateContent("BMW");

			expect(content).toEqual(<TooltipContent>{
				type: "rows",
				rows: [
					{
						textContent: {
							caption: "BMW"
						},
						wrapper: {
							cssClassName: "tooltip-head"
						}
					},
					{
						textContent: {
							caption: "Count",
							value: "10000"
						},
						marker: {
							color: "blue",
							markerShape: "bar",
							barViewOptions: {
								borderRadius: {
									topLeft: 0,
									topRight: 0,
									bottomLeft: 0,
									bottomRight: 0
								},
								width: 10,
								hatch: {
									on: false
								}
							}
						}
					}
				]
			});
		});
	});

	describe("for polar notation", () => {
		it("should set color for marker by data row index", () => {
			const generator = new TwoDimTooltipContentGenerator(
				createInitialOptions(new PolarInitialRowsProvider(getPolarInitialRowsProviderOptions()))
			);
			const content = generator.generateContent("BMW");

			expect(content).toEqual(<TooltipContent>{
				type: "rows",
				rows: [
					{
						textContent: {
							caption: "BMW"
						},
						wrapper: {
							cssClassName: "tooltip-head"
						}
					},
					{
						textContent: {
							caption: "Price",
							value: "109000"
						},
						marker: {
							color: "red",
							markerShape: "circle"
						}
					}
				]
			});

			const content2 = generator.generateContent("MERCEDES");

			expect(content2).toEqual(<TooltipContent>{
				type: "rows",
				rows: [
					{
						textContent: {
							caption: "MERCEDES"
						},
						wrapper: {
							cssClassName: "tooltip-head"
						}
					},
					{
						textContent: {
							caption: "Price",
							value: "15000"
						},
						marker: {
							color: "green",
							markerShape: "circle"
						}
					}
				]
			});
		});
	});
});
