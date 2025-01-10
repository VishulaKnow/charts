import {
    ValueLabelAttrs, ValueLabelsOptions
} from "../../../engine/features/valueLabels/valueLabels";
import { TwoDimChartValueLabelsOptions, ValueField } from "../../../model/model";
import { Scale, Scales } from "../../../engine/features/scale/scale";
import { Segment } from "../../twoDimensionalNotation/lineLike/generatorMiddleware/lineLikeGeneratorDefineMiddleware";
import { MdtChartsDataRow } from "../../../config/config";

export class ValueLabelsAttrsProvider {
    getAttrs(globalOptions: ValueLabelsOptions, valueLabels: TwoDimChartValueLabelsOptions, scales: Scales, valueFieldName: string, dataRowAccessor: (d: MdtChartsDataRow | Segment) => MdtChartsDataRow) {
        let attrs: ValueLabelAttrs = {
            x: null,
            y: null,
            dominantBaseline: valueLabels.dominantBaseline,
            textAnchor: valueLabels.textAnchor
        }
        const orient = globalOptions.canvas.keyAxisOrient

        if (orient === 'left' || orient === 'right') {
            attrs.x = d => valueLabels.handleX(scales.value(d[valueFieldName]));
            attrs.y = d => valueLabels.handleY(Scale.getScaledValue(scales.key, dataRowAccessor(d)[globalOptions.data.keyFieldName]));
        } else if (orient === 'bottom' || orient === 'top') {
            attrs.x = d => valueLabels.handleX(Scale.getScaledValue(scales.key, dataRowAccessor(d)[globalOptions.data.keyFieldName]));
            attrs.y = d => valueLabels.handleY(scales.value(d[valueFieldName]));
        }

        return attrs;
    }
}