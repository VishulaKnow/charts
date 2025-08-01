import {
	calculateValueLabelAlignment,
	handleValueBeforeScale,
	hasCollisionBottomSide,
	hasCollisionLeftSide,
	hasCollisionRightSide,
	hasCollisionTopSide,
	shiftCoordinateXLeft,
	shiftCoordinateXRight,
	shiftCoordinateYBottom,
	shiftCoordinateYTop,
	ValueLabelCoordinateCalculator
} from "../../model/featuresModel/valueLabelsModel/valueLabelsModel";
import { BlockMargin } from "../../model/model";
import { BoundingRect } from "../../engine/features/valueLabelsCollision/valueLabelsCollision";
import { Size } from "../../config/config";

describe("getValueLabelX", () => {
	let scaledValue: number;
	let margin: BlockMargin;

	beforeEach(() => {
		scaledValue = 100;
		margin = {
			top: 15,
			bottom: 20,
			left: 25,
			right: 30
		};
	});

	test("should offset valueLabel to the left, because orient is right and positionMode is undefined or afterHead", () => {
		const calculatorForUndefinedPositionMode = new ValueLabelCoordinateCalculator(
			undefined,
			"right",
			margin,
			false,
			(v) => v
		);
		const resultForUndefinedPositionMode = calculatorForUndefinedPositionMode.getValueLabelX(scaledValue, 0);
		expect(resultForUndefinedPositionMode).toEqual(115);

		const calculatorForAfterHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterHead" },
			"right",
			margin,
			false,
			(v) => v
		);
		const resultForAfterHeadPositionMode = calculatorForAfterHeadPositionMode.getValueLabelX(scaledValue, 0);
		expect(resultForAfterHeadPositionMode).toEqual(115);
	});

	test("should offset valueLabel to the left, because orient is right and positionMode is beforeHead", () => {
		const calculatorForBeforeHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "beforeHead" },
			"right",
			margin,
			false,
			(v) => v
		);
		const resultForBeforeHeadPositionMode = calculatorForBeforeHeadPositionMode.getValueLabelX(scaledValue, 0);
		expect(resultForBeforeHeadPositionMode).toEqual(135);
	});

	test("should offset valueLabel to the left, because orient is right and positionMode is afterStart", () => {
		const calculatorForAfterStartPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterStart" },
			"right",
			margin,
			false,
			(v) => v
		);
		const resultForAfterStartPositionMode = calculatorForAfterStartPositionMode.getValueLabelX(scaledValue, 0);
		expect(resultForAfterStartPositionMode).toEqual(115);
	});

	test("should offset valueLabel to the right, because orient is left and positionMode is undefined or afterHead", () => {
		const calculatorForUndefinedPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: undefined },
			"left",
			margin,
			false,
			(v) => v
		);
		const resultForUndefinedPositionMode = calculatorForUndefinedPositionMode.getValueLabelX(scaledValue, 0);
		expect(resultForUndefinedPositionMode).toEqual(135);

		const calculatorForAfterHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterHead" },
			"left",
			margin,
			false,
			(v) => v
		);
		const resultForAfterHeadPositionMode = calculatorForAfterHeadPositionMode.getValueLabelX(scaledValue, 0);
		expect(resultForAfterHeadPositionMode).toEqual(135);
	});

	test("should offset valueLabel to the right, because orient is left and positionMode is beforeHead", () => {
		const calculatorForBeforeHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "beforeHead" },
			"left",
			margin,
			false,
			(v) => v
		);
		const resultForBeforeHeadPositionMode = calculatorForBeforeHeadPositionMode.getValueLabelX(scaledValue, 0);
		expect(resultForBeforeHeadPositionMode).toEqual(115);
	});

	test("should offset valueLabel to the right, because orient is left and positionMode is afterStart", () => {
		const calculatorForAfterStartPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterStart" },
			"left",
			margin,
			false,
			(v) => v
		);
		const resultForAfterStartPositionMode = calculatorForAfterStartPositionMode.getValueLabelX(scaledValue, 0);
		expect(resultForAfterStartPositionMode).toEqual(135);
	});

	test("shouldn't offset value label x position, because orient is top and positionMode is undefined or afterHead or beforeHead or afterStart", () => {
		const calculatorForUndefinedPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: undefined },
			"top",
			margin,
			false,
			(v) => v
		);
		const resultForUndefinedPositionMode = calculatorForUndefinedPositionMode.getValueLabelX(scaledValue, 0);
		expect(resultForUndefinedPositionMode).toEqual(125);

		const calculatorForAfterHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterHead" },
			"top",
			margin,
			false,
			(v) => v
		);
		const resultForAfterHeadPositionMode = calculatorForAfterHeadPositionMode.getValueLabelX(scaledValue, 0);
		expect(resultForAfterHeadPositionMode).toEqual(125);

		const calculatorForBeforeHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "beforeHead" },
			"top",
			margin,
			false,
			(v) => v
		);
		const resultForBeforeHeadPositionMode = calculatorForBeforeHeadPositionMode.getValueLabelX(scaledValue, 0);
		expect(resultForBeforeHeadPositionMode).toEqual(125);

		const calculatorForAfterStartPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterStart" },
			"top",
			margin,
			false,
			(v) => v
		);
		const resultForAfterStartPositionMode = calculatorForAfterStartPositionMode.getValueLabelX(scaledValue, 0);
		expect(resultForAfterStartPositionMode).toEqual(125);
	});

	test("shouldnt change valueLabel by offset, because positionMode is center (right orient)", () => {
		const calculator = new ValueLabelCoordinateCalculator({ mode: "center" }, "right", margin, false, (v) => v);
		const result = calculator.getValueLabelX(scaledValue, 0);

		expect(result).toEqual(125);
	});

	test("shouldnt change valueLabel by offset, because positionMode is center (left orient)", () => {
		const calculator = new ValueLabelCoordinateCalculator({ mode: "center" }, "left", margin, false, (v) => v);
		const result = calculator.getValueLabelX(scaledValue, 0);

		expect(result).toEqual(125);
	});

	test("shouldn't change valueLabel by offset, because positionMode is center (bottom orient)", () => {
		const calculator = new ValueLabelCoordinateCalculator({ mode: "center" }, "bottom", margin, false, (v) => v);
		const result = calculator.getValueLabelX(scaledValue, 0);

		expect(result).toEqual(125);
	});

	test("should pass offset by field index and shift callback", () => {
		const calculator = new ValueLabelCoordinateCalculator(
			{ mode: "center" },
			"bottom",
			margin,
			false,
			(v, i) => v + i * 10
		);

		const result1 = calculator.getValueLabelX(scaledValue, 0);
		expect(result1).toEqual(125);

		const result2 = calculator.getValueLabelX(scaledValue, 1);
		expect(result2).toEqual(135);
	});

	test("should always set 0 index for shift callback, because chart is segmented", () => {
		const callback = jest.fn();
		const calculator = new ValueLabelCoordinateCalculator({ mode: "center" }, "bottom", margin, true, callback);

		calculator.getValueLabelX(scaledValue, 0);
		calculator.getValueLabelX(scaledValue, 1);
		calculator.getValueLabelX(scaledValue, 2);
		expect(callback.mock.calls[0][1]).toBe(0);
		expect(callback.mock.calls[1][1]).toBe(0);
		expect(callback.mock.calls[2][1]).toBe(0);
	});

	test("should pass field index", () => {
		const callback = jest.fn();
		const calculator = new ValueLabelCoordinateCalculator({ mode: "center" }, "bottom", margin, false, callback);

		calculator.getValueLabelX(scaledValue, 0);
		calculator.getValueLabelX(scaledValue, 1);
		calculator.getValueLabelX(scaledValue, 2);
		expect(callback.mock.calls[0][1]).toBe(0);
		expect(callback.mock.calls[1][1]).toBe(1);
		expect(callback.mock.calls[2][1]).toBe(2);
	});
});

