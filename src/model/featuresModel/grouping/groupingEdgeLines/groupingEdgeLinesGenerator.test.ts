import { CanvasModel } from "../../../modelInstance/canvasModel/canvasModel";
import { GroupingStaticCoordinateCalculator } from "../groupingLabels/staticCoordinateCalculator";
import { GroupingEdgeLinesGenerator } from "./groupingEdgeLinesGenerator";

describe("GroupingEdgeLinesGenerator", () => {
	const canvasModel = new CanvasModel();
	canvasModel.initBlockSize({ width: 100, height: 100 });
	canvasModel.initMargin({ top: 20, bottom: 20, left: 20, right: 20 });

	describe("generate", () => {
		it("should return two edge lines for one group (top)", () => {
			const staticCoordinateCalculator = new GroupingStaticCoordinateCalculator(canvasModel, {
				otherComponentSizes: {
					legendTotalNeededSpace: 10,
					titleTotalNeededSpace: 10
				},
				groupingItemSizes: [{ orient: "top", size: 10 }]
			});
			const groupingEdgeLinesGenerator = new GroupingEdgeLinesGenerator({
				canvasModel,
				orients: new Set(["top"]),
				staticCoordinateCalculator,
				lineWidth: 1
			});

			const edgeLines = groupingEdgeLinesGenerator.generate();
			expect(edgeLines).toEqual([
				{ x1: 20.5, x2: 20.5, y1: 10, y2: 20 },
				{ x1: 79.5, x2: 79.5, y1: 10, y2: 20 }
			]);
		});

		it("should return two edge lines for one group (bottom)", () => {
			const staticCoordinateCalculator = new GroupingStaticCoordinateCalculator(canvasModel, {
				otherComponentSizes: {
					legendTotalNeededSpace: 10,
					titleTotalNeededSpace: 10
				},
				groupingItemSizes: [{ orient: "bottom", size: 10 }]
			});
			const groupingEdgeLinesGenerator = new GroupingEdgeLinesGenerator({
				canvasModel,
				orients: new Set(["bottom"]),
				staticCoordinateCalculator,
				lineWidth: 1
			});

			const edgeLines = groupingEdgeLinesGenerator.generate();
			expect(edgeLines).toEqual([
				{ x1: 20.5, x2: 20.5, y1: 80, y2: 90 },
				{ x1: 79.5, x2: 79.5, y1: 80, y2: 90 }
			]);
		});

		it("should return two edge lines for one group (left)", () => {
			const staticCoordinateCalculator = new GroupingStaticCoordinateCalculator(canvasModel, {
				otherComponentSizes: {
					legendTotalNeededSpace: 10,
					titleTotalNeededSpace: 10
				},
				groupingItemSizes: [{ orient: "left", size: 10 }]
			});
			const groupingEdgeLinesGenerator = new GroupingEdgeLinesGenerator({
				canvasModel,
				orients: new Set(["left"]),
				staticCoordinateCalculator,
				lineWidth: 1
			});

			const edgeLines = groupingEdgeLinesGenerator.generate();
			expect(edgeLines).toEqual([
				{ x1: 0, x2: 20, y1: 20.5, y2: 20.5 },
				{ x1: 0, x2: 20, y1: 79.5, y2: 79.5 }
			]);
		});

		it("should return two edge lines for one group (bottom)", () => {
			const staticCoordinateCalculator = new GroupingStaticCoordinateCalculator(canvasModel, {
				otherComponentSizes: {
					legendTotalNeededSpace: 10,
					titleTotalNeededSpace: 10
				},
				groupingItemSizes: [{ orient: "right", size: 10 }]
			});
			const groupingEdgeLinesGenerator = new GroupingEdgeLinesGenerator({
				canvasModel,
				orients: new Set(["right"]),
				staticCoordinateCalculator,
				lineWidth: 1
			});

			const edgeLines = groupingEdgeLinesGenerator.generate();
			expect(edgeLines).toEqual([
				{ x1: 80, x2: 100, y1: 20.5, y2: 20.5 },
				{ x1: 80, x2: 100, y1: 79.5, y2: 79.5 }
			]);
		});

		it("should return four edge lines for two groups", () => {
			const staticCoordinateCalculator = new GroupingStaticCoordinateCalculator(canvasModel, {
				otherComponentSizes: {
					legendTotalNeededSpace: 10,
					titleTotalNeededSpace: 10
				},
				groupingItemSizes: [
					{ orient: "bottom", size: 10 },
					{ orient: "top", size: 10 }
				]
			});
			const groupingEdgeLinesGenerator = new GroupingEdgeLinesGenerator({
				canvasModel,
				orients: new Set(["bottom", "top"]),
				staticCoordinateCalculator,
				lineWidth: 1
			});

			const edgeLines = groupingEdgeLinesGenerator.generate();
			expect(edgeLines).toEqual([
				{ x1: 20.5, x2: 20.5, y1: 80, y2: 90 },
				{ x1: 79.5, x2: 79.5, y1: 80, y2: 90 },
				{ x1: 20.5, x2: 20.5, y1: 10, y2: 20 },
				{ x1: 79.5, x2: 79.5, y1: 10, y2: 20 }
			]);
		});

		it("should return four edge lines for more than two groups", () => {
			const staticCoordinateCalculator = new GroupingStaticCoordinateCalculator(canvasModel, {
				otherComponentSizes: {
					legendTotalNeededSpace: 10,
					titleTotalNeededSpace: 10
				},
				groupingItemSizes: [
					{ orient: "bottom", size: 10 },
					{ orient: "bottom", size: 10 },
					{ orient: "top", size: 10 },
					{ orient: "top", size: 10 }
				]
			});
			const groupingEdgeLinesGenerator = new GroupingEdgeLinesGenerator({
				canvasModel,
				orients: new Set(["bottom", "top"]),
				staticCoordinateCalculator,
				lineWidth: 1
			});

			const edgeLines = groupingEdgeLinesGenerator.generate();
			expect(edgeLines).toEqual([
				{ x1: 20.5, x2: 20.5, y1: 80, y2: 90 },
				{ x1: 79.5, x2: 79.5, y1: 80, y2: 90 },
				{ x1: 20.5, x2: 20.5, y1: 10, y2: 20 },
				{ x1: 79.5, x2: 79.5, y1: 10, y2: 20 }
			]);
		});
	});
});
