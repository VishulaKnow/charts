import { MdtChartsDataRow } from "../../../config/config";

export function extractLegendValues(dataRows: MdtChartsDataRow[], fieldInLegendName: string): string[] {
	const values = dataRows.map<string>((dataRow) => dataRow[fieldInLegendName]);
	const uniqueValues = values.filter((value, index) => {
		return values.indexOf(value) === index;
	});
	return uniqueValues;
}
