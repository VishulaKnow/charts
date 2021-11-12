import { ConfigValidatorClass } from "../../model/configsValidator/configValidator";
import { Size } from "../../config/config"

describe('ConfigValidator', () => {
    describe('`validateCanvasSize`', () => {
        const validator = new ConfigValidatorClass();

        test('should return false for non-valid size', () => {
            const invalidSizes: Size[] = [
                { width: -12, height: -12 },
                { width: "", height: {} },
                { width: [], height: [] }
            ] as any

            invalidSizes.forEach(size => {
                const res = validator.validateCanvasSize(size);
                expect(res).toBe(false);
            })
        });

        test('should return false for valid size', () => {
            const invalidSizes: Size[] = [
                { width: 0, height: 0 },
                { width: 120, height: 120 }
            ] as any

            invalidSizes.forEach(size => {
                const res = validator.validateCanvasSize(size);
                expect(res).toBe(true);
            })
        });
    });
});