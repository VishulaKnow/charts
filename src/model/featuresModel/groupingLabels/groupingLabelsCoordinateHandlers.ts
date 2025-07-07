import { Orient } from "../../model";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";

interface GroupingLabelsCoordinateHandlerOptions {
	orient: Orient;
	sideIndex: number;
	otherComponentSizes: {
		titleTotalNeededSpace: number;
		legendTotalNeededSpace: number;
	};
}

export class GroupingLabelsCoordinateHandler {
	private readonly staticCoordinate: number;
	private readonly verticalLabelSize = 20;

	constructor(
		private readonly canvasModel: CanvasModel,
		private readonly options: GroupingLabelsCoordinateHandlerOptions
	) {
		//TODO: padding should be got from other components
		if (this.options.orient === "top")
			this.staticCoordinate =
				options.otherComponentSizes.titleTotalNeededSpace + this.verticalLabelSize * this.options.sideIndex;
		if (this.options.orient === "bottom")
			this.staticCoordinate =
				this.canvasModel.getBlockSize().height -
				options.otherComponentSizes.legendTotalNeededSpace -
				this.verticalLabelSize * this.options.sideIndex;
		if (this.options.orient === "left") this.staticCoordinate = 20 * this.options.sideIndex;
		if (this.options.orient === "right")
			this.staticCoordinate = this.canvasModel.getBlockSize().width - 20 * this.options.sideIndex;
	}

	handleX(scaledCoordinate: number) {
		let x: number;
		if (this.options.orient === "top" || this.options.orient === "bottom")
			x = scaledCoordinate + this.canvasModel.getMarginSide("left");
		else x = this.staticCoordinate;
		return x;
	}

	handleY(scaledCoordinate: number) {
		let y: number;
		if (this.options.orient === "left" || this.options.orient === "right")
			y = scaledCoordinate + this.canvasModel.getMarginSide("top");
		else y = this.staticCoordinate;
		return y;
	}
}
