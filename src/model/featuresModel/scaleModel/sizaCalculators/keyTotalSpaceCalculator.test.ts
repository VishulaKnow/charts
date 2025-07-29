import { KeyTotalSpaceCalculator } from "./keyTotalSpaceCalculator";
import { ScaleCanvasSizesCalculator } from "./scaleCanvasSizesCalculator";

describe("KeyTotalSpaceCalculator", () => {
	describe("calculate", () => {
		it("should return correct total space for key items", () => {
			const calculator = new KeyTotalSpaceCalculator({
				scaleSizesCalculator: new ScaleCanvasSizesCalculator({
					keyScale: {
						type: "band",
						domain: ["a", "b", "c"],
						range: { start: 0, end: 100 },
						sizes: {
							paddingInner: 10,
							paddingOuter: 10,
							oneKeyTotalSpace: 20,
							recalculatedStepSize: 20,
							bandSize: 10
						}
					}
				})
			});

			const result = calculator.calculate();
			expect(result).toEqual([{ totalSize: 35 }, { totalSize: 30 }, { totalSize: 35 }]);
		});

		it("should return whole width space if there is only one key", () => {
			const calculator = new KeyTotalSpaceCalculator({
				scaleSizesCalculator: new ScaleCanvasSizesCalculator({
					keyScale: {
						type: "band",
						domain: ["a"],
						range: { start: 0, end: 100 },
						sizes: {
							paddingInner: 10,
							paddingOuter: 10,
							oneKeyTotalSpace: 20,
							recalculatedStepSize: 20,
							bandSize: 10
						}
					}
				})
			});

			const result = calculator.calculate();
			expect(result).toEqual([{ totalSize: 100 }]);
		});
	});
});
