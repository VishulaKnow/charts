import { BlockMargin, EmbeddedLabelTypeModel, Field, Orient } from "../../../model/model";
import { Size } from "../../../config/config";

export type EmbeddedLabelPosition = "inside" | "outside";
export type TextAnchor = "start" | "end" | "center";

export interface LabelAttrs {
	x: number;
	y: number;
	textAnchor: TextAnchor;
}
export interface BarAttrs {
	x: number;
	y: number;
	width: number;
	height: number;
}

export const LABEL_BAR_PADDING = 6;
export const MIN_BAR_HEIGHT_FOR_LABEL_SERVE = 12;

export class EmbeddedLabelsHelper {
	public static getLabelPosition(
		barAttrs: BarAttrs,
		labelBlockWidth: number,
		margin: BlockMargin,
		blockSize: Size,
		labelUnserveFlag: boolean
	): EmbeddedLabelPosition {
		if (
			labelUnserveFlag ||
			(this.getSpaceSizeForType("inside", barAttrs.width, margin, blockSize) < labelBlockWidth &&
				this.getSpaceSizeForType("inside", barAttrs.width, margin, blockSize) <
					this.getSpaceSizeForType("outside", barAttrs.width, margin, blockSize))
		)
			return "outside";

		return "inside";
	}

	public static getSpaceSizeForType(
		position: EmbeddedLabelPosition,
		barWidth: number,
		margin: BlockMargin,
		blockSize: Size
	): number {
		if (position === "outside") return blockSize.width - margin.left - margin.right - barWidth - LABEL_BAR_PADDING;

		return barWidth - LABEL_BAR_PADDING * 2;
	}

	public static getLabelAttrs(
		barAttrs: BarAttrs,
		type: EmbeddedLabelTypeModel,
		position: EmbeddedLabelPosition,
		keyAxisOrient: Orient,
		labelWidth: number
	): LabelAttrs {
		const textAnchor = this.getTextAnchor(type, position, keyAxisOrient);
		const y = this.getLabelAttrY(barAttrs.y, barAttrs.height);
		let x = this.getLabelAttrX(barAttrs, type, position, keyAxisOrient);

		if (textAnchor === "end") {
			x = x - labelWidth;
		}

		return {
			x,
			y,
			textAnchor
		};
	}

	public static getLabelField(
		type: EmbeddedLabelTypeModel,
		valueFields: Field[],
		keyField: Field,
		index: number
	): Field {
		if (type === "key") return keyField;
		if (type === "value") return valueFields[index];

		return null;
	}

	public static getLabelUnserveFlag(barHeight: number): boolean {
		return barHeight < MIN_BAR_HEIGHT_FOR_LABEL_SERVE;
	}

	private static getLabelAttrX(
		barAttrs: BarAttrs,
		type: EmbeddedLabelTypeModel,
		position: EmbeddedLabelPosition,
		keyAxisOrient: Orient
	): number {
		if (keyAxisOrient === "left") {
			if (position === "outside") return barAttrs.x + barAttrs.width + LABEL_BAR_PADDING;

			if (type === "key") return barAttrs.x + LABEL_BAR_PADDING;

			return barAttrs.x + barAttrs.width - LABEL_BAR_PADDING;
		}

		if (position === "outside") return barAttrs.x - LABEL_BAR_PADDING;

		if (type === "key") return barAttrs.x + barAttrs.width - LABEL_BAR_PADDING;

		return barAttrs.x + LABEL_BAR_PADDING;
	}

	private static getLabelAttrY(barY: number, barHeight: number): number {
		return barY + barHeight / 2 + 1;
	}

	private static getTextAnchor(
		type: EmbeddedLabelTypeModel,
		position: EmbeddedLabelPosition,
		keyAxisOrient: Orient
	): TextAnchor {
		if (keyAxisOrient === "left") {
			if (position === "outside" || type === "key") return "start";

			return "end";
		}

		if (position === "outside" || type === "key") return "end";
		return "start";
	}
}
