import designerConfig from "../../../../designer/designerConfigExample";
import { LegendHelper } from "../../../../engine/features/legend/legendHelper";
import { Model } from "../../../../model/model";
import { assembleModel } from "../../../../model/modelBuilder";

describe('getLegendItemsContent', ()=>{
    const data = require('../../../../playground/assets/dataSet');
    const configTest2D = require('../../../../config/configTest2D.json')
    let model: Model = assembleModel(configTest2D, data, designerConfig)
    describe('TwoDimensionalOptionsModel', ()=>{
        let result = LegendHelper.getLegendItemsContent(model.options, data)
        console.log(result)
        expect(result).toEqual(["Количество", "Aвтомобилей на", "Количество автомобилей"])
    });
    const configTestPolar = require('../../../../config/configTestPolar.json')
    model = assembleModel(configTestPolar, data, designerConfig)
    describe('PolarOptionsModel', ()=>{
        let result = LegendHelper.getLegendItemsContent(model.options, data)
        console.log(result)
        expect(result)
        .toEqual(["BMW", "LADA", "MERCEDES", "AUDI", "VOLKSWAGEN", "DODGE", "SAAB", "HONDA", "TOYOTA"]);
    });
    expect(1).toBe(1)
    // describe('IntervalOptionsModel', ()=>{

    // });
});