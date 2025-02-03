import {
	calculateValueLabelAlignment,
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

	test("should return valueLabel equal to 115, because orient is right", () => {
		const calculator = new ValueLabelCoordinateCalculator(undefined, "right", margin);
		const result = calculator.getValueLabelX(scaledValue);

		expect(result).toEqual(115);
	});

	test("should return valueLabel equal to 135, because orient is left", () => {
		const calculator = new ValueLabelCoordinateCalculator(undefined, "left", margin);
		const result = calculator.getValueLabelX(scaledValue);

		expect(result).toEqual(135);
	});

	test("should return valueLabel equal to 125, because no orient", () => {
		const calculator = new ValueLabelCoordinateCalculator(undefined, "top", margin);
		const result = calculator.getValueLabelX(scaledValue);

		expect(result).toEqual(125);
	});

	test("shouldnt change valueLabel by offset, because positionMode is center", () => {
		const calculator = new ValueLabelCoordinateCalculator("center", "right", margin);
		const result = calculator.getValueLabelX(scaledValue);

		expect(result).toEqual(125);
	});

	test("shouldnt change valueLabel by offset, because positionMode is center", () => {
		const calculator = new ValueLabelCoordinateCalculator("center", "left", margin);
		const result = calculator.getValueLabelX(scaledValue);

		expect(result).toEqual(125);
	});

	test("shouldnt change valueLabel by offset, because positionMode is center", () => {
		const calculator = new ValueLabelCoordinateCalculator("center", "bottom", margin);
		const result = calculator.getValueLabelX(scaledValue);

		expect(result).toEqual(125);
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

	test("should return valueLabel equal to 125, because orient is top", () => {
		const calculator = new ValueLabelCoordinateCalculator(undefined, "top", margin);
		const result = calculator.getValueLabelY(scaledValue);

		expect(result).toEqual(125);
	});

	test("should return valueLabel equal to 135, because orient is bottom", () => {
		const calculator = new ValueLabelCoordinateCalculator(undefined, "bottom", margin);
		const result = calculator.getValueLabelY(scaledValue);

		expect(result).toEqual(105);
	});

	test("should return valueLabel equal to 115, because no orient", () => {
		const calculator = new ValueLabelCoordinateCalculator(undefined, "left", margin);
		const result = calculator.getValueLabelY(scaledValue);

		expect(result).toEqual(115);
	});

	test("shouldnt change valueLabel by offset, because positionMode is center", () => {
		const calculator = new ValueLabelCoordinateCalculator("center", "top", margin);
		const result = calculator.getValueLabelY(scaledValue);

		expect(result).toEqual(115);
	});

	test("shouldnt change valueLabel by offset, because positionMode is center", () => {
		const calculator = new ValueLabelCoordinateCalculator("center", "bottom", margin);
		const result = calculator.getValueLabelY(scaledValue);

		expect(result).toEqual(115);
	});

	test("shouldnt change valueLabel by offset, because positionMode is center", () => {
		const calculator = new ValueLabelCoordinateCalculator("center", "left", margin);
		const result = calculator.getValueLabelY(scaledValue);

		expect(result).toEqual(115);
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
		shiftCoordinateXLeft(labelClientRect);

		expect(labelClientRect.x).toEqual(83);
	});
});

describe("shiftCoordinateXRight", () => {
	let labelClientRect: BoundingRect;

	beforeEach(() => {
		labelClientRect = { x: 100, y: 50, width: 30, height: 10 };
	});

	test("should shift X coordinate to the right by half label width and BORDER_OFFSET_SIZE_PX", () => {
		shiftCoordinateXRight(labelClientRect);

		expect(labelClientRect.x).toEqual(117);
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
