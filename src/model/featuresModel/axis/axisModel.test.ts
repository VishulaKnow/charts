import { AxisModel } from "./axisModel";

describe("AxisModel", () => {
	describe("getLabelSize", () => {
		it("should return correct size for single label", () => {
			const labelSize = AxisModel.getLabelSize(100, ["test"]);
			expect(labelSize.width).toBe(32);
			expect(labelSize.height).toBe(14);
		});

		it("should return biggest size for multiple labels", () => {
			const labelSize = AxisModel.getLabelSize(100, ["test", "test2", "TESTTEST"]);
			expect(labelSize.width).toBe(92);
			expect(labelSize.height).toBe(14);
		});

		it("should return correct size for number labels", () => {
			const labelSize = AxisModel.getLabelSize(100, [2025]);
			expect(labelSize.width).toBe(28);
			expect(labelSize.height).toBe(14);
		});

		it("should return 0 for width if there are no labels", () => {
			const labelSize = AxisModel.getLabelSize(100, []);
			expect(labelSize.width).toBe(0);
			expect(labelSize.height).toBe(14);
		});
	});
});
