import { Orient } from "../../../model";
import { CanvasModel } from "../../../modelInstance/canvasModel/canvasModel";
import { GroupingStaticCoordinateCalculator } from "./staticCoordinateCalculator";

interface GroupingLabelsCoordinateHandlerOptions {
	orient: Orient;
	sideIndex: number;
	staticCoordinateCalculator: GroupingStaticCoordinateCalculator;
	canvasModel: CanvasModel;
}

export class GroupingLabelsCoordinateHandler {
	private readonly staticCoordinate: number;

	constructor(private readonly options: GroupingLabelsCoordinateHandlerOptions) {
		this.staticCoordinate = this.options.staticCoordinateCalculator.calculate(
			this.options.orient,
			this.options.sideIndex
		);
	}

	handleX(scaledCoordinate: number) {
		let x: number;
		if (this.options.orient === "top" || this.options.orient === "bottom")
			x = scaledCoordinate + this.options.canvasModel.getMarginSide("left");
		else x = this.staticCoordinate;
		return x;
	}

	handleY(scaledCoordinate: number) {
		let y: number;
		if (this.options.orient === "left" || this.options.orient === "right")
			y = scaledCoordinate + this.options.canvasModel.getMarginSide("top");
		else y = this.staticCoordinate;
		return y;
	}
}
