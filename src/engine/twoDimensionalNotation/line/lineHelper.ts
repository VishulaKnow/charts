import { line, Line as ILine } from 'd3-shape';
import { MdtChartsDataRow } from '../../../config/config';
import { Orient, BlockMargin, LineCurveType } from "../../../model/model";
import { Scales, Scale } from "../../features/scale/scale";
import { LineGenerator } from './lineGenerator';

interface LineGeneratorFactoryOptions {
    keyAxisOrient: Orient;
    scales: Scales;
    keyFieldName: string;
    margin: BlockMargin;
    curve: LineCurveType;
}

export class LineGeneratorFactory {
    constructor(private options: LineGeneratorFactoryOptions) { }

    public getLineGenerator(valueFieldName: string): ILine<MdtChartsDataRow> {
        const { keyAxisOrient, scales, keyFieldName, margin } = this.options;

        const generator = new LineGenerator({ curve: this.options.curve });

        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return generator.get(
                d => Scale.getScaledValue(scales.key, d[keyFieldName]) + margin.left,
                d => scales.value(d[valueFieldName]) + margin.top
            );
        }

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return generator.get(
                d => scales.value(d[valueFieldName]) + margin.left,
                d => Scale.getScaledValue(scales.key, d[keyFieldName]) + margin.top
            );
        }
    }

    public getSegmentedLineGenerator(): ILine<MdtChartsDataRow> {
        const { keyAxisOrient, scales, keyFieldName, margin } = this.options;

        const generator = new LineGenerator({ curve: this.options.curve });

        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return generator.get(
                d => Scale.getScaledValue(scales.key, d.data[keyFieldName]) + margin.left,
                d => scales.value(d[1]) + margin.top
            );
        }

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return generator.get(
                d => scales.value(d[1]) + margin.left,
                d => Scale.getScaledValue(scales.key, d.data[keyFieldName]) + margin.top
            );
        }
    }
}