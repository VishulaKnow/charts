import { GroupingLabelCoordinate, Orient } from "../../model";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";

export class GroupingLabelsCoordinateHandlers {
	private readonly staticCoordinate: { type: "x" | "y"; value: number };

	constructor(
		private readonly canvasModel: CanvasModel,
		private readonly orient: Orient,
		private readonly sideIndex: number
	) {
		if (this.orient === "top") this.staticCoordinate = { type: "y", value: 20 + 20 * this.sideIndex };
		if (this.orient === "bottom")
			this.staticCoordinate = {
				type: "y",
				value: this.canvasModel.getBlockSize().height - 20 - 20 * this.sideIndex
			};
		if (this.orient === "left") this.staticCoordinate = { type: "x", value: 20 * this.sideIndex };
		if (this.orient === "right")
			this.staticCoordinate = { type: "x", value: this.canvasModel.getBlockSize().width - 20 * this.sideIndex };
	}

	handleCoordinate(coordinate: GroupingLabelCoordinate) {
		let x: number | undefined;
		let y: number | undefined;

		if (this.orient === "top" || this.orient === "bottom") {
			x = coordinate.x + this.canvasModel.getMarginSide("left");
			y = this.staticCoordinate.value;
		}
		if (this.orient === "left" || this.orient === "right") {
			x = this.staticCoordinate.value;
			y = coordinate.y + this.canvasModel.getMarginSide("top");
		}

		if (!x || !y) throw new Error("Invalid coordinate");

		return { x, y };
	}
}
