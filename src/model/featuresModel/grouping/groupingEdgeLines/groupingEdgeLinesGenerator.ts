import { GroupingSplitLineAttributes, Orient } from "../../../model";
import { CanvasModel } from "../../../modelInstance/canvasModel/canvasModel";
import { GroupingItemSize } from "../../../modelInstance/configReader/twoDimConfigReader/groupingConfigReader/groupingConfigReader";
import { GroupingStaticCoordinateCalculator } from "../groupingLabels/staticCoordinateCalculator";

interface GroupingEdgeLinesGeneratorOptions {
	orients: Iterable<Orient>;
	staticCoordinateCalculator: GroupingStaticCoordinateCalculator;
}

export class GroupingEdgeLinesGenerator {
	constructor(
		private readonly canvasModel: CanvasModel,
		private readonly options: GroupingEdgeLinesGeneratorOptions
	) {}

	generate(): GroupingSplitLineAttributes[] {
		let edgeLines: GroupingSplitLineAttributes[] = [];

		for (const orient of this.options.orients) {
			if (orient === "top") {
				const y1 = this.options.staticCoordinateCalculator.calculate(orient, 0);
				const y2 = this.canvasModel.getMarginSide("top");
				const leftX = this.canvasModel.getMarginSide("left");
				const rightX = this.canvasModel.getBlockSize().width - this.canvasModel.getMarginSide("right");
				edgeLines = edgeLines.concat([
					{ x1: leftX, x2: leftX, y1, y2 },
					{ x1: rightX, x2: rightX, y1, y2 }
				]);
			}

			if (orient === "bottom") {
				const y1 = this.canvasModel.getBlockSize().height - this.canvasModel.getMarginSide("bottom");
				const y2 = this.options.staticCoordinateCalculator.calculate(orient, 0);
				const leftX = this.canvasModel.getMarginSide("left");
				const rightX = this.canvasModel.getBlockSize().width - this.canvasModel.getMarginSide("right");
				edgeLines = edgeLines.concat([
					{ x1: leftX, x2: leftX, y1, y2 },
					{ x1: rightX, x2: rightX, y1, y2 }
				]);
			}

			if (orient === "left") {
				const x1 = this.options.staticCoordinateCalculator.calculate(orient, 0);
				const x2 = this.canvasModel.getMarginSide("left");
				const topY = this.canvasModel.getMarginSide("top");
				const bottomY = this.canvasModel.getBlockSize().height - this.canvasModel.getMarginSide("bottom");
				edgeLines = edgeLines.concat([
					{ x1, x2, y1: topY, y2: topY },
					{ x1, x2, y1: bottomY, y2: bottomY }
				]);
			}

			if (orient === "right") {
				const x1 = this.canvasModel.getBlockSize().width - this.canvasModel.getMarginSide("right");
				const x2 = this.options.staticCoordinateCalculator.calculate(orient, 0);
				const topY = this.canvasModel.getMarginSide("top");
				const bottomY = this.canvasModel.getBlockSize().height - this.canvasModel.getMarginSide("bottom");
				edgeLines = edgeLines.concat([
					{ x1, x2, y1: topY, y2: topY },
					{ x1, x2, y1: bottomY, y2: bottomY }
				]);
			}
		}

		return edgeLines;
	}
}
