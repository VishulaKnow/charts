import { LegendPosition, Orient } from "../../../model";
import { CanvasModel } from "../../../modelInstance/canvasModel/canvasModel";
import { GroupingItemSize } from "../../../modelInstance/configReader/twoDimConfigReader/groupingConfigReader/groupingConfigReader";

interface GroupingStaticCoordinateCalculatorOptions {
	otherComponentSizes: {
		titleTotalNeededSpace: number;
		legendTotalNeededSpace: number;
		legendPosition: LegendPosition;
	};
	groupingItemSizes: GroupingItemSize[];
	canvasModel: CanvasModel;
}

export class GroupingStaticCoordinateCalculator {
	constructor(private readonly options: GroupingStaticCoordinateCalculatorOptions) {}

	calculate(orient: Orient, sideIndex: number) {
		const slicesSizesByCurrentOrient = this.options.groupingItemSizes.filter((item) => item.orient === orient);
		const prevSlicesSizes = slicesSizesByCurrentOrient
			.slice(0, sideIndex)
			.reduce((acc, item) => acc + item.size, 0);

		let staticCoordinate: number | undefined;

		if (orient === "top")
			staticCoordinate =
				this.options.otherComponentSizes.titleTotalNeededSpace +
				prevSlicesSizes * sideIndex +
				(this.options.otherComponentSizes.legendPosition === "top"
					? this.options.otherComponentSizes.legendTotalNeededSpace
					: 0);
		if (orient === "bottom")
			staticCoordinate =
				this.options.canvasModel.getBlockSize().height -
				(this.options.otherComponentSizes.legendPosition === "bottom"
					? this.options.otherComponentSizes.legendTotalNeededSpace
					: 0) -
				prevSlicesSizes * sideIndex;
		if (orient === "left") staticCoordinate = prevSlicesSizes * sideIndex;
		if (orient === "right")
			staticCoordinate = this.options.canvasModel.getBlockSize().width - prevSlicesSizes * sideIndex;

		if (staticCoordinate === undefined) {
			throw new Error(`Static coordinate for orient ${orient} and sideIndex ${sideIndex} is undefined`);
		}

		return staticCoordinate;
	}
}
