import configCars from "../../playground/configs/configExample";
import { Size } from "../../config/config";
import designerConfig from "../../playground/configs/designerConfigExample";
import { BlockMargin, Model } from "../../model/model";
import { assembleModel } from "../../model/modelBuilder";
import { BlockHelper } from "../../engine/block/blockHelper";


describe('ClipPathAttributesTest', () => {
    let size: Size = {
        height: 500,
        width: 1000
    };
    let margin: BlockMargin = {
        bottom: 20,
        left: 20,
        right: 20,
        top: 20
    };

    test('should return CLipPathAttributes defined object', () => {
        expect(BlockHelper.getClipPathAttributes(size, margin)).toBeDefined()
    });
});