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

test('getPXpropertyValue should return number from string: "[number]px"', () => {
    expect(Helper.getPXpropertyValue('12px')).toBe(12);
    expect(Helper.getPXpropertyValue('12123123123123px')).toBe(12123123123123);
    expect(Helper.getPXpropertyValue('12px123')).toBe(12);
});

test('getPropertyValue should return value of property of HTMLElement param', () => {
    const elem = document.createElement('div');
    elem.style.margin = '12px'
    expect(Helper.getPropertyValue(elem, 'margin')).toEqual('12px');
});

test('getPropertyValue should return value of property of SVGElement param', () => {
    const elem = document.createElement('circle');
    elem.style.fill = 'red'
    expect(Helper.getPropertyValue(elem, 'fill')).toEqual('red');
});