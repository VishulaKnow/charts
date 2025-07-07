import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { GroupingLabelsCoordinateHandler } from "./groupingLabelsCoordinateHandlers";

describe("GroupingLabelsCoordinateHandlers", () => {
	const canvasModel = new CanvasModel();
	canvasModel.initBlockSize({ width: 800, height: 400 });
	canvasModel.initMargin({ top: 20, bottom: 20, left: 10, right: 10 });

	describe("handleX", () => {
		it("should return x coordinate with added left margin for top orient", () => {
			const coordinateHandler = new GroupingLabelsCoordinateHandler(canvasModel, "top", 0);
			const coordinate = coordinateHandler.handleX(100);
			expect(coordinate).toEqual(110);
		});

		it("should return x coordinate with added left margin for bottom orient", () => {
			const coordinateHandler = new GroupingLabelsCoordinateHandler(canvasModel, "bottom", 0);
			const coordinate = coordinateHandler.handleX(100);
			expect(coordinate).toEqual(110);
		});
	});

	describe("handleY", () => {
		it("should return static y coordinate for top orient", () => {
			const coordinateHandler = new GroupingLabelsCoordinateHandler(canvasModel, "top", 0);
			const coordinate = coordinateHandler.handleY(100);
			expect(coordinate).toEqual(20);
		});

		it("should return static y coordinate for bottom orient", () => {
			const coordinateHandler = new GroupingLabelsCoordinateHandler(canvasModel, "bottom", 0);
			const coordinate = coordinateHandler.handleY(100);
			expect(coordinate).toEqual(380);
		});
	});
});
