import { Size } from "../../config/config";

export class SizeValidator {
    validate(size: Partial<Size>) {
        return this.validateSide(size.height) && this.validateSide(size.width);
    }

    private validateSide(side: number) {
        if (side == null) return true;
        if (typeof side !== "number" || side <= 0) {
            return false;
        }
        return true;
    }
}