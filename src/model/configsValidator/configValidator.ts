import { Size } from "../../config/config"

export class ConfigValidatorClass {
    validateCanvasSize(size: Size) {
        const validateSide = (side: number) => typeof side === "number" && side >= 0;
        return validateSide(size.width) && validateSide(size.height);
    }
}

export const ConfigValidator = new ConfigValidatorClass();