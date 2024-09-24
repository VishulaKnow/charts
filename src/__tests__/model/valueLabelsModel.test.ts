
import {
    calculateValueLabelAlignment,
    getValueLabelX,
    getValueLabelY
} from "../../model/featuresModel/valueLabelsModel/valueLabelsModel";
import { BlockMargin, Orient } from "../../model/model";

describe('getValueLabelX', () => {
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

    test('should return valueLabel equal to 115, because orient is right', () => {
        keyAxisOrient = 'right';
        const result = getValueLabelX(scaledValue, keyAxisOrient, margin)

        expect(result).toEqual(115);
    });

    test('should return valueLabel equal to 135, because orient is left', () => {
        keyAxisOrient = 'left';
        const result = getValueLabelX(scaledValue, keyAxisOrient, margin)

        expect(result).toEqual(135);
    });

    test('should return valueLabel equal to 125, because no orient', () => {
        const result = getValueLabelX(scaledValue, keyAxisOrient, margin)

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
        keyAxisOrient = 'top';
        const result = getValueLabelY(scaledValue, keyAxisOrient, margin)

        expect(result).toEqual(125);
    });

    test('should return valueLabel equal to 135, because orient is bottom', () => {
        keyAxisOrient = 'bottom';
        const result = getValueLabelY(scaledValue, keyAxisOrient, margin)

        expect(result).toEqual(105);
    });

    test('should return valueLabel equal to 115, because no orient', () => {
        const result = getValueLabelY(scaledValue, keyAxisOrient, margin)

        expect(result).toEqual(115);
    });
});

describe('calculateValueLabelAlignment', () => {
    let keyAxisOrient: Orient;

    test('should return dominantBaseline is hanging and textAnchor is middle for top orient', () => {
        keyAxisOrient = 'top';
        const valueLabelAlignment = calculateValueLabelAlignment(keyAxisOrient)

        expect(valueLabelAlignment.dominantBaseline).toEqual('hanging');
        expect(valueLabelAlignment.textAnchor).toEqual('middle');
    });

    test('should return dominantBaseline is hanging and textAnchor is middle for bottom orient', () => {
        keyAxisOrient = 'bottom';
        const valueLabelAlignment = calculateValueLabelAlignment(keyAxisOrient)

        expect(valueLabelAlignment.dominantBaseline).toEqual('auto');
        expect(valueLabelAlignment.textAnchor).toEqual('middle');
    });

    test('should return dominantBaseline is hanging and textAnchor is middle for left orient', () => {
        keyAxisOrient = 'left';
        const valueLabelAlignment = calculateValueLabelAlignment(keyAxisOrient)

        expect(valueLabelAlignment.dominantBaseline).toEqual('middle');
        expect(valueLabelAlignment.textAnchor).toEqual('start');
    });

    test('should return dominantBaseline is hanging and textAnchor is middle for right orient', () => {
        keyAxisOrient = 'right';
        const valueLabelAlignment = calculateValueLabelAlignment(keyAxisOrient)

        expect(valueLabelAlignment.dominantBaseline).toEqual('middle');
        expect(valueLabelAlignment.textAnchor).toEqual('end');
    });
});
