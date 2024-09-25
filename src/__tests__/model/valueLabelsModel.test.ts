
import {
    calculateValueLabelAlignment,
    getValueLabelX,
    getValueLabelY
} from "../../model/featuresModel/valueLabelsModel/valueLabelsModel";
import { BlockMargin, Orient } from "../../model/model";

describe('getValueLabelX', () => {
    let scaledValue: number;
    let margin: BlockMargin

    beforeEach(() => {
        scaledValue = 100;
        margin = {
            top: 15,
            bottom: 20,
            left: 25,
            right: 30 }
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
    let keyAxisOrient: Orient;
    let margin: BlockMargin

    beforeEach(() => {
        scaledValue = 100;
        margin = {
            top: 15,
            bottom: 20,
            left: 25,
            right: 30 }
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
