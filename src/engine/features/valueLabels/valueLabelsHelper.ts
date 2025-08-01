import { ValueLabelAttrs, ValueLabelsOptions } from "../../../engine/features/valueLabels/valueLabels";
import { TwoDimChartValueLabelsOptions } from "../../../model/model";
import { Scale, Scales } from "../../../engine/features/scale/scale";
import { Segment } from "../../twoDimensionalNotation/lineLike/generatorMiddleware/lineLikeGeneratorDefineMiddleware";
import { MdtChartsDataRow } from "../../../config/config";

export class ValueLabelsAttrsProvider {
	getAttrs(
		globalOptions: ValueLabelsOptions,
		valueLabels: TwoDimChartValueLabelsOptions,
		scales: Scales,
		datumField: string,
		dataRowAccessor: (d: MdtChartsDataRow | Segment) => MdtChartsDataRow,
		fieldIndexInChart: number
	) {
		let attrs: ValueLabelAttrs = {
			x: null,
			y: null,
			dominantBaseline: valueLabels.dominantBaseline,
			textAnchor: valueLabels.textAnchor
		};
		const orient = globalOptions.canvas.keyAxisOrient;

		if (orient === "left" || orient === "right") {
			attrs.x = (d) =>
				valueLabels.handleX(scales.value(valueLabels.handleValueBeforeScale(d, datumField)), fieldIndexInChart);
			attrs.y = (d) =>
				valueLabels.handleY(scales.key(dataRowAccessor(d)[globalOptions.data.keyFieldName]), fieldIndexInChart);
		} else if (orient === "bottom" || orient === "top") {
			attrs.x = (d) =>
				valueLabels.handleX(scales.key(dataRowAccessor(d)[globalOptions.data.keyFieldName]), fieldIndexInChart);
			attrs.y = (d) =>
				valueLabels.handleY(scales.value(valueLabels.handleValueBeforeScale(d, datumField)), fieldIndexInChart);
		}

		return attrs;
	}
}
