import { GroupingLabelsCoordinateScaler } from "./groupingLabelsScaler";

describe("GroupingLabelsCoordinateScaler", () => {
	it("should set center of range if there is only one row", () => {
		const scaler = new GroupingLabelsCoordinateScaler({
			dataRows: [{ brand: "brand1" }],
			field: { name: "brand" },
			keyAxisOuterPadding: 20,
			keyAxisInnerPadding: 10,
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
			keyAxisInnerPadding: 10,
			range: { start: 0, end: 100 }
		});
		expect(scaler.scaleForKey("brand1")).toBe(17);
		expect(scaler.scaleForKey("brand2")).toBe(72);
	});

	it("shouldn't change coordinate by inner padding for rows that is not first or last", () => {
		const scaler = new GroupingLabelsCoordinateScaler({
			dataRows: [
				{ brand: "brand1" },
				{ brand: "brand1" },
				{ brand: "brand1" },
				{ brand: "brand2" },
				{ brand: "brand2" },
				{ brand: "brand2" },
				{ brand: "brand3" },
				{ brand: "brand3" },
				{ brand: "brand3" }
			],
			field: { name: "brand" },
			keyAxisOuterPadding: 10,
			keyAxisInnerPadding: 5,
			range: { start: 0, end: 105 }
		});
		expect(scaler.scaleForKey("brand1")).toBe(22.5);
		expect(scaler.scaleForKey("brand2")).toBe(52.5);
		expect(scaler.scaleForKey("brand3")).toBe(82.5);
	});
});
