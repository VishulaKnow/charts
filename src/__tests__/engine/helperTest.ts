import configCars from "../../config/configExample";
import designerConfig from "../../designer/designerConfigExample";
import { Helper } from "../../engine/helpers/helper";
import { DataRow, TwoDimensionalOptionsModel } from "../../model/model";
import { assembleModel } from "../../model/modelBuilder";

describe('getTranslateNumbers', () => {
    test('getTranslateNumbers should return tuple of two numbers which equal transaleX and translateY', () => {
        expect(Helper.getTranslateNumbers('translate(14, 34)')).toEqual([14, 34]);
        expect(Helper.getTranslateNumbers('translate(2000, 0)')).toEqual([2000, 0]);
        expect(Helper.getTranslateNumbers('translate(-12, -123)')).toEqual([-12, -123]);
        expect(Helper.getTranslateNumbers('translate(0, 0)')).toEqual([0, 0]);
    });

    test('getTranslateNumbers should return tuple of zeros if transform attr is null', () => {
        expect(Helper.getTranslateNumbers(null)).toEqual([0, 0]);
    });
})

describe('checkDomainsEquality', () => {
    test('should return true for equal domains', () => {
        const result = Helper.checkDomainsEquality(['bmw', 'MERCEDES'], ['bmw', 'MERCEDES']);
        expect(result).toBe(true);
    });

    test('should return false for equal domains, but in diff order', () => {
        const result = Helper.checkDomainsEquality(['bmw', 'MERCEDES'], ['MERCEDES', 'bmw']);
        expect(result).toBe(false);
    });

    test('should return false for non-equal domains', () => {
        const result = Helper.checkDomainsEquality(['bmw', 'MERCEDES', 'DD'], ['bmw', 'MERCEDES']);
        expect(result).toBe(false);
    });
});

describe('parseFormattedToNumber', () => {
    test('should return float number from money string', () => {
        const result = Helper.parseFormattedToNumber('12 300,00', ',');
        expect(result).toBe(12300);
        expect(typeof result).toBe('number');
    });

    test('should return float number from decimal string with spaces', () => {
        const result = Helper.parseFormattedToNumber('12 300.00', '.');
        expect(result).toBe(12300);
        expect(typeof result).toBe('number');
    });

    test('should return float number from money string with two spaces', () => {
        const result = Helper.parseFormattedToNumber('12 300 120,00', ',');
        expect(result).toBe(12300120);
        expect(typeof result).toBe('number');
    });
});

describe('calcDigitesAfterDot', () => {
    test('should return 3 digits', () => {
        const result = Helper.calcDigitsAfterDot(12.32);
        expect(result).toBe(2);
    });

    test('should return 0 digits', () => {
        const result = Helper.calcDigitsAfterDot(12);
        expect(result).toBe(0);
    });
});


test('getTranslateNumbers should return tuple of zeros if transform attr is null', () => {
    expect(Helper.getTranslateNumbers(null)).toEqual([0, 0]);
});

describe('test getCssClasses getters', () => {
    const data = require('../../playground/assets/dataSet.json');
    let model = assembleModel(configCars, data, designerConfig)
    const options = <TwoDimensionalOptionsModel>model.options;

    test('should return correct chart class with index', () => {
        options.charts.forEach((chart, index) => {
            expect(Helper.getCssClassesLine(chart.cssClasses)).toEqual('.chart-' + index)
        });
    });
    test('should return cssClassesLine with element class index', () => {
        let elements: string[] = []
        elements.push(...(Math.random() * (Math.random() * 10)).toString())
        elements.forEach(index => {
            // expect(Helper.getCssClassesWithElementIndex(options.charts[0].cssClasses)).toEqual('.chart-' + index)
        })
    });
});

describe('test id and keyValue manipulations', () => {
    let dataset: DataRow[];
    beforeEach(() => {
        dataset = [
            {
                $id: 12,
                name: 'bmw',
                price: 130
            },
            {
                $id: 145,
                name: 'audi',
                price: 141
            },
            {
                $id: 1453,
                name: 'lada',
                price: 11
            }
        ]
    });

    test('getRowsByIds', () => {
        const result = Helper.getRowsByIds([12, 145], dataset);
        expect(result).toEqual([
            {
                $id: 12,
                name: 'bmw',
                price: 130
            },
            {
                $id: 145,
                name: 'audi',
                price: 141
            }
        ])
    });

    test('extractKeysFromRows', () => {
        const result = Helper.extractKeysFromRows('name', dataset);
        expect(result).toEqual(['bmw', 'audi', 'lada']);
    });

    test('getIdFromRowByKey', () => {
        const result = Helper.getIdFromRowByKey('name', 'audi', dataset);
        expect(result).toBe(145);
    });

    test('getKeysByIds', () => {
        const result = Helper.getKeysByIds([12, 1453], 'name', dataset);
        expect(result).toEqual(['bmw', 'lada']);
    });

    test('getKeysByIds empty', () => {
        const result = Helper.getKeysByIds([], 'name', dataset);
        expect(result).toEqual([]);
    });

    test('getKeyById', () => {
        const result = Helper.getKeyById(12, 'name', dataset);
        expect(result).toBe('bmw');
    });

    test('getRowsFromKeys', () => {
        const result = Helper.getRowsByKeys(['bmw'], 'name', dataset);
        expect(result).toEqual([
            {
                $id: 12,
                name: 'bmw',
                price: 130
            }
        ]);
    });
});