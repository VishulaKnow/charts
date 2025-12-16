import { max, min } from "d3-array";
import { AxisScale } from "d3-axis";
import { Size } from "../../../config/config";
import { AxisModelOptions, BlockMargin } from "../../../model/model";

export type GridLineType = "key" | "value";
export interface GridLineAttributes {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

export class GridLineHelper {
	public static getGridLineLength(
		gridLineType: GridLineType,
		keyAxis: AxisModelOptions,
		valueAxis: AxisModelOptions,
		blockSize: Size,
		margin: BlockMargin
	): number {
		let axis: AxisModelOptions;
		let axisLength: number;

		if (gridLineType === "key") axis = keyAxis;
		else axis = valueAxis;

		if (axis.orient === "left" || axis.orient === "right")
			axisLength = blockSize.width - margin.left - margin.right;
		else axisLength = blockSize.height - margin.top - margin.bottom;

		if (axis.orient === "right" || axis.orient === "bottom") axisLength = -axisLength;
		return axisLength;
	}

	public static getLineAttributes(axis: AxisModelOptions, lineLength: number): GridLineAttributes {
		const attributes: GridLineAttributes = {
			x1: 0,
			y1: 0,
			x2: 0,
			y2: 0
		};

		if (axis.orient === "left" || axis.orient === "right") attributes.x2 = lineLength;
		else attributes.y2 = lineLength;

		return attributes;
	}

	public static getKeyLineAttributes(axis: AxisModelOptions, scaleValue: AxisScale<any>) {
		const attributes: GridLineAttributes = {
			x1: 0,
			y1: 0,
			x2: 0,
			y2: 0
		};

		const scaledStart = scaleValue(scaleValue.domain()[0]);
		const scaledEnd = scaleValue(scaleValue.domain()[1]);

		const minScaledValue = scaleValue(Math.min(...scaleValue.domain()));
		const minCoord = min([scaledStart, scaledEnd]) - minScaledValue;
		const maxCoord = max([scaledStart, scaledEnd]) - minScaledValue;

		if (axis.orient === "left" || axis.orient === "right") {
			attributes.x1 = minCoord;
			attributes.x2 = maxCoord;
		} else {
			attributes.y1 = minCoord;
			attributes.y2 = maxCoord;
		}

		return attributes;
	}
}
