import { GroupingConfigReader } from "./groupingConfigReader";

describe("GroupingConfigReader", () => {
	describe("getSlicesSizesByOrients", () => {
		it("should return slices for axis position side if position is start or empty", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "start" },
				"vertical",
				{
					items: [
						{ labels: { position: "start" }, data: { field: { name: "field" } } },
						{ data: { field: { name: "field2" } } }
					]
				}
			);

			const slices = reader.getSlicesSizesByOrients([{ field: "value1" }, { field: "value2" }]);
			expect(slices).toEqual([
				{ orient: "top", size: 14 },
				{ orient: "top", size: 14 }
			]);
		});

		it("should return slices for axis position side if position is end", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "end" },
				"vertical",
				{ items: [{ labels: { position: "end" }, data: { field: { name: "field" } } }] }
			);

			const slices = reader.getSlicesSizesByOrients([{ field: "value1" }]);
			expect(slices).toEqual([{ orient: "bottom", size: 14 }]);
		});

		it("should return slices for axis position side if position is start and orientation is horizontal", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "start" },
				"horizontal",
				{
					items: [
						{ labels: { position: "start" }, data: { field: { name: "field" } } },
						{ data: { field: { name: "field2" } } },
						{ labels: { position: "end" }, data: { field: { name: "field3" } } }
					]
				}
			);

			const slices = reader.getSlicesSizesByOrients([{ field: "v1", field2: "value2", field3: "value3" }]);
			expect(slices).toEqual([
				{ orient: "left", size: 15 },
				{ orient: "left", size: 47 },
				{ orient: "right", size: 47 }
			]);
		});

		it("should return no slices if grouping is disabled", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "end" },
				"horizontal"
			);

			const slices = reader.getSlicesSizesByOrients([{ field: "value1" }]);
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
					items: [{ data: { field: { name: "field" } } }]
				}
			);
			const values = reader.getPreparedOptions([{ field: "value1" }, { field: "value2" }, { field: "value1" }]);
			expect(values).toEqual([
				{
					domain: ["value1", "value2"],
					orient: "right",
					sideIndex: 0,
					field: { name: "field" },
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
						{ data: { field: { name: "field" } } },
						{ data: { field: { name: "field3" } }, labels: { position: "end" } },
						{ data: { field: { name: "field2" } }, labels: { position: "start" } }
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
					field: { name: "field" },
					textAnchor: "middle",
					dominantBaseline: "auto"
				},
				{
					domain: ["value2"],
					orient: "bottom",
					sideIndex: 1,
					field: { name: "field3" },
					textAnchor: "middle",
					dominantBaseline: "auto"
				},
				{
					domain: ["value3", "value2"],
					orient: "top",
					sideIndex: 0,
					field: { name: "field2" },
					textAnchor: "middle",
					dominantBaseline: "hanging"
				}
			]);
		});
	});

	describe("getUsingOrients", () => {
		it("should return empty set if grouping is disabled", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "end" },
				"horizontal"
			);
			const orients = reader.getUsingOrients();
			expect(orients).toEqual(new Set());
		});

		it("should return one orient if all items have the same orient", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "end" },
				"horizontal",
				{
					items: [
						{ labels: { position: "end" }, data: { field: { name: "field" } } },
						{ data: { field: { name: "field" } } }
					]
				}
			);
			const orients = reader.getUsingOrients();
			expect(orients).toEqual(new Set(["right"]));
		});

		it("should return using orients without duplicates", () => {
			const reader = new GroupingConfigReader(
				{ visibility: true, ticks: { flag: true }, position: "end" },
				"horizontal",
				{
					items: [
						{ labels: { position: "start" }, data: { field: { name: "field" } } },
						{ data: { field: { name: "field2" } }, labels: { position: "end" } },
						{ data: { field: { name: "field3" } }, labels: { position: "end" } }
					]
				}
			);
			const orients = reader.getUsingOrients();
			expect(orients).toEqual(new Set(["right", "left"]));
		});
	});
});
