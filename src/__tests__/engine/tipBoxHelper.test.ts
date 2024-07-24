import { AxisScale } from "d3-axis";
import { scaleBand, scalePoint } from "d3-scale";
import { TipBoxHelper } from "../../engine/features/tipBox/tipBoxHelper";
import { Size } from "../../config/config";
import { BlockMargin } from "../../model/model";

describe('getKeyValueByPointer', () => {
    let scaleKey: AxisScale<string>;
    let margin: BlockMargin;
    let blockSize: Size;

    beforeEach(() => {
        scaleKey = scaleBand().domain(['bmw', 'lada', 'subaru']).range([0, 100]);
        margin = {
            bottom: 20, top: 20, left: 20, right: 20
        }
        blockSize = {
            height: 140, width: 140
        }
    });

    test('shuld return bmw for band scale', () => {
        const result = TipBoxHelper.getKeyValueByPointer([50, 50], 'vertical', margin, blockSize, scaleKey, 'band');
        expect(result).toBe('bmw');
    });

    test('shuld return subaru for band scale', () => {
        const result = TipBoxHelper.getKeyValueByPointer([90, 50], 'vertical', margin, blockSize, scaleKey, 'band');
        expect(result).toBe('subaru');
    });

    test('shuld return lada for point scale', () => {
        scaleKey = scalePoint().domain(['bmw', 'lada', 'subaru']).range([0, 100]);
        const result = TipBoxHelper.getKeyValueByPointer([50, 50], 'vertical', margin, blockSize, scaleKey, 'point');
        expect(result).toBe('lada');
    });

    test('shuld return lada for point scale', () => {
        scaleKey = scalePoint().domain(['bmw', 'lada', 'subaru']).range([0, 100]);
        const result = TipBoxHelper.getKeyValueByPointer([90, 50], 'vertical', margin, blockSize, scaleKey, 'point');
        expect(result).toBe('lada');
    });
});