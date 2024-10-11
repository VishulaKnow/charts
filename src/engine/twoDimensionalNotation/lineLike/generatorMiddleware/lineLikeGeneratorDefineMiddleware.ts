import { Area, Line, SeriesPoint } from "d3-shape";
import { LineLikeGeneratorMiddleware } from "./lineLikeGeneratorMiddleware";
import { MdtChartsDataRow } from "../../../../config/config";
import { LineLikeChartRenderFn } from "../../../../model/model";
import { SegmentWithFieldName } from "../../bar/stackedData/dataStacker";

interface LineLikeGeneratorDefinedMiddlewareOptions {
    definedFn: LineLikeChartRenderFn;
    valueFieldNameGetter: (d: MdtChartsDataRow | Segment) => string;
    dataRowGetter: (d: MdtChartsDataRow | Segment) => MdtChartsDataRow;
}

export interface Segment extends SeriesPoint<{ [p: string]: number }>, SegmentWithFieldName { }

export class LineLikeGeneratorDefinedMiddleware implements LineLikeGeneratorMiddleware {
    constructor(private readonly options: LineLikeGeneratorDefinedMiddlewareOptions) { }

    handle(generator: Line<MdtChartsDataRow> | Area<MdtChartsDataRow>): Line<MdtChartsDataRow> | Area<MdtChartsDataRow> {
        generator.defined(d => this.options.definedFn(this.options.dataRowGetter(d), this.options.valueFieldNameGetter(d)));
        return generator;
    }
}