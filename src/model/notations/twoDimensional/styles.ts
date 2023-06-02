import { ChartLegendModel, LegendMarkerShape, LineCurveType, LineLikeChartDashOptions, LineLikeChartShapeOptions } from "../../model";
import { ChartOrientation, MdtChartsLineLikeChartDashedStyles, MdtChartsTwoDimensionalChart, TwoDimensionalChartType } from "../../../config/config";
import { MdtChartsLineLikeChartCurveType, MdtChartsLineLikeChartShape } from "../../../designer/designerConfig";

export function parseShape(chartOrientation: ChartOrientation, configOptions?: MdtChartsLineLikeChartShape): LineLikeChartShapeOptions {
    const curveType = configOptions?.curve?.type;
    return {
        curve: {
            type: parseCurveType(chartOrientation, curveType)
        }
    }
}

function parseCurveType(chartOrientation: ChartOrientation, curveType?: MdtChartsLineLikeChartCurveType) {
    if (curveType === "monotone" || curveType == null) {
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

export function getLegendMarkerOptions(chart: MdtChartsTwoDimensionalChart): ChartLegendModel {
    const shapeByType: Record<TwoDimensionalChartType, LegendMarkerShape> = {
        area: "default",
        bar: "bar",
        line: "line"
    }
    return {
        markerShape: shapeByType[chart.type],
        barViewOptions: { hatch: { on: chart.barStyles?.hatch?.on ?? false }, width: 10 },
        lineViewOptions: { dashedStyles: parseDashStyles(chart.lineStyles?.dash), width: 30 }
    }
}