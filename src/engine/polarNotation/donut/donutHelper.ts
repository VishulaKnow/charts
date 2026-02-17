import { merge } from "d3-array";
import { PieArcDatum, Arc, arc, Pie, pie } from "d3-shape";
import { MdtChartsDataRow, MdtChartsColorField } from "../../../config/config";
import { PolarSegmentModel } from "../../../model/model";

export class DonutHelper {
	public static getArcGenerator(outerRadius: number, innerRadius: number): Arc<any, PieArcDatum<PolarSegmentModel>> {
		return arc<PieArcDatum<PolarSegmentModel>>().innerRadius(innerRadius).outerRadius(outerRadius);
	}

	public static getPieGenerator(padAngle: number): Pie<any, PolarSegmentModel> {
		return pie<PolarSegmentModel>()
			.padAngle(padAngle)
			.sort(null)
			.value((d) => d.value);
	}

	public static mergeDataWithZeros(
		firstDataset: PolarSegmentModel[],
		secondDataset: PolarSegmentModel[]
	): PolarSegmentModel[] {
		const secondSet = new Set();
		secondDataset.forEach((segment) => secondSet.add(segment.key));

		const onlyNew = firstDataset
			.filter((d) => !secondSet.has(d.key))
			.map((d, index, array) => {
				const segmentToChangeToZero: PolarSegmentModel = {
					...d,
					value: 0
				};
				return segmentToChangeToZero;
			});

		const merged = merge<PolarSegmentModel>([secondDataset, onlyNew]);
		return merged;
	}
}
