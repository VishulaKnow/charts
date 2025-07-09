import { Orient } from "../../../model";
import { CanvasModel } from "../../../modelInstance/canvasModel/canvasModel";
import { GroupingItemSize } from "../../../modelInstance/configReader/twoDimConfigReader.ts/groupingConfigReader/groupingConfigReader";

interface GroupingLabelsCoordinateHandlerOptions {
	orient: Orient;
	sideIndex: number;
	otherComponentSizes: {
		titleTotalNeededSpace: number;
		legendTotalNeededSpace: number;
	};
	groupingItemSizes: GroupingItemSize[];
}

export class GroupingLabelsCoordinateHandler {
	private readonly staticCoordinate: number;

	constructor(
		private readonly canvasModel: CanvasModel,
		private readonly options: GroupingLabelsCoordinateHandlerOptions
	) {
		const slicesSizesByCurrentOrient = this.options.groupingItemSizes.filter(
			(item) => item.orient === this.options.orient
		);
		const prevSlicesSizes = slicesSizesByCurrentOrient
			.slice(0, this.options.sideIndex)
			.reduce((acc, item) => acc + item.size, 0);

		if (this.options.orient === "top")
			this.staticCoordinate =
				options.otherComponentSizes.titleTotalNeededSpace + prevSlicesSizes * this.options.sideIndex;
		if (this.options.orient === "bottom")
			this.staticCoordinate =
				this.canvasModel.getBlockSize().height -
				options.otherComponentSizes.legendTotalNeededSpace -
				prevSlicesSizes * this.options.sideIndex;
		if (this.options.orient === "left") this.staticCoordinate = prevSlicesSizes * this.options.sideIndex;
		if (this.options.orient === "right")
			this.staticCoordinate = this.canvasModel.getBlockSize().width - prevSlicesSizes * this.options.sideIndex;
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
