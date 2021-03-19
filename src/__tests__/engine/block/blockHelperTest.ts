import configCars from "../../../config/configExample";
import designerConfig from "../../../designer/designerConfigExample";
import { BlockMargin, Size, Model } from "../../../model/model";
import { assembleModel } from "../../../model/modelBuilder";
import { BlockHelper } from "../../../engine/block/blockHelper";


describe('ClipPathAttributesTest', ()=> {
    const data = require('../../../playground/assets/dataSet.json');
    let model: Model = assembleModel(configCars, data, designerConfig)
    let size: Size = model.blockCanvas.size;
    let margin: BlockMargin = model.chartBlock.margin 
    test('should return CLipPathAttributes defined object', ()=> {
        expect(BlockHelper.getClipPathAttributes(size, margin)).toBeDefined()
    });
});