import configCars from "../../config/configExample";
import designerConfig from "../../designer/designerConfigExample";
import { Helper } from "../../engine/helpers/helper";
import { TwoDimensionalOptions } from "../../main";
import { Model, TwoDimensionalOptionsModel } from "../../model/model";
import { assembleModel } from "../../model/modelBuilder";

test('getTranslateNumbers should return tuple of two numbers which equal transaleX and translateY', () => {
    expect(Helper.getTranslateNumbers('translate(14, 34)')).toEqual([14, 34]);
    expect(Helper.getTranslateNumbers('translate(2000, 0)')).toEqual([2000, 0]);
    expect(Helper.getTranslateNumbers('translate(-12, -123)')).toEqual([-12, -123]);
    expect(Helper.getTranslateNumbers('translate(0, 0)')).toEqual([0, 0]);
});

test('getTranslateNumbers should return tuple of zeros if transform attr is null', () => {
    expect(Helper.getTranslateNumbers(null)).toEqual([0, 0]);
});

describe('test getCssClasses getters', ()=> {
    const data = require('../../playground/assets/dataSet.json');
    let model = assembleModel(configCars, data, designerConfig)
    const options = <TwoDimensionalOptionsModel>model.options;

    test('should return correct chart class with index', ()=>{
        options.charts.forEach((chart, index) => {
            expect(Helper.getCssClassesLine(chart.cssClasses)).toEqual('.chart-' + index)
        });
    });
    test('should return cssClassesLine with element class index', ()=> {
        let elements: string[] = []
        elements.push(...(Math.random() * (Math.random() * 10)).toString())
            elements.forEach(index => {
                // expect(Helper.getCssClassesWithElementIndex(options.charts[0].cssClasses)).toEqual('.chart-' + index)
            })
    });
});