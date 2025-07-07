import { GroupingConfigReader } from "./groupingConfigReader";

describe("GroupingConfigReader", () => {
	describe("getSlicesByOrients", () => {
		it("should return slices for axis position side if position is start or empty", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "start" },
				"vertical",
				{
					items: [
						{ labels: { position: "start" }, data: { field: { name: "field", format: "string" } } },
						{ data: { field: { name: "field2", format: "string" } } }
					]
				}
			);

			const slices = reader.getSlicesByOrients();
			expect(slices).toEqual([{ orient: "top", amount: 2 }]);
		});

		it("should return slices for axis position side if position is end", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "end" },
				"vertical",
				{ items: [{ labels: { position: "end" }, data: { field: { name: "field", format: "string" } } }] }
			);

			const slices = reader.getSlicesByOrients();
			expect(slices).toEqual([{ orient: "bottom", amount: 1 }]);
		});

		it("should return slices for axis position side if position is start and orientation is horizontal", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "start" },
				"horizontal",
				{
					items: [
						{ labels: { position: "start" }, data: { field: { name: "field", format: "string" } } },
						{ data: { field: { name: "field2", format: "string" } } },
						{ labels: { position: "end" }, data: { field: { name: "field3", format: "string" } } }
					]
				}
			);

			const slices = reader.getSlicesByOrients();
			expect(slices).toEqual([
				{ orient: "left", amount: 2 },
				{ orient: "right", amount: 1 }
			]);
		});

		it("should return no slices if grouping is disabled", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "end" },
				"horizontal"
			);

			const slices = reader.getSlicesByOrients();
			expect(slices).toEqual([]);
		});
	});

	describe("readGroupingItemsValues", () => {
		it("should return empty array if grouping is disabled", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "end" },
				"horizontal"
			);
			const values = reader.getPreparedOptions([]);
			expect(values).toEqual([]);
		});

		it("should return values for grouping items", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "end" },
				"horizontal",
				{
					items: [{ data: { field: { name: "field", format: "string" } } }]
				}
			);
			const values = reader.getPreparedOptions([{ field: "value1" }, { field: "value2" }, { field: "value1" }]);
			expect(values).toEqual([
				{
					domain: ["value1", "value2"],
					orient: "right",
					sideIndex: 0,
					field: { name: "field", format: "string" },
					textAnchor: "end",
					dominantBaseline: "middle"
				}
			]);
		});

		it("should return values for grouping with multiple items", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "end" },
				"vertical",
				{
					items: [
						{ data: { field: { name: "field", format: "string" } } },
						{ data: { field: { name: "field3", format: "string" } }, labels: { position: "end" } },
						{ data: { field: { name: "field2", format: "string" } }, labels: { position: "start" } }
					]
				}
			);
			const values = reader.getPreparedOptions([
				{ field: "value1", field2: "value3", field3: "value2" },
				{ field: "value1", field2: "value2", field3: "value2" },
				{ field: "value2", field2: "value2", field3: "value2" }
			]);
			expect(values).toEqual([
				{
					domain: ["value1", "value2"],
					orient: "bottom",
					sideIndex: 0,
					field: { name: "field", format: "string" },
					textAnchor: "middle",
					dominantBaseline: "auto"
				},
				{
					domain: ["value2"],
					orient: "bottom",
					sideIndex: 1,
					field: { name: "field3", format: "string" },
					textAnchor: "middle",
					dominantBaseline: "auto"
				},
				{
					domain: ["value3", "value2"],
					orient: "top",
					sideIndex: 0,
					field: { name: "field2", format: "string" },
					textAnchor: "middle",
					dominantBaseline: "hanging"
				}
			]);
		});
	});
});
