import { ValueLabelAttrs, ValueLabelsOptions } from "../../../engine/features/valueLabels/valueLabels";
import { TwoDimensionalChartModel } from "../../../model/model";
import { Scale, Scales } from "../../../engine/features/scale/scale";

export class ValueLabelsHelper {
    public static getValueLabelsAttrs(globalOptions: ValueLabelsOptions, chart: TwoDimensionalChartModel, scales: Scales): ValueLabelAttrs {
        let attrs: ValueLabelAttrs = {
            x: null,
            y: null,
            dominantBaseline: chart.valueLabels.dominantBaseline,
            textAnchor: chart.valueLabels.textAnchor
        }
        const orient = globalOptions.canvas.keyAxisOrient

        chart.data.valueFields.forEach(valueField => {
            if (orient === 'left' || orient === 'right') {
                attrs.x = d => chart.valueLabels.handleX(scales.value(d[valueField.name]));
                attrs.y = d => chart.valueLabels.handleY(Scale.getScaledValue(scales.key, d[globalOptions.data.keyFieldName]));
            } else if (orient === 'bottom' || orient === 'top') {
                attrs.x = d => chart.valueLabels.handleX(Scale.getScaledValue(scales.key, d[globalOptions.data.keyFieldName]));
                attrs.y = d => chart.valueLabels.handleY(scales.value(d[valueField.name]));
            }
        });

        return attrs;
    }
}