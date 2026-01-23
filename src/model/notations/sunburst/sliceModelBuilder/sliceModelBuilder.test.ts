import { BlockMargin, MdtChartsDataRow, Size } from "../../../../config/config";
import { SunburstSlice } from "../../../model";
import { SliceModelBuilder } from "./sliceModelBuilder";

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
		year: 2020,
		brand: "BMW",
		price: 100_000
	},
	{
		year: 2020,
		brand: "AUDI",
		price: 120_000
	},
	{
		year: 2026,
		brand: "MERCEDES",
		price: 150_000
	},
	{
		year: 2026,
		brand: "VOLKSWAGEN",
		price: 115_000
	}
];

describe("SliceModelBuilder", () => {
	describe("build", () => {
		test("should build a slice model for two slices without custom thickness", () => {
			const sliceModelBuilder = new SliceModelBuilder({
				blockSize,
				margin,
				scopedDataRows,
				topSliceColors: ["red", "green", "blue"]
			});

			const sliceModel = sliceModelBuilder.build({
				data: {
					dataSource: "data",
					valueField: {
						name: "price",
						format: "money",
						title: "Стоимость"
					}
				},
				slices: [
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

			expect(sliceModel).toEqual(<SunburstSlice[]>[
				{
					segments: [
						{
							color: "red",
							tooltip: {
								content: { rows: [{ textContent: { caption: 2020, value: 220000 } }], type: "rows" }
							},
							value: 220000
						},
						{
							color: "green",
							tooltip: {
								content: { rows: [{ textContent: { caption: 2026, value: 265000 } }], type: "rows" }
							},
							value: 265000
						}
					],
					sizes: { innerRadius: 20, outerRadius: 30, thickness: 10, translate: { x: 50, y: 50 } }
				},
				{
					segments: [
						{
							color: "red",
							tooltip: {
								content: { rows: [{ textContent: { caption: "BMW", value: 100000 } }], type: "rows" }
							},
							value: 100000
						},
						{
							color: "red",
							tooltip: {
								content: { rows: [{ textContent: { caption: "AUDI", value: 120000 } }], type: "rows" }
							},
							value: 120000
						},
						{
							color: "green",
							tooltip: {
								content: {
									rows: [{ textContent: { caption: "MERCEDES", value: 150000 } }],
									type: "rows"
								}
							},
							value: 150000
						},
						{
							color: "green",
							tooltip: {
								content: {
									rows: [{ textContent: { caption: "VOLKSWAGEN", value: 115000 } }],
									type: "rows"
								}
							},
							value: 115000
						}
					],
					sizes: { innerRadius: 30.5, outerRadius: 40, thickness: 10, translate: { x: 50, y: 50 } }
				}
			]);
		});

		test("should build a slice model for two slices with custom thickness", () => {
			const sliceModelBuilder = new SliceModelBuilder({
				blockSize,
				margin,
				scopedDataRows,
				topSliceColors: ["red", "green", "blue"]
			});

			const sliceModel = sliceModelBuilder.build({
				data: {
					dataSource: "data",
					valueField: {
						name: "price",
						format: "money",
						title: "Стоимость"
					}
				},
				slices: [
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

			expect(sliceModel[0].sizes).toEqual({
				innerRadius: 20,
				outerRadius: 36,
				thickness: 16,
				translate: { x: 50, y: 50 }
			});
			expect(sliceModel[1].sizes).toEqual({
				innerRadius: 36.5,
				outerRadius: 40,
				thickness: 4,
				translate: { x: 50, y: 50 }
			});
		});
	});
});
