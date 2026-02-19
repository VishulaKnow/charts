import { MdtChartsConfig, MdtChartsSunburstOptions } from "../../../../config/config";
import { SunburstConfigReader } from "./sunburstConifgReader";

describe("SunburstConfigReader", () => {
	describe("getFieldsInLegend", () => {
		const createReader = (levels: MdtChartsSunburstOptions["levels"]) => {
			const config: MdtChartsConfig = {
				canvas: null,
				options: {
					type: "sunburst",
					data: {
						dataSource: "data",
						valueField: {
							name: "value",
							format: "number",
							title: "Value"
						}
					},
					levels
				}
			};

			return SunburstConfigReader.createFromGlobalConfig(config, null as any);
		};

		test("should return first level key field when legend is not configured for all levels", () => {
			const reader = createReader([
				{
					data: {
						keyField: { name: "country" }
					}
				},
				{
					data: {
						keyField: { name: "city" }
					}
				}
			]);

			expect(reader.getFieldsInLegend()).toEqual(["country"]);
		});

		test("should return only levels with legend.show equal true", () => {
			const reader = createReader([
				{
					data: {
						keyField: { name: "country" }
					},
					legend: {
						show: false
					}
				},
				{
					data: {
						keyField: { name: "city" }
					},
					legend: {
						show: true
					}
				},
				{
					data: {
						keyField: { name: "street" }
					}
				}
			]);

			expect(reader.getFieldsInLegend()).toEqual(["city"]);
		});

		test("should return empty array when legend is configured but disabled for all configured levels", () => {
			const reader = createReader([
				{
					data: {
						keyField: { name: "country" }
					},
					legend: {
						show: false
					}
				},
				{
					data: {
						keyField: { name: "city" }
					},
					legend: {
						show: false
					}
				}
			]);

			expect(reader.getFieldsInLegend()).toEqual([]);
		});
	});
});
