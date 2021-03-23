import designerConfig from "../../../designer/designerConfigExample";
import { LegendHelper } from "../../../engine/features/legend/legendHelper";
import { Model } from "../../../model/model";
import { assembleModel } from "../../../model/modelBuilder";

const configTest2D = require('../../../../config/configTest2D.json');
const configTestPolar = require('../../../../config/configTestPolar.json');
const data = require('../../../../playground/assets/dataSet');
const model2D: Model = assembleModel(configTest2D, data, designerConfig);
const modelPolar = assembleModel(configTestPolar, data, designerConfig);

describe('getLegendItemsContent', () => {
    test('TwoDimensionalOptionsModel', () => {
        let result = LegendHelper.getLegendItemsContent(model2D.options, data)
        expect(result).toEqual(["Заголовок", "Заголовок 1", "Заголовок 2"])
    });

    test('PolarOptionsModel', () => {
        let result = LegendHelper.getLegendItemsContent(modelPolar.options, data)
        expect(result)
            .toEqual(["BMW", "LADA", "MERCEDES", "AUDI", "VOLKSWAGEN", "DODGE", "SAAB", "HONDA", "TOYOTA"]);
    });
});