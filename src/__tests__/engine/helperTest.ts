import { Helper } from "../../engine/helper";

test('getTranslateNumbers should return tuple of two numbers which equal transaleX and translateY', () => {
    expect(Helper.getTranslateNumbers('translate(14, 34)')).toEqual([14, 34]);
    expect(Helper.getTranslateNumbers('translate(2000, 0)')).toEqual([2000, 0]);
    expect(Helper.getTranslateNumbers('translate(-12, -123)')).toEqual([-12, -123]);
    expect(Helper.getTranslateNumbers('translate(0, 0)')).toEqual([0, 0]);
});

test('getTranslateNumbers should return tuple of zeros if transform attr is null', () => {
    expect(Helper.getTranslateNumbers(null)).toEqual([0, 0]);
});