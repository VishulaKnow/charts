import { CanvasModel } from "../../../modelInstance/canvasModel/canvasModel";
import { GroupingLabelsCoordinateHandler } from "./groupingLabelsCoordinateHandlers";

describe("GroupingLabelsCoordinateHandlers", () => {
	const canvasModel = new CanvasModel();
	canvasModel.initBlockSize({ width: 800, height: 400 });
	canvasModel.initMargin({ top: 20, bottom: 20, left: 10, right: 10 });

	describe("handleX", () => {
		it("should return x coordinate with added left margin for top orient", () => {
			const coordinateHandler = new GroupingLabelsCoordinateHandler(canvasModel, {
				orient: "top",
				sideIndex: 0,
				otherComponentSizes: {
					titleTotalNeededSpace: 20,
					legendTotalNeededSpace: 30
				},
				groupingItemSizes: [{ orient: "top", size: 20 }]
			});
			const coordinate = coordinateHandler.handleX(100);
			expect(coordinate).toEqual(110);
		});

		it("should return x coordinate with added left margin for bottom orient", () => {
			const coordinateHandler = new GroupingLabelsCoordinateHandler(canvasModel, {
				orient: "bottom",
				sideIndex: 0,
				otherComponentSizes: {
					titleTotalNeededSpace: 20,
					legendTotalNeededSpace: 30
				},
				groupingItemSizes: [{ orient: "bottom", size: 20 }]
			});
			const coordinate = coordinateHandler.handleX(100);
			expect(coordinate).toEqual(110);
		});

		it("should handle x coordinate for multiple slices for left orient", () => {
			const coordinateHandler = new GroupingLabelsCoordinateHandler(canvasModel, {
				orient: "left",
				sideIndex: 1,
				otherComponentSizes: {
					titleTotalNeededSpace: 20,
					legendTotalNeededSpace: 30
				},
				groupingItemSizes: [
					{ orient: "left", size: 15 },
					{ orient: "right", size: 10 },
					{ orient: "left", size: 20 }
				]
			});
			const coordinate = coordinateHandler.handleX(100);
			expect(coordinate).toEqual(15);
		});

		it("should handle x coordinate for multiple slices for bottom orient", () => {
			const coordinateHandler = new GroupingLabelsCoordinateHandler(canvasModel, {
				orient: "right",
				sideIndex: 1,
				otherComponentSizes: {
					titleTotalNeededSpace: 20,
					legendTotalNeededSpace: 30
				},
				groupingItemSizes: [
					{ orient: "right", size: 15 },
					{ orient: "left", size: 10 },
					{ orient: "right", size: 20 }
				]
			});
			const coordinate = coordinateHandler.handleX(100);
			expect(coordinate).toEqual(785);
		});
	});

	describe("handleY", () => {
		it("should return static y coordinate for top orient", () => {
			const coordinateHandler = new GroupingLabelsCoordinateHandler(canvasModel, {
				orient: "top",
				sideIndex: 0,
				otherComponentSizes: {
					titleTotalNeededSpace: 20,
					legendTotalNeededSpace: 30
				},
				groupingItemSizes: [{ orient: "top", size: 20 }]
			});
			const coordinate = coordinateHandler.handleY(100);
			expect(coordinate).toEqual(20);
		});

		it("should return static y coordinate for bottom orient", () => {
			const coordinateHandler = new GroupingLabelsCoordinateHandler(canvasModel, {
				orient: "bottom",
				sideIndex: 0,
				otherComponentSizes: {
					titleTotalNeededSpace: 20,
					legendTotalNeededSpace: 30
				},
				groupingItemSizes: [{ orient: "bottom", size: 20 }]
			});
			const coordinate = coordinateHandler.handleY(100);
			expect(coordinate).toEqual(370);
		});

		it("should handle y coordinate for multiple slices", () => {
			const coordinateHandler = new GroupingLabelsCoordinateHandler(canvasModel, {
				orient: "bottom",
				sideIndex: 1,
				otherComponentSizes: {
					titleTotalNeededSpace: 20,
					legendTotalNeededSpace: 30
				},
				groupingItemSizes: [
					{ orient: "top", size: 10 },
					{ orient: "bottom", size: 20 },
					{ orient: "top", size: 10 },
					{ orient: "bottom", size: 20 }
				]
			});
			const coordinate = coordinateHandler.handleY(100);
			expect(coordinate).toEqual(350);
		});
	});
});