describe("getValueLabelY", () => {
	let scaledValue: number;
	let margin: BlockMargin;

	beforeEach(() => {
		scaledValue = 100;
		margin = {
			top: 15,
			bottom: 20,
			left: 25,
			right: 30
		};
	});

	test("should return valueLabel with offset to bottom, because orient is top and positionMode is undefined or afterHead", () => {
		const calculatorForUndefinedPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: undefined },
			"top",
			margin,
			false,
			(v) => v
		);
		const resultForUndefinedPositionMode = calculatorForUndefinedPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForUndefinedPositionMode).toEqual(125);

		const calculatorForAfterHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterHead" },
			"top",
			margin,
			false,
			(v) => v
		);
		const resultForAfterHeadPositionMode = calculatorForAfterHeadPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForAfterHeadPositionMode).toEqual(125);
	});

	test("should return valueLabel with offset to top, because orient is top and positionMode is beforeHead", () => {
		const calculatorForBeforeHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "beforeHead" },
			"top",
			margin,
			false,
			(v) => v
		);
		const resultForBeforeHeadPositionMode = calculatorForBeforeHeadPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForBeforeHeadPositionMode).toEqual(105);
	});

	test("should return valueLabel with offset to bottom, because orient is top and positionMode is afterStart", () => {
		const calculatorForAfterStartPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterStart" },
			"top",
			margin,
			false,
			(v) => v
		);
		const resultForAfterStartPositionMode = calculatorForAfterStartPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForAfterStartPositionMode).toEqual(125);
	});

	test("should return valueLabel with offset to top, because orient is bottom and positionMode is undefined or afterHead", () => {
		const calculatorForUndefinedPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: undefined },
			"bottom",
			margin,
			false,
			(v) => v
		);
		const resultForUndefinedPositionMode = calculatorForUndefinedPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForUndefinedPositionMode).toEqual(105);

		const calculatorForAfterHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterHead" },
			"bottom",
			margin,
			false,
			(v) => v
		);
		const resultForAfterHeadPositionMode = calculatorForAfterHeadPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForAfterHeadPositionMode).toEqual(105);
	});

	test("should return valueLabel with offset to top, because orient is bottom and positionMode is beforeHead", () => {
		const calculatorForBeforeHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "beforeHead" },
			"bottom",
			margin,
			false,
			(v) => v
		);
		const resultForBeforeHeadPositionMode = calculatorForBeforeHeadPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForBeforeHeadPositionMode).toEqual(125);
	});

	test("should return valueLabel with offset to top, because orient is bottom and positionMode is afterStart", () => {
		const calculatorForAfterStartPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterStart" },
			"bottom",
			margin,
			false,
			(v) => v
		);
		const resultForAfterStartPositionMode = calculatorForAfterStartPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForAfterStartPositionMode).toEqual(105);
	});

	test("should return valueLabel y position without offset, because orient is left or right and positionMode is undefined or afterHead or beforeHead or afterStart", () => {
		const calculatorForUndefinedPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: undefined },
			"left",
			margin,
			false,
			(v) => v
		);
		const resultForUndefinedPositionMode = calculatorForUndefinedPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForUndefinedPositionMode).toEqual(115);

		const calculatorForAfterHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterHead" },
			"left",
			margin,
			false,
			(v) => v
		);
		const resultForAfterHeadPositionMode = calculatorForAfterHeadPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForAfterHeadPositionMode).toEqual(115);

		const calculatorForBeforeHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "beforeHead" },
			"left",
			margin,
			false,
			(v) => v
		);
		const resultForBeforeHeadPositionMode = calculatorForBeforeHeadPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForBeforeHeadPositionMode).toEqual(115);

		const calculatorForAfterStartPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterStart" },
			"left",
			margin,
			false,
			(v) => v
		);
		const resultForAfterStartPositionMode = calculatorForAfterStartPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForAfterStartPositionMode).toEqual(115);
	});

	test("shouldn't change valueLabel by offset, because positionMode is center", () => {
		const calculator = new ValueLabelCoordinateCalculator({ mode: "center" }, "top", margin, false, (v) => v);
		const result = calculator.getValueLabelY(scaledValue, 0);

		expect(result).toEqual(115);
	});

	test("shouldn't change valueLabel by offset, because positionMode is center", () => {
		const calculator = new ValueLabelCoordinateCalculator({ mode: "center" }, "bottom", margin, false, (v) => v);
		const result = calculator.getValueLabelY(scaledValue, 0);

		expect(result).toEqual(115);
	});

	test("shouldn't change valueLabel by offset, because positionMode is center", () => {
		const calculator = new ValueLabelCoordinateCalculator({ mode: "center" }, "left", margin, false, (v) => v);
		const result = calculator.getValueLabelY(scaledValue, 0);

		expect(result).toEqual(115);
	});

	test("should use custom offset size if it is set and positionMode is undefined or afterHead or beforeHead or afterStart", () => {
		const calculatorForUndefinedPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: undefined, offsetSize: 5 },
			"bottom",
			margin,
			false,
			(v) => v
		);
		const resultForUndefinedPositionMode = calculatorForUndefinedPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForUndefinedPositionMode).toEqual(110);

		const calculatorForAfterHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterHead", offsetSize: 5 },
			"bottom",
			margin,
			false,
			(v) => v
		);
		const resultForAfterHeadPositionMode = calculatorForAfterHeadPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForAfterHeadPositionMode).toEqual(110);

		const calculatorForBeforeHeadPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "beforeHead", offsetSize: 5 },
			"bottom",
			margin,
			false,
			(v) => v
		);
		const resultForBeforeHeadPositionMode = calculatorForBeforeHeadPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForBeforeHeadPositionMode).toEqual(120);

		const calculatorForAfterStartPositionMode = new ValueLabelCoordinateCalculator(
			{ mode: "afterStart", offsetSize: 5 },
			"bottom",
			margin,
			false,
			(v) => v
		);
		const resultForAfterStartPositionMode = calculatorForAfterStartPositionMode.getValueLabelY(scaledValue, 0);
		expect(resultForAfterStartPositionMode).toEqual(110);
	});
});

