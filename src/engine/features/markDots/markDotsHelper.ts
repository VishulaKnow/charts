import { BlockMargin, Orient } from "../../../model/model";
import { Helper } from "../../helpers/helper";
import { Scale, Scales } from "../scale/scale";
import { DotAttrs } from "./markDot";

export class MarkDotHelper {
	public static getDotAttrs(
		keyAxisOrient: Orient,
		scales: Scales,
		margin: BlockMargin,
		keyField: string,
		valueField: string,
		isSegmented: boolean
	): DotAttrs {
		const attrs: DotAttrs = { cx: null, cy: null };

		if (keyAxisOrient === "left" || keyAxisOrient === "right") {
			attrs.cx = (d) => scales.value(d[valueField]) + margin.left;
			attrs.cy = (d) =>
				Scale.getScaledValue(scales.key, Helper.getKeyFieldValue(d, keyField, isSegmented)) + margin.top;
		} else if (keyAxisOrient === "bottom" || keyAxisOrient === "top") {
			attrs.cx = (d) =>
				Scale.getScaledValue(scales.key, Helper.getKeyFieldValue(d, keyField, isSegmented)) + margin.left;
			attrs.cy = (d) => scales.value(d[valueField]) + margin.top;
		}

		return attrs;
	}
}
