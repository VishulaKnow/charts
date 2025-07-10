import { CanvasModel } from "../../../modelInstance/canvasModel/canvasModel";
import { GroupingCanvasCalculator } from "../groupingCanvasCalculator/groupingCanvasCalculator";
import { GroupingStaticCoordinateCalculator } from "../groupingLabels/staticCoordinateCalculator";
import { GroupingSplitLinesGenerator } from "./groupingSplitLines";

describe("GroupingSplitLinesGenerator", () => {
	const canvasModel = new CanvasModel();
	canvasModel.initBlockSize({ width: 100, height: 100 });
	canvasModel.initMargin({ top: 20, bottom: 20, left: 5, right: 5 });

	describe("generate", () => {
		it("should set split line in the middle between two records in group (bottom)", () => {
			const staticCoordinateCalculator = new GroupingStaticCoordinateCalculator(canvasModel, {
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
				groupingCanvasCalculator: new GroupingCanvasCalculator({
					dataRows: [{ brand: "brand1" }, { brand: "brand2" }],
					field: { name: "brand" },
					keyScaleInfo: { type: "band", keyAxisOuterPadding: 0, keyAxisInnerPadding: 10 },
					range: { start: 0, end: 90 }
				})
			});

			const splitLines = groupingSplitLinesGenerator.generate();
			expect(splitLines).toEqual([{ x1: 50, x2: 50, y1: 80, y2: 90 }]);
		});

		it("should set split line in the middle between two records in group (with multiple records in the group) (bottom)", () => {
			const staticCoordinateCalculator = new GroupingStaticCoordinateCalculator(canvasModel, {
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
				groupingCanvasCalculator: new GroupingCanvasCalculator({
					dataRows: [{ brand: "brand1" }, { brand: "brand2" }, { brand: "brand3" }, { brand: "brand4" }],
					field: { name: "brand" },
					keyScaleInfo: { type: "band", keyAxisOuterPadding: 10, keyAxisInnerPadding: 10 },
					range: { start: 0, end: 90 }
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
			const staticCoordinateCalculator = new GroupingStaticCoordinateCalculator(canvasModel, {
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
				groupingCanvasCalculator: new GroupingCanvasCalculator({
					dataRows: [{ brand: "brand1" }, { brand: "brand2" }, { brand: "brand3" }, { brand: "brand4" }],
					field: { name: "brand" },
					keyScaleInfo: { type: "band", keyAxisOuterPadding: 10, keyAxisInnerPadding: 10 },
					range: { start: 0, end: 90 }
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
