import { Size } from "../main";
import { SizeValidator } from "./validators/sizeValidator";

class PublicOptionsServiceClass {
    validateSize(size: Partial<Size>) {
        const validator = new SizeValidator();
        return validator.validate(size);
    }
}

export const PublicOptionsService = new PublicOptionsServiceClass();