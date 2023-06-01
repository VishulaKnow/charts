import { LineCurveType, LineLikeChartDashOptions, LineLikeChartShapeOptions } from "../../model";
import { ChartOrientation, MdtChartsLineLikeChartDashedStyles } from "../../../config/config";
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

export function parseDashStyles(configOptions?: MdtChartsLineLikeChartDashedStyles): LineLikeChartDashOptions {
    const DEFAULT_DASH_SIZE_PX = 10;
    const DEFAULT_GAP_SIZE_PX = 3;

    return {
        on: configOptions?.on ?? false,
        dashSize: configOptions?.dashSize ?? DEFAULT_DASH_SIZE_PX,
        gapSize: configOptions?.gapSize ?? DEFAULT_GAP_SIZE_PX
    }
}