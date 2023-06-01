import { LineCurveType, LineLikeChartShapeOptions } from "../../model";
import { ChartOrientation } from "../../../config/config";
import { MdtChartsLineLikeChartCurveType, MdtChartsLineLikeChartShape } from "../../../designer/designerConfig";

export function parseShape(chartOrientation: ChartOrientation, configOptions?: MdtChartsLineLikeChartShape): LineLikeChartShapeOptions {
    const curveType = configOptions?.curve?.type;
    if (!curveType) return { curve: { type: LineCurveType.none } };
    return {
        curve: {
            type: parseCurveType(chartOrientation, curveType)
        }
    }
}

function parseCurveType(chartOrientation: ChartOrientation, curveType: MdtChartsLineLikeChartCurveType) {
    if (curveType === "monotone") {
        if (chartOrientation === "horizontal") return LineCurveType.monotoneY;
        return LineCurveType.monotoneX;
    }
    return LineCurveType.none;
}