import { DonutThicknessUnit } from "../../model/model";
import { DonutThicknessService } from "../../model/notations/polar/donut/donutThicknessService";

describe("DonutThicknessService", () => {
	const service = new DonutThicknessService();

	describe("getUnit", () => {
		test("should return px if any value is number", () => {
			const res = service.getUnit({
				value: 25,
				max: null,
				min: null
			});
			expect(res).toBe<DonutThicknessUnit>("px");
		});

		test("should return percent if value is set and it has percent unit", () => {
			const res = service.getUnit({
				value: "25%",
				max: null,
				min: null
			});
			expect(res).toBe<DonutThicknessUnit>("%");
		});

		test("should return px if value is set and it has px unit", () => {
			const res = service.getUnit({
				value: "25px",
				max: null,
				min: null
			});
			expect(res).toBe<DonutThicknessUnit>("px");
		});

		test("should return percent if value is not set AND min and max has percent unit BOTH", () => {
			const res = service.getUnit({
				max: "25%",
				min: "50%"
			});
			expect(res).toBe<DonutThicknessUnit>("%");
		});

		test("should return px if value is not set AND min and max has px unit BOTH", () => {
			const res = service.getUnit({
				max: "25px",
				min: "50px"
			});
			expect(res).toBe<DonutThicknessUnit>("px");
		});

		test("should return px if value is not set AND min and max has different units", () => {
			const res = service.getUnit({
				max: "25px",
				min: "50%"
			});
			expect(res).toBe<DonutThicknessUnit>("px");
		});
	});

	describe("valueToNumber", () => {
		test("should return value if value is number", () => {
			const res = service.valueToNumber(42);
			expect(res).toBe(42);
		});

		test("should return first number values from string if value is string", () => {
			const res = service.valueToNumber("42x");
			expect(res).toBe(42);
		});
	});
});
