
import {
    calculateValueLabelAlignment,
    getValueLabelX,
    getValueLabelY,
    hasCollisionLeftSide,
    hasCollisionRightSide,
    shiftCoordinateXLeft,
    shiftCoordinateXRight
} from "../../model/featuresModel/valueLabelsModel/valueLabelsModel";
import { BlockMargin } from "../../model/model";
import { BoundingRect } from "../../engine/features/valueLabelsCollision/valueLabelsCollision";
import { Size } from "../../config/config";

describe('getValueLabelX', () => {
    let scaledValue: number;
    let margin: BlockMargin

    beforeEach(() => {
        scaledValue = 100;
        margin = {
            top: 15,
            bottom: 20,
            left: 25,
            right: 30
        }
    });

    test('should return valueLabel equal to 115, because orient is right', () => {
        const result = getValueLabelX(scaledValue, 'right', margin)

        expect(result).toEqual(115);
    });

    test('should return valueLabel equal to 135, because orient is left', () => {
        const result = getValueLabelX(scaledValue, 'left', margin)

        expect(result).toEqual(135);
    });

    test('should return valueLabel equal to 125, because no orient', () => {
        const result = getValueLabelX(scaledValue, 'top', margin)

        expect(result).toEqual(125);
    });
});

describe('getValueLabelY', () => {
    let scaledValue: number;
    let margin: BlockMargin

    beforeEach(() => {
        scaledValue = 100;
        margin = {
            top: 15,
            bottom: 20,
            left: 25,
            right: 30
        }
    });

    test('should return valueLabel equal to 125, because orient is top', () => {
        const result = getValueLabelY(scaledValue, 'top', margin)

        expect(result).toEqual(125);
    });

    test('should return valueLabel equal to 135, because orient is bottom', () => {
        const result = getValueLabelY(scaledValue, 'bottom', margin)

        expect(result).toEqual(105);
    });

    test('should return valueLabel equal to 115, because no orient', () => {
        const result = getValueLabelY(scaledValue, 'left', margin)

        expect(result).toEqual(115);
    });
});

describe('calculateValueLabelAlignment', () => {

    test('should return dominantBaseline is hanging and textAnchor is middle for top orient', () => {
        const valueLabelAlignment = calculateValueLabelAlignment('top')

        expect(valueLabelAlignment.dominantBaseline).toEqual('hanging');
        expect(valueLabelAlignment.textAnchor).toEqual('middle');
    });

    test('should return dominantBaseline is hanging and textAnchor is middle for bottom orient', () => {
        const valueLabelAlignment = calculateValueLabelAlignment('bottom')

        expect(valueLabelAlignment.dominantBaseline).toEqual('auto');
        expect(valueLabelAlignment.textAnchor).toEqual('middle');
    });

    test('should return dominantBaseline is hanging and textAnchor is middle for left orient', () => {
        const valueLabelAlignment = calculateValueLabelAlignment('left')

        expect(valueLabelAlignment.dominantBaseline).toEqual('middle');
        expect(valueLabelAlignment.textAnchor).toEqual('start');
    });

    test('should return dominantBaseline is hanging and textAnchor is middle for right orient', () => {
        const valueLabelAlignment = calculateValueLabelAlignment('right')

        expect(valueLabelAlignment.dominantBaseline).toEqual('middle');
        expect(valueLabelAlignment.textAnchor).toEqual('end');
    });
});

describe('hasCollisionLeftSide', () => {

    let labelClientRect: BoundingRect;
    let margin: BlockMargin;

    beforeEach(() => {
        labelClientRect = { x: 50, y: 50, width: 30, height: 10 };
        margin = { top: 100, bottom: 50, right: 70, left: 70 };
    });

    test('should return true, because element coordinate X more margin left side', () => {
        const isCollision = hasCollisionLeftSide(labelClientRect, margin);

        expect(isCollision).toBeTruthy();
    });

    test('should return false, because element coordinate X less margin left side', () => {
        labelClientRect.x = 100;
        const isCollision = hasCollisionLeftSide(labelClientRect, margin);

        expect(isCollision).toBeFalsy();
    });
});

describe('hasCollisionRightSide', () => {

    let labelClientRect: BoundingRect;
    let blockSize: Size;

    beforeEach(() => {
        labelClientRect = { x: 150, y: 50, width: 30, height: 10 };
        blockSize = { width: 100, height: 50 };
    });

    test('should return true, because element coordinate X and width more block width', () => {
        const isCollision = hasCollisionRightSide(labelClientRect, blockSize);

        expect(isCollision).toBeTruthy();
    });

    test('should return false, because element coordinate X and width less block width', () => {
        labelClientRect.x = 50;
        const isCollision = hasCollisionRightSide(labelClientRect, blockSize);

        expect(isCollision).toBeFalsy();
    });
});

describe('shiftCoordinateXLeft', () => {
    let labelClientRect: BoundingRect;

    beforeEach(() => {
        labelClientRect = { x: 100, y: 50, width: 30, height: 10 };
    });

    test('should shift X coordinate to the left by half label width and BORDER_OFFSET_SIZE_PX ', () => {
        shiftCoordinateXLeft(labelClientRect);

        expect(labelClientRect.x).toEqual(80);
    });
});

describe('shiftCoordinateXRight', () => {
    let labelClientRect: BoundingRect;

    beforeEach(() => {
        labelClientRect = { x: 100, y: 50, width: 30, height: 10 };
    });

    test('should shift X coordinate to the right by half label width and BORDER_OFFSET_SIZE_PX ', () => {
        shiftCoordinateXRight(labelClientRect);

        expect(labelClientRect.x).toEqual(120);
    });
});