describe("calculateValueLabelAlignment", () => {
	test("should return dominantBaseline is hanging and textAnchor is middle for top orient", () => {
		const valueLabelAlignment = calculateValueLabelAlignment("top");

		expect(valueLabelAlignment.dominantBaseline).toEqual("hanging");
		expect(valueLabelAlignment.textAnchor).toEqual("middle");
	});

	test("should return dominantBaseline is hanging and textAnchor is middle for bottom orient", () => {
		const valueLabelAlignment = calculateValueLabelAlignment("bottom");

		expect(valueLabelAlignment.dominantBaseline).toEqual("auto");
		expect(valueLabelAlignment.textAnchor).toEqual("middle");
	});

	test("should return dominantBaseline is hanging and textAnchor is middle for left orient", () => {
		const valueLabelAlignment = calculateValueLabelAlignment("left");

		expect(valueLabelAlignment.dominantBaseline).toEqual("middle");
		expect(valueLabelAlignment.textAnchor).toEqual("start");
	});

	test("should return dominantBaseline is hanging and textAnchor is middle for right orient", () => {
		const valueLabelAlignment = calculateValueLabelAlignment("right");

		expect(valueLabelAlignment.dominantBaseline).toEqual("middle");
		expect(valueLabelAlignment.textAnchor).toEqual("end");
	});

	test("should return dominantBaseline is hanging and textAnchor is middle for top orient", () => {
		const valueLabelAlignment = calculateValueLabelAlignment("top", "center");

		expect(valueLabelAlignment.dominantBaseline).toEqual("middle");
		expect(valueLabelAlignment.textAnchor).toEqual("middle");
	});

	test("should return dominantBaseline is hanging and textAnchor is middle for bottom orient", () => {
		const valueLabelAlignment = calculateValueLabelAlignment("bottom", "center");

		expect(valueLabelAlignment.dominantBaseline).toEqual("middle");
		expect(valueLabelAlignment.textAnchor).toEqual("middle");
	});

	test("should return dominantBaseline is hanging and textAnchor is middle for left orient", () => {
		const valueLabelAlignment = calculateValueLabelAlignment("left", "center");

		expect(valueLabelAlignment.dominantBaseline).toEqual("middle");
		expect(valueLabelAlignment.textAnchor).toEqual("middle");
	});

	test("should return dominantBaseline is hanging and textAnchor is middle for right orient", () => {
		const valueLabelAlignment = calculateValueLabelAlignment("right", "center");

		expect(valueLabelAlignment.dominantBaseline).toEqual("middle");
		expect(valueLabelAlignment.textAnchor).toEqual("middle");
	});

	test("should set all to middle, because rotation angle is set", () => {
		const valueLabelAlignment = calculateValueLabelAlignment("right", undefined, { angle: 90 });

		expect(valueLabelAlignment.dominantBaseline).toEqual("middle");
		expect(valueLabelAlignment.textAnchor).toEqual("middle");
	});

	test("return reversed alignment for beforeHead position mode", () => {
		const alignmentForRightAxis = calculateValueLabelAlignment("right", "beforeHead");
		expect(alignmentForRightAxis.dominantBaseline).toEqual("middle");
		expect(alignmentForRightAxis.textAnchor).toEqual("start");

		const alignmentForLeftAxis = calculateValueLabelAlignment("left", "beforeHead");
		expect(alignmentForLeftAxis.dominantBaseline).toEqual("middle");
		expect(alignmentForLeftAxis.textAnchor).toEqual("end");

		const alignmentForTopAxis = calculateValueLabelAlignment("top", "beforeHead");
		expect(alignmentForTopAxis.dominantBaseline).toEqual("auto");
		expect(alignmentForTopAxis.textAnchor).toEqual("middle");

		const alignmentForBottomAxis = calculateValueLabelAlignment("bottom", "beforeHead");
		expect(alignmentForBottomAxis.dominantBaseline).toEqual("hanging");
		expect(alignmentForBottomAxis.textAnchor).toEqual("middle");
	});

	test("return return same alignment as afterHead position for afterStart PositionMode", () => {
		const alignmentForRightAxis = calculateValueLabelAlignment("right", "afterStart");
		expect(alignmentForRightAxis.dominantBaseline).toEqual("middle");
		expect(alignmentForRightAxis.textAnchor).toEqual("end");

		const alignmentForLeftAxis = calculateValueLabelAlignment("left", "afterStart");
		expect(alignmentForLeftAxis.dominantBaseline).toEqual("middle");
		expect(alignmentForLeftAxis.textAnchor).toEqual("start");

		const alignmentForTopAxis = calculateValueLabelAlignment("top", "afterStart");
		expect(alignmentForTopAxis.dominantBaseline).toEqual("hanging");
		expect(alignmentForTopAxis.textAnchor).toEqual("middle");

		const alignmentForBottomAxis = calculateValueLabelAlignment("bottom", "afterStart");
		expect(alignmentForBottomAxis.dominantBaseline).toEqual("auto");
		expect(alignmentForBottomAxis.textAnchor).toEqual("middle");
	});
});

