import { BlockMargin, MdtChartsDataRow, Size } from "../../../../config/config";
import { TOOLTIP_HEAD_WRAPPER_CSS_CLASSNAME } from "../../../featuresModel/tooltipModel/tooltipContentModel";
import { SunburstLevel } from "../../../model";
import { LevelModelBuilder } from "./levelModelBuilder";

const blockSize: Size = {
	height: 100,
	width: 100
};

const margin: BlockMargin = {
	top: 10,
	left: 10,
	right: 10,
	bottom: 10
};

const scopedDataRows: MdtChartsDataRow[] = [
	{
		year: 2019,
		yearColor: "#aaa",
		brand: "BMW",
		price: 100_000,
		decade: "2010s"
	},
	{
		year: 2019,
		brand: "AUDI",
		yearColor: "#aaa",
		price: 120_000,
		decade: "2010s"
	},
	{
		year: 2026,
		yearColor: "#ccc",
		brand: "MERCEDES",
		price: 150_000,
		decade: "2020s"
	},
	{
		year: 2026,
		yearColor: "#ccc",
		brand: "VOLKSWAGEN",
		price: 115_000,
		decade: "2020s"
	}
];

describe("LevelModelBuilder", () => {
	describe("build", () => {
		test("should build a level model for two levels without custom thickness", () => {
			const levelModelBuilder = new LevelModelBuilder({
				blockSize,
				margin,
				scopedDataRows,
				topLevelColors: ["red", "green", "blue"],
				formatter: (value) => value.toFixed(2)
			});

			const levelModel = levelModelBuilder.build({
				data: {
					dataSource: "data",
					valueField: {
						name: "price",
						format: "money",
						title: "Стоимость"
					}
				},
				levels: [
					{
						data: {
							keyField: {
								name: "year"
							}
						}
					},
					{
						data: {
							keyField: {
								name: "brand"
							}
						}
					}
				]
			});

			expect(levelModel).toEqual(<SunburstLevel[]>[
				{
					segments: [
						{
							color: "red",
							tooltip: {
								content: {
									rows: [
										{
											textContent: { caption: 2019 },
											wrapper: { cssClassName: TOOLTIP_HEAD_WRAPPER_CSS_CLASSNAME }
										},
										{
											textContent: { caption: "Стоимость", value: "220000.00" },
											marker: { markerShape: "circle", color: "red" }
										}
									],
									type: "rows"
								}
							},
							key: 2019,
							value: 220000,
							levelIndex: 0,
							parentLevelKey: undefined,
							attachedDataRows: [
								{
									year: 2019,
									yearColor: "#aaa",
									brand: "BMW",
									price: 100_000,
									decade: "2010s"
								},
								{
									year: 2019,
									yearColor: "#aaa",
									brand: "AUDI",
									price: 120_000,
									decade: "2010s"
								}
							]
						},
						{
							color: "green",
							tooltip: {
								content: {
									rows: [
										{
											textContent: { caption: 2026 },
											wrapper: { cssClassName: TOOLTIP_HEAD_WRAPPER_CSS_CLASSNAME }
										},
										{
											textContent: { caption: "Стоимость", value: "265000.00" },
											marker: { markerShape: "circle", color: "green" }
										}
									],
									type: "rows"
								}
							},
							key: 2026,
							value: 265000,
							levelIndex: 0,
							parentLevelKey: undefined,
							attachedDataRows: [
								{
									year: 2026,
									yearColor: "#ccc",
									brand: "MERCEDES",
									price: 150_000,
									decade: "2020s"
								},
								{
									year: 2026,
									yearColor: "#ccc",
									brand: "VOLKSWAGEN",
									price: 115_000,
									decade: "2020s"
								}
							]
						}
					],
					sizes: { innerRadius: 20.4, outerRadius: 30, thickness: 9.6, translate: { x: 50, y: 50 } }
				},
				{
					segments: [
						{
							color: "red",
							tooltip: {
								content: {
									rows: [
										{
											textContent: { caption: "BMW" },
											wrapper: { cssClassName: TOOLTIP_HEAD_WRAPPER_CSS_CLASSNAME }
										},
										{
											textContent: { caption: "Стоимость", value: "100000.00" },
											marker: { markerShape: "circle", color: "red" }
										}
									],
									type: "rows"
								}
							},
							key: "BMW",
							value: 100000,
							levelIndex: 1,
							parentLevelKey: 2019,
							attachedDataRows: [
								{
									year: 2019,
									yearColor: "#aaa",
									brand: "BMW",
									price: 100_000,
									decade: "2010s"
								}
							]
						},
						{
							color: "red",
							tooltip: {
								content: {
									rows: [
										{
											textContent: { caption: "AUDI" },
											wrapper: { cssClassName: TOOLTIP_HEAD_WRAPPER_CSS_CLASSNAME }
										},
										{
											textContent: { caption: "Стоимость", value: "120000.00" },
											marker: { markerShape: "circle", color: "red" }
										}
									],
									type: "rows"
								}
							},
							key: "AUDI",
							value: 120000,
							levelIndex: 1,
							parentLevelKey: 2019,
							attachedDataRows: [
								{
									year: 2019,
									yearColor: "#aaa",
									brand: "AUDI",
									price: 120_000,
									decade: "2010s"
								}
							]
						},
						{
							color: "green",
							tooltip: {
								content: {
									rows: [
										{
											textContent: { caption: "MERCEDES" },
											wrapper: { cssClassName: TOOLTIP_HEAD_WRAPPER_CSS_CLASSNAME }
										},
										{
											textContent: { caption: "Стоимость", value: "150000.00" },
											marker: { markerShape: "circle", color: "green" }
										}
									],
									type: "rows"
								}
							},
							key: "MERCEDES",
							value: 150000,
							levelIndex: 1,
							parentLevelKey: 2026,
							attachedDataRows: [
								{
									year: 2026,
									yearColor: "#ccc",
									brand: "MERCEDES",
									price: 150_000,
									decade: "2020s"
								}
							]
						},
						{
							color: "green",
							tooltip: {
								content: {
									rows: [
										{
											textContent: { caption: "VOLKSWAGEN" },
											wrapper: { cssClassName: TOOLTIP_HEAD_WRAPPER_CSS_CLASSNAME }
										},
										{
											textContent: { caption: "Стоимость", value: "115000.00" },
											marker: { markerShape: "circle", color: "green" }
										}
									],
									type: "rows"
								}
							},
							key: "VOLKSWAGEN",
							value: 115000,
							levelIndex: 1,
							parentLevelKey: 2026,
							attachedDataRows: [
								{
									year: 2026,
									yearColor: "#ccc",
									brand: "VOLKSWAGEN",
									price: 115_000,
									decade: "2020s"
								}
							]
						}
					],
					sizes: { innerRadius: 30.4, outerRadius: 40, thickness: 9.6, translate: { x: 50, y: 50 } }
				}
			]);
		});

		test("should build a level model for two levels with custom thickness", () => {
			const levelModelBuilder = new LevelModelBuilder({
				blockSize,
				margin,
				scopedDataRows,
				topLevelColors: ["red", "green", "blue"],
				formatter: (value) => value.toFixed(2)
			});

			const levelModel = levelModelBuilder.build({
				data: {
					dataSource: "data",
					valueField: {
						name: "price",
						format: "money",
						title: "Стоимость"
					}
				},
				levels: [
					{
						data: {
							keyField: {
								name: "year"
							}
						},
						canvas: {
							thickness: {
								min: "40%",
								max: "40%",
								value: "40%"
							}
						}
					},
					{
						data: {
							keyField: {
								name: "brand"
							}
						},
						canvas: {
							thickness: {
								min: "10%",
								max: "10%",
								value: "10%"
							}
						}
					}
				]
			});

			expect(levelModel[0].sizes).toEqual({
				innerRadius: 19.6,
				outerRadius: 35.6,
				thickness: 16,
				translate: { x: 50, y: 50 }
			});
			expect(levelModel[1].sizes).toEqual({
				innerRadius: 36,
				outerRadius: 40,
				thickness: 4,
				translate: { x: 50, y: 50 }
			});
		});

		test("should calculate radiuses for 2+ levels correctly", () => {
			const levelModelBuilder = new LevelModelBuilder({
				blockSize: {
					height: 200,
					width: 200
				},
				margin: {
					top: 25,
					left: 25,
					right: 25,
					bottom: 25
				},
				scopedDataRows,
				topLevelColors: ["red", "green", "blue"],
				formatter: (value) => value.toFixed(2)
			});

			const levelModel = levelModelBuilder.build({
				data: {
					dataSource: "data",
					valueField: {
						name: "price",
						format: "money",
						title: "Стоимость"
					}
				},
				levels: [
					{
						data: {
							keyField: {
								name: "decade"
							}
						}
					},
					{
						data: {
							keyField: {
								name: "year"
							}
						}
					},
					{
						data: {
							keyField: {
								name: "brand"
							}
						}
					}
				]
			});

			expect(levelModel[0].sizes).toEqual({
				innerRadius: 37.5,
				outerRadius: 49.5,
				thickness: 12,
				translate: { x: 100, y: 100 }
			});
			expect(levelModel[1].sizes).toEqual({
				innerRadius: 50.25,
				outerRadius: 62.25,
				thickness: 12,
				translate: { x: 100, y: 100 }
			});
			expect(levelModel[2].sizes).toEqual({
				innerRadius: 63,
				outerRadius: 75,
				thickness: 12,
				translate: { x: 100, y: 100 }
			});
		});

		test("should build a level model for two levels without custom thickness", () => {
			const levelModelBuilder = new LevelModelBuilder({
				blockSize,
				margin,
				scopedDataRows,
				topLevelColors: ["red", "green", "blue"],
				formatter: (value) => value.toFixed(2)
			});

			const levelModel = levelModelBuilder.build({
				data: {
					dataSource: "data",
					valueField: {
						name: "price",
						format: "money",
						title: "Стоимость"
					}
				},
				levels: [
					{
						data: {
							keyField: {
								name: "year"
							},
							colorField: { name: "yearColor" }
						}
					},
					{
						data: {
							keyField: {
								name: "brand"
							}
						}
					}
				]
			});

			expect(levelModel[0].segments[0].color).toEqual("#aaa");
			expect(levelModel[0].segments[1].color).toEqual("#ccc");
			expect(levelModel[1].segments[0].color).toEqual("#aaa");
			expect(levelModel[1].segments[1].color).toEqual("#aaa");
			expect(levelModel[1].segments[2].color).toEqual("#ccc");
			expect(levelModel[1].segments[3].color).toEqual("#ccc");
		});
	});
});
