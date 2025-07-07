import { GroupingLabelsCoordinateScaler } from "./groupingLabelsScaler";

describe("GroupingLabelsCoordinateScaler", () => {
	it("should set center of range if there is only one row", () => {
		const scaler = new GroupingLabelsCoordinateScaler({
			dataRows: [{ brand: "brand1" }],
			field: { name: "brand" },
			keyAxisOuterPadding: 20,
			range: { start: 0, end: 100 }
		});
		expect(scaler.scaleForKey("brand1")).toBe(50);
	});

	it("should set coordinates according to the number of rows of each item", () => {
		const scaler = new GroupingLabelsCoordinateScaler({
			dataRows: [
				{ brand: "brand1" },
				{ brand: "brand1" },
				{ brand: "brand2" },
				{ brand: "brand2" },
				{ brand: "brand2" }
			],
			field: { name: "brand" },
			keyAxisOuterPadding: 0,
			range: { start: 0, end: 100 }
		});
		expect(scaler.scaleForKey("brand1")).toBe(20);
		expect(scaler.scaleForKey("brand2")).toBe(70);
	});
});
