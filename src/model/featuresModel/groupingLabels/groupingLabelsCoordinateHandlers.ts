import { Orient } from "../../model";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";

export class GroupingLabelsCoordinateHandler {
	private readonly staticCoordinate: number;

	constructor(
		private readonly canvasModel: CanvasModel,
		private readonly orient: Orient,
		private readonly sideIndex: number
	) {
		//TODO: padding should be got from other components
		if (this.orient === "top") this.staticCoordinate = 20 + 20 * this.sideIndex;
		if (this.orient === "bottom")
			this.staticCoordinate = this.canvasModel.getBlockSize().height - 20 - 20 * this.sideIndex;
		if (this.orient === "left") this.staticCoordinate = 20 * this.sideIndex;
		if (this.orient === "right")
			this.staticCoordinate = this.canvasModel.getBlockSize().width - 20 * this.sideIndex;
	}

	handleX(scaledCoordinate: number) {
		let x: number;

		if (this.orient === "top" || this.orient === "bottom")
			x = scaledCoordinate + this.canvasModel.getMarginSide("left");
		else x = this.staticCoordinate;

		return x;
	}

	handleY(scaledCoordinate: number) {
		let y: number;
		if (this.orient === "left" || this.orient === "right")
			y = scaledCoordinate + this.canvasModel.getMarginSide("top");
		else y = this.staticCoordinate;
		return y;
	}
}
