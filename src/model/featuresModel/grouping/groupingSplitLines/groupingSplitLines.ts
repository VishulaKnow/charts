import { GroupingSplitLineAttributes, Orient } from "../../../model";
import { CanvasModel } from "../../../modelInstance/canvasModel/canvasModel";
import { GroupingCanvasCalculator } from "../groupingCanvasCalculator/groupingCanvasCalculator";
import { GroupingStaticCoordinateCalculator } from "../groupingLabels/staticCoordinateCalculator";

interface GroupingSplitLinesGeneratorOptions {
	groupingCanvasCalculator: GroupingCanvasCalculator;
	orient: Orient;
	sideIndex: number;
	staticCoordinateCalculator: GroupingStaticCoordinateCalculator;
	canvasModel: CanvasModel;
}

export class GroupingSplitLinesGenerator {
	constructor(private readonly options: GroupingSplitLinesGeneratorOptions) {}

	generate(): GroupingSplitLineAttributes[] {
		let previousTotalShares = 0;
		const coordinates: number[] = [];
		const { keyAxisInnerPadding, keyAxisOuterPadding, oneShareSize, rowsCountsPerGroups } =
			this.options.groupingCanvasCalculator.calculate();
		for (let rowIndex = 0; rowIndex < rowsCountsPerGroups.length - 1; rowIndex++) {
			const rowsAmount = rowsCountsPerGroups[rowIndex];

			let previousShift = previousTotalShares * (oneShareSize + keyAxisInnerPadding);

			const coordinate =
				previousShift +
				keyAxisOuterPadding +
				rowsAmount * (oneShareSize + keyAxisInnerPadding) -
				keyAxisInnerPadding / 2;
			coordinates.push(coordinate);
			previousTotalShares += rowsAmount;
		}

		return coordinates.map<GroupingSplitLineAttributes>((coordinate) => {
			if (this.options.orient === "bottom") {
				const y1 =
					this.options.canvasModel.getBlockSize().height - this.options.canvasModel.getMarginSide("bottom");
				const y2 = this.options.staticCoordinateCalculator.calculate(
					this.options.orient,
					this.options.sideIndex
				);
				const coordinateWithMargin = coordinate + this.options.canvasModel.getMarginSide("left");
				return { x1: coordinateWithMargin, x2: coordinateWithMargin, y1, y2 };
			}
			if (this.options.orient === "top") {
				const y1 = this.options.staticCoordinateCalculator.calculate(
					this.options.orient,
					this.options.sideIndex
				);
				const y2 = this.options.canvasModel.getMarginSide("top");
				const coordinateWithMargin = coordinate + this.options.canvasModel.getMarginSide("left");
				return { x1: coordinateWithMargin, x2: coordinateWithMargin, y1, y2 };
			}
			if (this.options.orient === "left") {
				const x1 = this.options.staticCoordinateCalculator.calculate(
					this.options.orient,
					this.options.sideIndex
				);
				const x2 = this.options.canvasModel.getMarginSide("left");
				const coordinateWithMargin = coordinate + this.options.canvasModel.getMarginSide("top");
				return { x1, x2, y1: coordinateWithMargin, y2: coordinateWithMargin };
			}
			if (this.options.orient === "right") {
				const x1 = this.options.staticCoordinateCalculator.calculate(
					this.options.orient,
					this.options.sideIndex
				);
				const x2 =
					this.options.canvasModel.getBlockSize().width - this.options.canvasModel.getMarginSide("right");
				const coordinateWithMargin = coordinate + this.options.canvasModel.getMarginSide("top");
				return { x1, x2, y1: coordinateWithMargin, y2: coordinateWithMargin };
			}
			throw new Error("Got unknown orient when generate grouping split lines");
		});
	}
}