describe("handleValueBeforeScale", () => {
	test("should return value, because position mode is not set", () => {
		const result = handleValueBeforeScale({ value: 100 }, "value", false, undefined);
		expect(result).toEqual(100);
	});

	test("should return value, because position mode is afterHead", () => {
		const result = handleValueBeforeScale({ value: 100 }, "value", false, "afterHead");
		expect(result).toEqual(100);
	});

	test("should return value, because position mode is beforeHead", () => {
		const result = handleValueBeforeScale({ value: 100 }, "value", false, "beforeHead");
		expect(result).toEqual(100);
	});

	test("should return half of value, because position mode is center", () => {
		const result = handleValueBeforeScale({ value: 100 }, "value", false, "center");
		expect(result).toEqual(50);
	});

	test("should return half of segment if chart is segmented", () => {
		const result = handleValueBeforeScale({ value: 100, "0": 50 }, "value", true, "center");
		expect(result).toEqual(75);
	});

	test("should return 0 value, because position mode is afterStart", () => {
		const result = handleValueBeforeScale({ value: 100 }, "value", false, "afterStart");
		expect(result).toEqual(0);
	});

	test("should return start value of segment if chart is segmented and position mode is afterStart", () => {
		const result = handleValueBeforeScale({ value: 100, "0": 50 }, "value", true, "afterStart");
		expect(result).toEqual(50);
	});
});

