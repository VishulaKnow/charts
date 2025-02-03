import { Size } from "../../config/config";
import { SizeValidator } from "../../optionsServices/validators/sizeValidator";

describe("SizeValidator", () => {
	describe("`validate`", () => {
		const validator = new SizeValidator();

		test("should return false for invalid sizes", () => {
			const invalidSizes: Partial<Size>[] = [
				{ width: "" },
				{ height: "" },
				{ width: {} },
				{ height: {} },
				{ width: -12 },
				{ height: -12 },
				{ width: -12, height: -12 },
				{ width: 0, height: 0 },
				{ width: 0 },
				{ height: 0 }
			] as any[];

			invalidSizes.forEach((size) => {
				const res = validator.validate(size);
				expect(res).toBe(false);
			});
		});

		test("should return true for valid sizes", () => {
			const validSizes: Partial<Size>[] = [{}, { width: 12 }, { height: 12 }, { width: 12, height: 12 }];

			validSizes.forEach((size) => {
				const res = validator.validate(size);
				expect(res).toBe(true);
			});
		});
	});
});
