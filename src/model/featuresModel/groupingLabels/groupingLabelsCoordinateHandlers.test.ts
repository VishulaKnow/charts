import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { GroupingLabelsCoordinateHandlers } from "./groupingLabelsCoordinateHandlers";

describe("GroupingLabelsCoordinateHandlers", () => {
	const canvasModel = new CanvasModel();
	canvasModel.initBlockSize({ width: 800, height: 400 });
	canvasModel.initMargin({ top: 20, bottom: 20, left: 10, right: 10 });

	it("should set static coordinate for y and x coordinate with added left margin for top orient", () => {
		const coordinateHandler = new GroupingLabelsCoordinateHandlers(canvasModel, "top", 0);
		const coordinate = coordinateHandler.handleCoordinate({ x: 100, y: 100 });
		expect(coordinate).toEqual({ x: 110, y: 20 });
	});

	it("should set static coordinate for y and x coordinate with added right margin for bottom orient", () => {
		const coordinateHandler = new GroupingLabelsCoordinateHandlers(canvasModel, "bottom", 0);
		const coordinate = coordinateHandler.handleCoordinate({ x: 100, y: 100 });
		expect(coordinate).toEqual({ x: 110, y: 380 });
	});
});
