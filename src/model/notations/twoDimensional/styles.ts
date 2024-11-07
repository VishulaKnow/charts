import { AreaChartViewOptions, AreaViewBorderLine, AreaViewFill, ChartLegendModel, ChartStyle, GradientId, LegendMarkerShape, LineCurveType, LineLikeChartDashOptions, LineLikeChartShapeOptions, TwoDimensionalBarLikeChartViewModel } from "../../model";
import { ChartOrientation, MdtChartsBarLikeChartStyles, MdtChartsLineLikeChartDashedStyles, MdtChartsTwoDimensionalChart, TwoDimensionalChartType } from "../../../config/config";
import { MdtChartsLineLikeChartCurveType, MdtChartsLineLikeChartShape } from "../../../designer/designerConfig";
import { styledElementValues } from "../../modelBuilder";

export const LINE_CHART_DEFAULT_WIDTH = 2;

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

export function getBarViewOptions(barStyles: MdtChartsBarLikeChartStyles): TwoDimensionalBarLikeChartViewModel {
    const hatch = { on: barStyles?.hatch?.on ?? false };

    const borderRadius = {
        grouped: getRadiusValues(barStyles?.borderRadius?.value ?? 2)
    };

    return { hatch, borderRadius };
}

function getRadiusValues(value: number) {
    return {
        topLeft: value,
        topRight: value,
        bottomLeft: value,
        bottomRight: value
    }
}

export function getLegendMarkerOptions(chart: MdtChartsTwoDimensionalChart, barViewOptions: TwoDimensionalBarLikeChartViewModel): ChartLegendModel {
    const shapeByType: Record<TwoDimensionalChartType, LegendMarkerShape> = {
        area: "default",
        bar: "bar",
        line: "line",
        dot: "default"
    }
    return {
        markerShape: shapeByType[chart.type],
        barViewOptions: { ...barViewOptions, width: getWidthOfLegendMarkerByType("bar") },
        lineViewOptions: {
            dashedStyles: parseDashStyles(chart.lineStyles?.dash),
            strokeWidth: chart.lineStyles?.width ?? LINE_CHART_DEFAULT_WIDTH,
            length: getWidthOfLegendMarkerByType("line")
        }
    }
}

export function getWidthOfLegendMarkerByType(chartType: TwoDimensionalChartType): number {
    if (chartType === "bar") return 8;
    if (chartType === "line") return 24;
    if (chartType === "area") return styledElementValues.defaultLegendMarkerSizes.widthPx
}

export function getAreaViewOptions(chart: MdtChartsTwoDimensionalChart, chartIndex: number, style: ChartStyle): AreaChartViewOptions {
    let gradientIds: GradientId[] = [];
    for (let index = 0; index < style.elementColors.length; index++) {
        gradientIds.push(getGradientId(chartIndex, index));
    }

    const fill: AreaViewFill = chart.areaStyles?.gradient?.on
        ? { type: "gradient", ids: gradientIds }
        : { type: "paletteColor" };

    const borderLine: AreaViewBorderLine = {
        on: chart.areaStyles?.borderLine?.on ?? false,
        colorStyle: {
            elementColors: style.elementColors,
            opacity: 1
        }
    }

    return { fill, borderLine };
}

export function getGradientId(chartIndex: number, subIndex: number): GradientId {
    return `gradient-chart-${chartIndex}-sub-${subIndex}`;
}