describe("hasCollisionLeftSide", () => {
	let labelClientRect: BoundingRect;
	let margin: BlockMargin;

	beforeEach(() => {
		labelClientRect = { x: 50, y: 50, width: 30, height: 10 };
		margin = { top: 100, bottom: 50, right: 70, left: 70 };
	});

	test("should return true, because element coordinate X and half width less margin left side", () => {
		const isCollision = hasCollisionLeftSide(labelClientRect, margin);

		expect(isCollision).toBeTruthy();
	});

	test("should return false, because element coordinate X and half width more margin left side", () => {
		labelClientRect.x = 100;
		const isCollision = hasCollisionLeftSide(labelClientRect, margin);

		expect(isCollision).toBeFalsy();
	});
});

describe("hasCollisionRightSide", () => {
	let labelClientRect: BoundingRect;
	let blockSize: Size;
	let margin: BlockMargin;

	beforeEach(() => {
		labelClientRect = { x: 450, y: 50, width: 30, height: 10 };
		blockSize = { width: 500, height: 50 };
		margin = { top: 100, bottom: 50, right: 70, left: 70 };
	});

	test("should return true, because element coordinate X and half width more block width without margin right", () => {
		const isCollision = hasCollisionRightSide(labelClientRect, blockSize, margin);

		expect(isCollision).toBeTruthy();
	});

	test("should return false, because element coordinate X and half width less block width without margin right", () => {
		labelClientRect.x = 150;
		const isCollision = hasCollisionRightSide(labelClientRect, blockSize, margin);

		expect(isCollision).toBeFalsy();
	});
});

