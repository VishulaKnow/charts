import { TooltipContent } from "../../model";
import { TooltipContentGeneratorOptions, TwoDimTooltipContentGenerator } from "./tooltipContentModel";

const createInitialOptions = (): TooltipContentGeneratorOptions => ({
	datasource: [
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
	],
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
				},
				lineViewOptions: {
					length: 10,
					strokeWidth: 0,
					dashedStyles: {
						on: true,
						dashSize: 1,
						gapSize: 1
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
	],
	publicOptions: {},
	keyFieldName: "brand",
	valueGlobalFormatter: (value) => value.toString()
});

describe("TwoDimTooltipContentGenerator", () => {
	it("should generate content rows by value fields by default", () => {
		const generator = new TwoDimTooltipContentGenerator(createInitialOptions());
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
						},
						lineViewOptions: {
							length: 10,
							strokeWidth: 0,
							dashedStyles: {
								on: true,
								dashSize: 1,
								gapSize: 1
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
						},
						lineViewOptions: {
							length: 10,
							strokeWidth: 0,
							dashedStyles: {
								on: true,
								dashSize: 1,
								gapSize: 1
							}
						}
					}
				}
			]
		});
	});

	it("should handle rows for multiple charts", () => {
		const options = createInitialOptions();
		options.chartsInfo.push({
			data: {
				valueFields: [{ name: "price", title: "Price2", format: "money" }]
			},
			style: {
				opacity: 0,
				elementColors: ["red", "yellow"]
			},
			legend: {
				markerShape: "line",
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
				},
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
		const generator = new TwoDimTooltipContentGenerator(options);
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
						},
						lineViewOptions: {
							length: 10,
							strokeWidth: 0,
							dashedStyles: {
								on: true,
								dashSize: 1,
								gapSize: 1
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
						},
						lineViewOptions: {
							length: 10,
							strokeWidth: 0,
							dashedStyles: {
								on: true,
								dashSize: 1,
								gapSize: 1
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
						},
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

	it("should render defined html if it is defined in public options", () => {
		const options = createInitialOptions();
		options.publicOptions.html = (dataRow) => `<div>${dataRow.brand}</div>`;
		const generator = new TwoDimTooltipContentGenerator(options);
		const content = generator.generateContent("LADA");

		expect(content).toEqual(<TooltipContent>{
			type: "html",
			htmlContent: "<div>LADA</div>"
		});
	});
});
