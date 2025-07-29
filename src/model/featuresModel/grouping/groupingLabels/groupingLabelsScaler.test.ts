import { ScaleCanvasSizesCalculator } from "../../scaleModel/sizaCalculators/scaleCanvasSizesCalculator";
import { GroupingDataAmountCalculator } from "../groupingDataAmountCalculator/groupingDataAmountCalculator";
import { GroupingLabelsCoordinateScaler } from "./groupingLabelsScaler";

describe("GroupingLabelsCoordinateScaler", () => {
	it("should set center of range if there is only one row", () => {
		const scaler = new GroupingLabelsCoordinateScaler({
			dataAmountCalculator: new GroupingDataAmountCalculator({
				dataRows: [{ brand: "brand1" }],
				field: { name: "brand" }
			}),
			sizesCalculator: new ScaleCanvasSizesCalculator({
				keyScale: {
					type: "band",
					sizes: {
						paddingInner: 10,
						paddingOuter: 20,
						oneKeyTotalSpace: 100,
						recalculatedStepSize: 10,
						bandSize: 10
					},
					domain: ["brand1"],
					range: { start: 0, end: 100 }
				}
			})
		});
		expect(scaler.scaleForKey("brand1")).toBe(50);
	});

	it("should set coordinates according to the number of rows of each item", () => {
		const scaler = new GroupingLabelsCoordinateScaler({
			dataAmountCalculator: new GroupingDataAmountCalculator({
				dataRows: [
					{ brand: "brand1" },
					{ brand: "brand1" },
					{ brand: "brand2" },
					{ brand: "brand2" },
					{ brand: "brand2" }
				],
				field: { name: "brand" }
			}),
			sizesCalculator: new ScaleCanvasSizesCalculator({
				keyScale: {
					type: "band",
					sizes: {
						paddingInner: 10,
						paddingOuter: 0,
						oneKeyTotalSpace: 100,
						recalculatedStepSize: 10,
						bandSize: 10
					},
					domain: ["1", "2", "3", "4", "5"],
					range: { start: 0, end: 100 }
				}
			})
		});
		expect(scaler.scaleForKey("brand1")).toBe(17);
		expect(scaler.scaleForKey("brand2")).toBe(72);
	});

	it("shouldn't change coordinate by inner padding for rows that is not first or last", () => {
		const scaler = new GroupingLabelsCoordinateScaler({
			dataAmountCalculator: new GroupingDataAmountCalculator({
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
				field: { name: "brand" }
			}),
			sizesCalculator: new ScaleCanvasSizesCalculator({
				keyScale: {
					type: "band",
					sizes: {
						paddingInner: 5,
						paddingOuter: 10,
						oneKeyTotalSpace: 100,
						recalculatedStepSize: 10,
						bandSize: 10
					},
					domain: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
					range: { start: 0, end: 105 }
				}
			})
		});
		expect(scaler.scaleForKey("brand1")).toBe(22.5);
		expect(scaler.scaleForKey("brand2")).toBe(52.5);
		expect(scaler.scaleForKey("brand3")).toBe(82.5);
	});

	it("should set coordinates correctly for point scale", () => {
		const scaler = new GroupingLabelsCoordinateScaler({
			dataAmountCalculator: new GroupingDataAmountCalculator({
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
				field: { name: "brand" }
			}),
			sizesCalculator: new ScaleCanvasSizesCalculator({
				keyScale: {
					type: "point",
					domain: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
					range: { start: 0, end: 100 }
				}
			})
		});
		expect(scaler.scaleForKey("brand1")).toBe(12.5);
		expect(scaler.scaleForKey("brand2")).toBe(50);
		expect(scaler.scaleForKey("brand3")).toBe(87.5);
	});

	it("should set coordinates correctly for edge points of point scale", () => {
		const scaler = new GroupingLabelsCoordinateScaler({
			dataAmountCalculator: new GroupingDataAmountCalculator({
				dataRows: [{ brand: "brand1" }, { brand: "brand2" }, { brand: "brand2" }, { brand: "brand3" }],
				field: { name: "brand" }
			}),
			sizesCalculator: new ScaleCanvasSizesCalculator({
				keyScale: {
					type: "point",
					domain: ["1", "2", "3", "4"],
					range: { start: 0, end: 100 }
				}
			})
		});
		expect(scaler.scaleForKey("brand1")).toBe(0);
		expect(scaler.scaleForKey("brand2")).toBe(50);
		expect(scaler.scaleForKey("brand3")).toBe(100);
	});
});
