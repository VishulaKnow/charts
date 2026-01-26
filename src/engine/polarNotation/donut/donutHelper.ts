import { merge } from "d3-array";
import { PieArcDatum, Arc, arc, Pie, pie } from "d3-shape";
import { MdtChartsDataRow, MdtChartsColorField } from "../../../config/config";

export class DonutHelper {
	public static getArcGenerator(outerRadius: number, innerRadius: number): Arc<any, PieArcDatum<MdtChartsDataRow>> {
		return arc<PieArcDatum<MdtChartsDataRow>>().innerRadius(innerRadius).outerRadius(outerRadius);
	}

	public static getPieGenerator(valueField: string, padAngle: number): Pie<any, MdtChartsDataRow> {
		return pie<MdtChartsDataRow>()
			.padAngle(padAngle)
			.sort(null)
			.value((d) => d[valueField]);
	}

	public static mergeDataWithZeros(
		firstDataset: MdtChartsDataRow[],
		secondDataset: MdtChartsDataRow[],
		keyField: string,
		colorField: MdtChartsColorField
	): MdtChartsDataRow[] {
		const secondSet = new Set();
		secondDataset.forEach((dataRow) => {
			secondSet.add(dataRow[keyField]);
		});
		const onlyNew = firstDataset
			.filter((d) => !secondSet.has(d[keyField]))
			.map((d, index, array) => {
				const data: MdtChartsDataRow = {
					keyField: array[index][keyField],
					valueField: 0,
					[colorField]: array[index][colorField]
					//TODO: добавить цвет из ColorReader'а
				};
				return data;
			});
		const sortedMerge = merge([secondDataset, onlyNew]);
		return sortedMerge;
	}
}
