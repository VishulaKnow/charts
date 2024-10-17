import { area, Area as IArea } from 'd3-shape';
import { MdtChartsDataRow } from '../../../config/config';
import { Scale } from "../../features/scale/scale";
import { LineLikeGeneratorFactoryOptions } from '../lineLike/generatorFactory/lineLikeGeneratorFactory';
import { LineLikeGeneratorDefinedMiddleware } from '../lineLike/generatorMiddleware/lineLikeGeneratorDefineMiddleware';
import { AreaGenerator } from './areaGenerator';
import { LineLikeGeneratorCurveMiddleware } from '../lineLike/generatorMiddleware/lineLikeGeneratorCurveMiddleware';

export class AreaGeneratorFactory {
    constructor(private readonly options: LineLikeGeneratorFactoryOptions) { }

    public getAreaGenerator(valueFieldName: string): IArea<MdtChartsDataRow> {
        const { keyAxisOrient, scales, keyFieldName, margin, shouldRender } = this.options;

        const generator = new AreaGenerator({
            middlewares: [
                new LineLikeGeneratorCurveMiddleware({ curve: this.options.curve }),
                new LineLikeGeneratorDefinedMiddleware({ definedFn: shouldRender, valueFieldNameGetter: () => valueFieldName, dataRowGetter: (d) => d })
            ]
        });

        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return generator.getVertical(
                d => Scale.getScaledValue(scales.key, d[keyFieldName]) + margin.left,
                d => scales.value(0) + margin.top,
                d => scales.value(d[valueFieldName]) + margin.top
            );
        }
        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return generator.getHorizontal(
                d => scales.value(0) + margin.left,
                d => scales.value(d[valueFieldName]) + margin.left,
                d => Scale.getScaledValue(scales.key, d[keyFieldName]) + margin.top
            );
        }
    }

    public getSegmentedAreaGenerator(): IArea<MdtChartsDataRow> {
        const { keyAxisOrient, scales, margin, keyFieldName, shouldRender } = this.options;

        const generator = new AreaGenerator({
            middlewares: [
                new LineLikeGeneratorCurveMiddleware({ curve: this.options.curve }),
                new LineLikeGeneratorDefinedMiddleware({ definedFn: shouldRender, valueFieldNameGetter: (d) => d.fieldName, dataRowGetter: (d) => d.data })
            ]
        });

        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return generator.getVertical(
                d => Scale.getScaledValue(scales.key, d.data[keyFieldName]) + margin.left,
                d => scales.value(d[0]) + margin.top,
                d => scales.value(d[1]) + margin.top
            );
        }

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return generator.getHorizontal(
                d => scales.value(d[0]) + margin.left,
                d => scales.value(d[1]) + margin.left,
                d => Scale.getScaledValue(scales.key, d.data[keyFieldName]) + margin.top
            );
        }
    }
}