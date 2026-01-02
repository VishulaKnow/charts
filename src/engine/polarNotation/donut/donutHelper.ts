import { merge } from "d3-array";
import { PieArcDatum, Arc, arc, Pie, pie } from "d3-shape";
import { MdtChartsDataRow, Size, MdtChartsColorField } from "../../../config/config";
import { BlockMargin } from "../../../model/model";

export class DonutHelper {
	public static getArcCentroid(
		outerRadius: number,
		dataItem: PieArcDatum<MdtChartsDataRow>,
		donutThickness: number
	): [number, number] {
		const arc = this.getArcGeneratorObject(outerRadius, donutThickness);
		return arc.centroid(dataItem);
	}

	public static getArcGeneratorObject(
		outerRadius: number,
		donutThickness: number
	): Arc<any, PieArcDatum<MdtChartsDataRow>> {
		const arc = this.getArcGenerator(outerRadius, outerRadius - donutThickness);
		return arc;
	}

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
