import { MdtChartsDataRow } from "../../../../config/config";
import { BlockMargin, LineCurveType, LineLikeChartRenderFn, Orient } from "../../../../model/model";
import { Scales } from "../../../features/scale/scale";

export type CoordinateGetter = (dataRow: MdtChartsDataRow) => number;

export interface LineLikeGeneratorFactoryOptions {
    keyAxisOrient: Orient;
    scales: Scales;
    keyFieldName: string;
    margin: BlockMargin;
    curve: LineCurveType;
    shouldRender: LineLikeChartRenderFn;
}