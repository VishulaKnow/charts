import { Line as ILine, stack } from 'd3-shape';
import { MdtChartsDataRow } from '../../../config/config';
import { Orient, BlockMargin, LineCurveType, TwoDimensionalChartModel, LineLikeChartRenderFn } from "../../../model/model";
import { Scales, Scale } from "../../features/scale/scale";
import { LineGenerator } from './lineGenerator';
import { Pipeline } from '../../helpers/pipeline/Pipeline';
import { BaseType, Selection } from 'd3-selection';
import { LineLikeGeneratorCurveMiddleware } from '../lineLike/generatorMiddleware/lineLikeGeneratorCurveMiddleware';
import { LineLikeGeneratorDefinedMiddleware, Segment } from '../lineLike/generatorMiddleware/lineLikeGeneratorDefineMiddleware';

interface LineGeneratorFactoryOptions {
    keyAxisOrient: Orient;
    scales: Scales;
    keyFieldName: string;
    margin: BlockMargin;
    curve: LineCurveType;
    shouldRenderLine: LineLikeChartRenderFn;
}

export class LineGeneratorFactory {
    constructor(private options: LineGeneratorFactoryOptions) { }

    public getLineGenerator(valueFieldName: string): ILine<MdtChartsDataRow> {
        const { keyAxisOrient, scales, keyFieldName, margin, shouldRenderLine } = this.options;

        const generator = new LineGenerator({
            middlewares: [
                new LineLikeGeneratorCurveMiddleware({ curve: this.options.curve }),
                new LineLikeGeneratorDefinedMiddleware({ definedFn: shouldRenderLine, valueFieldNameGetter: () => valueFieldName, dataRowGetter: (d) => d })
            ]
        });

        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return generator.get(
                d => Scale.getScaledValue(scales.key, d[keyFieldName]) + margin.left,
                d => scales.value(d[valueFieldName]) + margin.top
            ).defined(d => shouldRenderLine(d, valueFieldName));
        }

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return generator.get(
                d => scales.value(d[valueFieldName]) + margin.left,
                d => Scale.getScaledValue(scales.key, d[keyFieldName]) + margin.top
            ).defined(d => shouldRenderLine(d, valueFieldName));
        }
    }

    public getSegmentedLineGenerator(): ILine<MdtChartsDataRow> {
        const { keyAxisOrient, scales, keyFieldName, margin, shouldRenderLine } = this.options;

        const generator = new LineGenerator({
            middlewares: [
                new LineLikeGeneratorCurveMiddleware({ curve: this.options.curve }),
                new LineLikeGeneratorDefinedMiddleware({ definedFn: shouldRenderLine, valueFieldNameGetter: (d) => d.fieldName, dataRowGetter: (d) => d.data })
            ]
        });

        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return generator.get(
                d => Scale.getScaledValue(scales.key, d.data[keyFieldName]) + margin.left,
                d => scales.value(d[1]) + margin.top
            ).defined(d => shouldRenderLine(d.data, d.fieldName));
        }

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return generator.get(
                d => scales.value(d[1]) + margin.left,
                d => Scale.getScaledValue(scales.key, d.data[keyFieldName]) + margin.top
            ).defined(d => shouldRenderLine(d.data, d.fieldName));
        }
    }
}

export function onLineChartInit(creatingPipeline: Pipeline<Selection<SVGElement, any, BaseType, any>, TwoDimensionalChartModel>) {
    creatingPipeline.push((path, chart) => {
        if (chart.lineViewOptions.dashedStyles.on) {
            return applyLineDash(path, chart.lineViewOptions.dashedStyles.dashSize, chart.lineViewOptions.dashedStyles.gapSize);
        }
        return path;
    });
}

export function applyLineDash(lineSelection: Selection<SVGElement, any, BaseType, any>, dashSize: number, gapSize: number) {
    return lineSelection.style('stroke-dasharray', `${dashSize} ${gapSize}`);
}

export function getStackedData(data: MdtChartsDataRow[], chart: TwoDimensionalChartModel): Segment[][] {
    let stackedData = stack().keys(chart.data.valueFields.map(field => field.name))(data)
        .map((layer, index) => {
            const fieldName = chart.data.valueFields[index].name;
            return layer.map((segment: Segment) => {
                segment.fieldName = fieldName;
                return segment
            });
        });
    return stackedData
}