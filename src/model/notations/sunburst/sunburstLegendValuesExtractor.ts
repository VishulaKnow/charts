import { MdtChartsDataRow } from "../../../config/config";

export function extractLegendValues(dataRows: MdtChartsDataRow[], fieldNamesInLegend: string[]): string[] {
	const totalLegendValues: string[] = [];

	for (const fieldName of fieldNamesInLegend) {
		const values = dataRows.map<string>((dataRow) => dataRow[fieldName]);

		const uniqueValues = values.filter((value, index) => {
			return values.indexOf(value) === index;
		});

		totalLegendValues.push(...uniqueValues);
	}
	return totalLegendValues;
}
