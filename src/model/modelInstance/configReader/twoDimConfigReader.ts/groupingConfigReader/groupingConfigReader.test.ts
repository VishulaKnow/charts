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
});
