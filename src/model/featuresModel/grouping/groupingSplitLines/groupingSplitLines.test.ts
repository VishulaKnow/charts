import { CanvasModel } from "../../../modelInstance/canvasModel/canvasModel";
import { ScaleCanvasSizesCalculator } from "../../scaleModel/sizaCalculators/scaleCanvasSizesCalculator";
import { GroupingDataAmountCalculator } from "../groupingDataAmountCalculator/groupingDataAmountCalculator";
import { GroupingStaticCoordinateCalculator } from "../groupingLabels/staticCoordinateCalculator";
import { GroupingSplitLinesGenerator } from "./groupingSplitLines";

describe("GroupingSplitLinesGenerator", () => {
	const canvasModel = new CanvasModel();
	canvasModel.initBlockSize({ width: 100, height: 100 });
	canvasModel.initMargin({ top: 20, bottom: 20, left: 5, right: 5 });

	describe("generate", () => {
		it("should set split line in the middle between two records in group (bottom)", () => {
			const groupingSplitLinesGenerator = new GroupingSplitLinesGenerator({
				canvasModel,
				staticCoordinateCalculator: new GroupingStaticCoordinateCalculator({
					canvasModel,
					otherComponentSizes: {
						legendTotalNeededSpace: 10,
						titleTotalNeededSpace: 10
					},
					groupingItemSizes: [{ orient: "top", size: 10 }]
				}),
				orient: "bottom",
				sideIndex: 0,
				dataAmountCalculator: new GroupingDataAmountCalculator({
					dataRows: [{ brand: "brand1" }, { brand: "brand2" }],
					field: { name: "brand" }
				}),
				sizesCalculator: new ScaleCanvasSizesCalculator({
					keyScale: {
						type: "band",
						sizes: {
							paddingInner: 10,
							paddingOuter: 0,
							oneKeyTotalSpace: 20,
							recalculatedStepSize: 10,
							bandSize: 10
						},
						domain: ["1", "2"],
						range: { start: 0, end: 90 }
					}
				})
			});

			const splitLines = groupingSplitLinesGenerator.generate();
			expect(splitLines).toEqual([{ x1: 50, x2: 50, y1: 80, y2: 90 }]);
		});

		it("should set split line in the middle between two records in group (with multiple records in the group) (bottom)", () => {
			const staticCoordinateCalculator = new GroupingStaticCoordinateCalculator({
				canvasModel,
				otherComponentSizes: {
					legendTotalNeededSpace: 10,
					titleTotalNeededSpace: 10
				},
				groupingItemSizes: [{ orient: "top", size: 10 }]
			});

			const groupingSplitLinesGenerator = new GroupingSplitLinesGenerator({
				canvasModel,
				staticCoordinateCalculator,
				orient: "bottom",
				sideIndex: 0,
				dataAmountCalculator: new GroupingDataAmountCalculator({
					dataRows: [{ brand: "brand1" }, { brand: "brand2" }, { brand: "brand3" }, { brand: "brand4" }],
					field: { name: "brand" }
				}),
				sizesCalculator: new ScaleCanvasSizesCalculator({
					keyScale: {
						type: "band",
						sizes: {
							paddingInner: 10,
							paddingOuter: 10,
							oneKeyTotalSpace: 20,
							recalculatedStepSize: 10,
							bandSize: 10
						},
						domain: ["1", "2", "3", "4"],
						range: { start: 0, end: 90 }
					}
				})
			});

			const splitLines = groupingSplitLinesGenerator.generate();
			expect(splitLines).toEqual([
				{ x1: 30, x2: 30, y1: 80, y2: 90 },
				{ x1: 50, x2: 50, y1: 80, y2: 90 },
				{ x1: 70, x2: 70, y1: 80, y2: 90 }
			]);
		});

		it("should set split line in the middle between two records in group (with multiple records in the group) (top)", () => {
			const staticCoordinateCalculator = new GroupingStaticCoordinateCalculator({
				canvasModel,
				otherComponentSizes: {
					legendTotalNeededSpace: 10,
					titleTotalNeededSpace: 10
				},
				groupingItemSizes: [{ orient: "top", size: 10 }]
			});

			const groupingSplitLinesGenerator = new GroupingSplitLinesGenerator({
				canvasModel,
				staticCoordinateCalculator,
				orient: "top",
				sideIndex: 0,
				dataAmountCalculator: new GroupingDataAmountCalculator({
					dataRows: [{ brand: "brand1" }, { brand: "brand2" }, { brand: "brand3" }, { brand: "brand4" }],
					field: { name: "brand" }
				}),
				sizesCalculator: new ScaleCanvasSizesCalculator({
					keyScale: {
						type: "band",
						sizes: {
							paddingInner: 10,
							paddingOuter: 10,
							oneKeyTotalSpace: 20,
							recalculatedStepSize: 10,
							bandSize: 10
						},
						domain: ["1", "2", "3", "4"],
						range: { start: 0, end: 90 }
					}
				})
			});

			const splitLines = groupingSplitLinesGenerator.generate();
			expect(splitLines).toEqual([
				{ x1: 30, x2: 30, y1: 10, y2: 20 },
				{ x1: 50, x2: 50, y1: 10, y2: 20 },
				{ x1: 70, x2: 70, y1: 10, y2: 20 }
			]);
		});
	});
});
