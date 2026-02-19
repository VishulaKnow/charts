import { MdtChartsDataRow } from "../../../config/config";
import { extractLegendValues } from "./sunburstLegendValuesExtractor";

describe("extractLegendValues", () => {
	test("returns unique values for one field", () => {
		const dataRows: MdtChartsDataRow[] = [
			{ country: "USA", city: "New York" },
			{ country: "Germany", city: "Berlin" },
			{ country: "USA", city: "Boston" },
			{ country: "France", city: "Paris" }
		];

		const result = extractLegendValues(dataRows, ["country"]);

		expect(result).toEqual(["USA", "Germany", "France"]);
	});

	test("appends unique values by fields order", () => {
		const dataRows: MdtChartsDataRow[] = [
			{ country: "USA", city: "New York" },
			{ country: "Germany", city: "Berlin" },
			{ country: "USA", city: "Boston" },
			{ country: "France", city: "Paris" }
		];

		const result = extractLegendValues(dataRows, ["country", "city"]);

		expect(result).toEqual(["USA", "Germany", "France", "New York", "Berlin", "Boston", "Paris"]);
	});

	test("returns empty array when no legend fields are provided", () => {
		const dataRows: MdtChartsDataRow[] = [
			{ country: "USA", city: "New York" },
			{ country: "Germany", city: "Berlin" }
		];

		const result = extractLegendValues(dataRows, []);

		expect(result).toEqual([]);
	});
});
