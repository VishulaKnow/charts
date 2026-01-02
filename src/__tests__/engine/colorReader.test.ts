import { ColorReaderClass } from "../../engine/colorReader/colorReader";
import { MdtChartsColorField, MdtChartsDataRow } from "../../config/config";
import { DonutChartModel } from "../../model/model";

describe("Donut ColorReader", () => {
	describe("getColorForArc", () => {
		const colorReader = new ColorReaderClass();

		const getPolarChart = (colorField: MdtChartsColorField, elementColors?: string[]): DonutChartModel => {
			return {
				cssClasses: [],
				style: {
					elementColors,
					opacity: 1
				},
				type: "donut",
				data: {
					valueField: {
						format: "",
						name: "",
						title: ""
					},
					colorField
				},
				legend: {
					markerShape: "circle"
				}
			};
		};

		test("should return color from dataRow if `colorField` exists in model", () => {
			const row: MdtChartsDataRow = {
				color: "red",
				value: 42
			};
			const chart = getPolarChart("color");

			const result = colorReader.getColorForArc(row, chart, 0);
			expect(result).toBe<string>("red");
		});

		test("should return color from palette if `colorField` in model is not exist", () => {
			const row: MdtChartsDataRow = {
				color: "red",
				value: 42
			};
			const chart = getPolarChart(null, ["green"]);

			const result = colorReader.getColorForArc(row, chart, 0);
			expect(result).toBe<string>("green");
		});
	});
});
