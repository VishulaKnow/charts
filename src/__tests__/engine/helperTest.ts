import { Helper } from "../../engine/helpers/helper";

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

describe('getKeyFieldValue', () => {
    test('should return value for non-segmemted', () => {
        const row = {
            brand: 'bmw'
        }
        const result = Helper.getKeyFieldValue(row, 'brand', false);
        expect(result).toBe('bmw');
    });

    test('should return value for segmemted', () => {
        const row = {
            data: {
                brand: 'bmw'
            }
        }
        const result = Helper.getKeyFieldValue(row, 'brand', true);
        expect(result).toBe('bmw');
    });
});