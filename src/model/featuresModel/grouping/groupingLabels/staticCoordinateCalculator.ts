import { Orient } from "../../../model";
import { CanvasModel } from "../../../modelInstance/canvasModel/canvasModel";
import { GroupingItemSize } from "../../../modelInstance/configReader/twoDimConfigReader/groupingConfigReader/groupingConfigReader";

interface GroupingStaticCoordinateCalculatorOptions {
	otherComponentSizes: {
		titleTotalNeededSpace: number;
		legendTotalNeededSpace: number;
	};
	groupingItemSizes: GroupingItemSize[];
}

export class GroupingStaticCoordinateCalculator {
	constructor(
		private readonly canvasModel: CanvasModel,
		private readonly options: GroupingStaticCoordinateCalculatorOptions
	) {}

	calculate(orient: Orient, sideIndex: number) {
		const slicesSizesByCurrentOrient = this.options.groupingItemSizes.filter((item) => item.orient === orient);
		const prevSlicesSizes = slicesSizesByCurrentOrient
			.slice(0, sideIndex)
			.reduce((acc, item) => acc + item.size, 0);

		let staticCoordinate: number | undefined;

		if (orient === "top")
			staticCoordinate = this.options.otherComponentSizes.titleTotalNeededSpace + prevSlicesSizes * sideIndex;
		if (orient === "bottom")
			staticCoordinate =
				this.canvasModel.getBlockSize().height -
				this.options.otherComponentSizes.legendTotalNeededSpace -
				prevSlicesSizes * sideIndex;
		if (orient === "left") staticCoordinate = prevSlicesSizes * sideIndex;
		if (orient === "right") staticCoordinate = this.canvasModel.getBlockSize().width - prevSlicesSizes * sideIndex;

		if (staticCoordinate === undefined) {
			throw new Error(`Static coordinate for orient ${orient} and sideIndex ${sideIndex} is undefined`);
		}

		return staticCoordinate;
	}
}
