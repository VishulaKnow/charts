import { MdtChartsColorRangeItem } from "../../config/config";
import { ColorRangeManager, sortColorRange } from "./colorRange";

describe("sortColorRange", () => {
	test("should sort by values range without value should be in start", () => {
		const range: MdtChartsColorRangeItem[] = [
			{
				value: 100,
				color: "green"
			},
			{
				value: 0,
				color: "blue"
			},
			{
				color: "red"
			}
		];

		const res = sortColorRange(range);

		expect(res).toEqual([
			{
				color: "red"
			},
			{
				value: 0,
				color: "blue"
			},
			{
				value: 100,
				color: "green"
			}
		]);
	});

	test("should not change array if it is already sorted", () => {
		const range: MdtChartsColorRangeItem[] = [
			{
				color: "red"
			},
			{
				value: 0,
				color: "blue"
			},
			{
				value: 100,
				color: "green"
			}
		];

		const res = sortColorRange(range);

		expect(res).toEqual([
			{
				color: "red"
			},
			{
				value: 0,
				color: "blue"
			},
			{
				value: 100,
				color: "green"
			}
		]);
	});

	test("should not change position if equal ranges", () => {
		const range: MdtChartsColorRangeItem[] = [
			{
				value: 0,
				color: "blue"
			},
			{
				value: 0,
				color: "green"
			},
			{
				color: "red"
			}
		];

		const res = sortColorRange(range);

		expect(res).toEqual([
			{
				color: "red"
			},
			{
				value: 0,
				color: "blue"
			},
			{
				value: 0,
				color: "green"
			}
		]);
	});

	test("should not change position of items without value", () => {
		const range: MdtChartsColorRangeItem[] = [
			{
				color: "orange"
			},
			{
				value: 0,
				color: "blue"
			},
			{
				color: "yellow"
			},
			{
				value: 0,
				color: "green"
			},
			{
				color: "red"
			}
		];

		const res = sortColorRange(range);

		expect(res).toEqual([
			{
				color: "red"
			},
			{
				color: "yellow"
			},
			{
				color: "orange"
			},
			{
				value: 0,
				color: "blue"
			},
			{
				value: 0,
				color: "green"
			}
		]);
	});
});

describe("ColorRangeManager", () => {
	describe("getColorByValue", () => {
		test("should return by value", () => {
			const manager = new ColorRangeManager([
				{
					color: "red"
				},
				{
					value: 0,
					color: "blue"
				},
				{
					value: 100,
					color: "green"
				}
			]);

			let res = manager.getColorByValue(-10);
			expect(res).toBe("red");

			res = manager.getColorByValue(0);
			expect(res).toBe("blue");

			res = manager.getColorByValue(10);
			expect(res).toBe("blue");

			res = manager.getColorByValue(100);
			expect(res).toBe("green");
		});

		test("should return by value and find item by value", () => {
			const manager = new ColorRangeManager([
				{
					color: "red"
				},
				{
					value: 0,
					color: "blue"
				},
				{
					value: 0,
					color: "green"
				}
			]);

			let res = manager.getColorByValue(-10);
			expect(res).toBe("red");

			res = manager.getColorByValue(0);
			expect(res).toBe("blue");

			res = manager.getColorByValue(1);
			expect(res).toBe("green");
		});

		test("should work with unsorted ranges", () => {
			const manager = new ColorRangeManager([
				{
					value: 100,
					color: "blue"
				},
				{
					color: "red"
				},
				{
					value: 0,
					color: "green"
				}
			]);

			let res = manager.getColorByValue(-10);
			expect(res).toBe("red");

			res = manager.getColorByValue(0);
			expect(res).toBe("green");

			res = manager.getColorByValue(100);
			expect(res).toBe("blue");
		});

		test("should take last first item without values if range contains several items without items", () => {
			const manager = new ColorRangeManager([
				{
					value: 100,
					color: "blue"
				},
				{
					color: "red"
				},
				{
					value: 0,
					color: "green"
				},
				{
					color: "yellow"
				}
			]);

			let res = manager.getColorByValue(-10);
			expect(res).toBe("red");

			res = manager.getColorByValue(0);
			expect(res).toBe("green");

			res = manager.getColorByValue(100);
			expect(res).toBe("blue");
		});
	});
});
