import { ValueLabelAttrs, ValueLabelsOptions } from "../../../engine/features/valueLabels/valueLabels";
import { TwoDimChartValueLabelsOptions, ValueField } from "../../../model/model";
import { Scale, Scales } from "../../../engine/features/scale/scale";

export class ValueLabelsHelper {
    public static getValueLabelsAttrs(globalOptions: ValueLabelsOptions, valueLabels: TwoDimChartValueLabelsOptions, scales: Scales, valueField: ValueField): ValueLabelAttrs {
        let attrs: ValueLabelAttrs = {
            x: null,
            y: null,
            dominantBaseline: valueLabels.dominantBaseline,
            textAnchor: valueLabels.textAnchor
        }
        const orient = globalOptions.canvas.keyAxisOrient

            if (orient === 'left' || orient === 'right') {
                attrs.x = d => valueLabels.handleX(scales.value(d[valueField.name]));
                attrs.y = d => valueLabels.handleY(Scale.getScaledValue(scales.key, d[globalOptions.data.keyFieldName]));
            } else if (orient === 'bottom' || orient === 'top') {
                attrs.x = d => valueLabels.handleX(Scale.getScaledValue(scales.key, d[globalOptions.data.keyFieldName]));
                attrs.y = d => valueLabels.handleY(scales.value(d[valueField.name]));
            }

        return attrs;
    }
}