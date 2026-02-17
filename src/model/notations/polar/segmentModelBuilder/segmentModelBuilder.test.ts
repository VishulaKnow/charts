import { MdtChartsDataRow } from "../../../../config/config";
import { SegmentModelBuilder } from "./segmentModelBuilder";

describe("SegmentModelBuilder", () => {
	test("should return empty array when scopedDataRows is empty", () => {
		const modelBuilder = new SegmentModelBuilder({
			scopedDataRows: [],
			keyFieldName: "category",
			valueFieldName: "amount",
			chartPaletteColors: ["#111111"]
		});

		expect(modelBuilder.build()).toEqual([]);
	});

	test("should build segments with key, value, palette color and attachedDataRow", () => {
		const scopedDataRows: MdtChartsDataRow[] = [
			{ category: "A", amount: 10 },
			{ category: "B", amount: 20 }
		];

		const modelBuilder = new SegmentModelBuilder({
			scopedDataRows,
			keyFieldName: "category",
			valueFieldName: "amount",
			chartPaletteColors: ["#111111", "#222222"]
		});

		expect(modelBuilder.build()).toEqual([
			{
				key: "A",
				value: 10,
				color: "#111111",
				attachedDataRow: scopedDataRows[0]
			},
			{
				key: "B",
				value: 20,
				color: "#222222",
				attachedDataRow: scopedDataRows[1]
			}
		]);
	});

	test("should cycle palette colors when rows amount exceeds palette length", () => {
		const scopedDataRows: MdtChartsDataRow[] = [
			{ category: "A", amount: 10 },
			{ category: "B", amount: 20 },
			{ category: "C", amount: 30 }
		];

		const modelBuilder = new SegmentModelBuilder({
			scopedDataRows,
			keyFieldName: "category",
			valueFieldName: "amount",
			chartPaletteColors: ["#111111", "#222222"]
		});

		const segments = modelBuilder.build();

		expect(segments[0].color).toBe("#111111");
		expect(segments[1].color).toBe("#222222");
		expect(segments[2].color).toBe("#111111");
	});

	test("should use row color from colorFieldName when provided", () => {
		const scopedDataRows: MdtChartsDataRow[] = [
			{ category: "A", amount: 10, color: "#aaaaaa" },
			{ category: "B", amount: 20, color: "#bbbbbb" }
		];

		const modelBuilder = new SegmentModelBuilder({
			scopedDataRows,
			keyFieldName: "category",
			valueFieldName: "amount",
			chartPaletteColors: ["#111111", "#222222"],
			colorFieldName: "color"
		});

		expect(modelBuilder.build()).toEqual([
			{
				key: "A",
				value: 10,
				color: "#aaaaaa",
				attachedDataRow: scopedDataRows[0]
			},
			{
				key: "B",
				value: 20,
				color: "#bbbbbb",
				attachedDataRow: scopedDataRows[1]
			}
		]);
	});
});