describe("hasCollisionTopSide", () => {
	let labelClientRect: BoundingRect;
	let margin: BlockMargin;

	beforeEach(() => {
		labelClientRect = { x: 50, y: 50, width: 30, height: 10 };
		margin = { top: 50, bottom: 50, right: 70, left: 70 };
	});

	test("should return true, because element coordinate Y and half height less margin top side", () => {
		const isCollision = hasCollisionTopSide(labelClientRect, margin);

		expect(isCollision).toBeTruthy();
	});

	test("should return false, because element coordinate Y and half height more margin top side", () => {
		labelClientRect.y = 100;
		const isCollision = hasCollisionTopSide(labelClientRect, margin);

		expect(isCollision).toBeFalsy();
	});
});

describe("hasCollisionBottomSide", () => {
	let labelClientRect: BoundingRect;
	let blockSize: Size;
	let margin: BlockMargin;

	beforeEach(() => {
		labelClientRect = { x: 450, y: 300, width: 30, height: 10 };
		blockSize = { width: 500, height: 300 };
		margin = { top: 50, bottom: 50, right: 70, left: 70 };
	});

	test("should return true, because element coordinate Y and half height more block height without margin bottom", () => {
		const isCollision = hasCollisionBottomSide(labelClientRect, blockSize, margin);

		expect(isCollision).toBeTruthy();
	});

	test("should return false, because element coordinate Y and half height less block height without margin bottom", () => {
		labelClientRect.y = 150;
		const isCollision = hasCollisionBottomSide(labelClientRect, blockSize, margin);

		expect(isCollision).toBeFalsy();
	});
});

describe("shiftCoordinateXLeft", () => {
	let labelClientRect: BoundingRect;

	beforeEach(() => {
		labelClientRect = { x: 100, y: 50, width: 30, height: 10 };
	});

	test("should shift X coordinate to the left by half label width and BORDER_OFFSET_SIZE_PX", () => {
		shiftCoordinateXLeft(
			labelClientRect,
			{ width: 130, height: 100 },
			{ right: 10, left: 10, top: 10, bottom: 10 }
		);

		expect(labelClientRect.x).toEqual(103);
	});
});

describe("shiftCoordinateXRight", () => {
	let labelClientRect: BoundingRect;

	beforeEach(() => {
		labelClientRect = { x: 10, y: 50, width: 30, height: 10 };
	});

	test("should shift X coordinate to the right by half label width and BORDER_OFFSET_SIZE_PX", () => {
		shiftCoordinateXRight(labelClientRect, { left: 20, right: 20, top: 10, bottom: 10 });

		expect(labelClientRect.x).toEqual(37);
	});
});

describe("shiftCoordinateYTop", () => {
	let labelClientRect: BoundingRect;

	beforeEach(() => {
		labelClientRect = { x: 100, y: 50, width: 30, height: 10 };
	});

	test("should shift Y coordinate to the top by half label height and BORDER_OFFSET_SIZE_PX", () => {
		shiftCoordinateYTop(labelClientRect);

		expect(labelClientRect.y).toEqual(43);
	});
});

describe("shiftCoordinateYBottom", () => {
	let labelClientRect: BoundingRect;

	beforeEach(() => {
		labelClientRect = { x: 100, y: 50, width: 30, height: 10 };
	});

	test("should shift Y coordinate to the bottom by half label height and BORDER_OFFSET_SIZE_PX", () => {
		shiftCoordinateYBottom(labelClientRect);

		expect(labelClientRect.y).toEqual(57);
	});
});
