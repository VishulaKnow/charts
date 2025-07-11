import { GroupingSplitLineAttributes, Orient } from "../../../model";
import { CanvasModel } from "../../../modelInstance/canvasModel/canvasModel";
import { GroupingStaticCoordinateCalculator } from "../groupingLabels/staticCoordinateCalculator";

interface GroupingEdgeLinesGeneratorOptions {
	orients: Iterable<Orient>;
	staticCoordinateCalculator: GroupingStaticCoordinateCalculator;
	canvasModel: CanvasModel;
	lineWidth: number;
}

export class GroupingEdgeLinesGenerator {
	constructor(private readonly options: GroupingEdgeLinesGeneratorOptions) {}

	generate(): GroupingSplitLineAttributes[] {
		let edgeLines: GroupingSplitLineAttributes[] = [];

		for (const orient of this.options.orients) {
			if (orient === "top") {
				const y1 = this.options.staticCoordinateCalculator.calculate(orient, 0);
				const y2 = this.options.canvasModel.getMarginSide("top");
				const leftX = this.options.canvasModel.getMarginSide("left");
				const rightX =
					this.options.canvasModel.getBlockSize().width - this.options.canvasModel.getMarginSide("right");
				edgeLines = edgeLines.concat([
					{ x1: leftX + this.options.lineWidth / 2, x2: leftX + this.options.lineWidth / 2, y1, y2 },
					{ x1: rightX - this.options.lineWidth / 2, x2: rightX - this.options.lineWidth / 2, y1, y2 }
				]);
			}

			if (orient === "bottom") {
				const y1 =
					this.options.canvasModel.getBlockSize().height - this.options.canvasModel.getMarginSide("bottom");
				const y2 = this.options.staticCoordinateCalculator.calculate(orient, 0);
				const leftX = this.options.canvasModel.getMarginSide("left");
				const rightX =
					this.options.canvasModel.getBlockSize().width - this.options.canvasModel.getMarginSide("right");
				edgeLines = edgeLines.concat([
					{ x1: leftX + this.options.lineWidth / 2, x2: leftX + this.options.lineWidth / 2, y1, y2 },
					{ x1: rightX - this.options.lineWidth / 2, x2: rightX - this.options.lineWidth / 2, y1, y2 }
				]);
			}

			if (orient === "left") {
				const x1 = this.options.staticCoordinateCalculator.calculate(orient, 0);
				const x2 = this.options.canvasModel.getMarginSide("left");
				const topY = this.options.canvasModel.getMarginSide("top");
				const bottomY =
					this.options.canvasModel.getBlockSize().height - this.options.canvasModel.getMarginSide("bottom");
				edgeLines = edgeLines.concat([
					{ x1, x2, y1: topY + this.options.lineWidth / 2, y2: topY + this.options.lineWidth / 2 },
					{ x1, x2, y1: bottomY - this.options.lineWidth / 2, y2: bottomY - this.options.lineWidth / 2 }
				]);
			}

			if (orient === "right") {
				const x1 =
					this.options.canvasModel.getBlockSize().width - this.options.canvasModel.getMarginSide("right");
				const x2 = this.options.staticCoordinateCalculator.calculate(orient, 0);
				const topY = this.options.canvasModel.getMarginSide("top");
				const bottomY =
					this.options.canvasModel.getBlockSize().height - this.options.canvasModel.getMarginSide("bottom");
				edgeLines = edgeLines.concat([
					{ x1, x2, y1: topY + this.options.lineWidth / 2, y2: topY + this.options.lineWidth / 2 },
					{ x1, x2, y1: bottomY - this.options.lineWidth / 2, y2: bottomY - this.options.lineWidth / 2 }
				]);
			}
		}

		return edgeLines;
	}
}
