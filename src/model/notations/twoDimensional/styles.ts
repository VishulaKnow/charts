import { AreaChartViewOptions, AreaViewBorderLine, AreaViewFill, BarBorderRadius, BarLikeChartBorderRadius, ChartLegendModel, ChartStyle, GradientId, LegendMarkerShape, LineCurveType, LineLikeChartDashOptions, LineLikeChartShapeOptions, Orient, TwoDimensionalBarLikeChartViewModel, TwoDimensionalChartLegendLineModel } from "../../model";
import { ChartOrientation, MdtChartsLineLikeChartDashedStyles, MdtChartsTwoDimensionalChart, TwoDimensionalChartType } from "../../../config/config";
import { MdtChartsLineLikeChartCurveType, MdtChartsLineLikeChartShape } from "../../../designer/designerConfig";
import { styledElementValues } from "../../modelBuilder";

const BAR_CHART_BORDER_RADIUS_DEFAULT = 2;
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

export function getBarViewOptions(chart: MdtChartsTwoDimensionalChart, keyAxisOrient: Orient, barIndexes: number[]): TwoDimensionalBarLikeChartViewModel {
    const hatch = { on: chart.barStyles?.hatch?.on ?? false };
    const defaultRadius = chart.barStyles?.borderRadius?.value ?? BAR_CHART_BORDER_RADIUS_DEFAULT;

    const borderRadius: BarLikeChartBorderRadius = {
        grouped: getRadiusValues(defaultRadius),
        segmented: {
            handle: (valueIndex: number) => getSegmentedRadiusValues(chart.data.valueFields.length, valueIndex, keyAxisOrient, defaultRadius),
        }
    };

    return { hatch, borderRadius, barIndexes };
}

export function calculateBarIndexes(
    allCharts: Pick<MdtChartsTwoDimensionalChart, "isSegmented" | "data" | "type">[],
    currentChart: Pick<MdtChartsTwoDimensionalChart, "isSegmented" | "data" | "type">,
    currentChartIndex: number): number[] {
    const prevBarCharts = allCharts.slice(0, currentChartIndex).filter(ch => ch.type === "bar");
    const startBarIndex = prevBarCharts.reduce((acc, ch) => acc + (ch.isSegmented ? 1 : ch.data.valueFields.length), 0);
    if (currentChart.isSegmented) return [startBarIndex];
    return currentChart.data.valueFields.map((_, index) => startBarIndex + index);
}

function getRadiusValues(defaultRadius: number): BarBorderRadius {
    return {
        topLeft: defaultRadius,
        topRight: defaultRadius,
        bottomLeft: defaultRadius,
        bottomRight: defaultRadius
    }
}

export function getSegmentedRadiusValues(segmentsLength: number, segmentIndex: number, keyAxisOrient: Orient, defaultRadius: number): BarBorderRadius {
    const radiusConfigs = {
        first: {
            top: { topLeft: defaultRadius, topRight: defaultRadius, bottomLeft: 0, bottomRight: 0 },
            bottom: { topLeft: 0, topRight: 0, bottomLeft: defaultRadius, bottomRight: defaultRadius },
            left: { topLeft: defaultRadius, topRight: 0, bottomLeft: defaultRadius, bottomRight: 0 },
            right: { topLeft: 0, topRight: defaultRadius, bottomLeft: 0, bottomRight: defaultRadius },
        },
        last: {
            top: { topLeft: 0, topRight: 0, bottomLeft: defaultRadius, bottomRight: defaultRadius },
            bottom: { topLeft: defaultRadius, topRight: defaultRadius, bottomLeft: 0, bottomRight: 0 },
            left: { topLeft: 0, topRight: defaultRadius, bottomLeft: 0, bottomRight: defaultRadius },
            right: { topLeft: defaultRadius, topRight: 0, bottomLeft: defaultRadius, bottomRight: 0 },
        },
        middle: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
        default: getRadiusValues(defaultRadius)
    };

    if (segmentsLength === 1)
        return radiusConfigs.default;
    else if (segmentIndex === 0)
        return radiusConfigs.first[keyAxisOrient];
    else if (segmentIndex === segmentsLength - 1)
        return radiusConfigs.last[keyAxisOrient];
    else
        return radiusConfigs.middle;

}

export function getLegendMarkerOptions(chart: MdtChartsTwoDimensionalChart): ChartLegendModel {
    const shapeByType: Record<TwoDimensionalChartType, LegendMarkerShape> = {
        area: "line",
        bar: "bar",
        line: "line",
        dot: chart.dotLikeStyles?.shape?.type ?? "line"
    }

    return {
        markerShape: shapeByType[chart.type],
        barViewOptions: {
            hatch: { on: chart.barStyles?.hatch?.on ?? false },
            borderRadius: getRadiusValues(chart.barStyles?.borderRadius?.value ?? BAR_CHART_BORDER_RADIUS_DEFAULT),
            width: getWidthOfLegendMarkerByType("bar")
        },
        lineViewOptions: getLineViewOptions(chart)
    }
}

export function getLineViewOptions(chart: MdtChartsTwoDimensionalChart): TwoDimensionalChartLegendLineModel {
    switch (chart.type) {
        case "dot":
            return {
                dashedStyles: { on: false, dashSize: 0, gapSize: 0 },
                strokeWidth: chart.dotLikeStyles?.shape?.width ?? LINE_CHART_DEFAULT_WIDTH,
                length: getWidthOfLegendMarkerByType("line")
            }
        case "area":
            return {
                dashedStyles: { on: false, dashSize: 0, gapSize: 0 },
                strokeWidth: LINE_CHART_DEFAULT_WIDTH,
                length: getWidthOfLegendMarkerByType("line")
            }
        default:
            return {
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

export function getAreaViewOptions(chart: MdtChartsTwoDimensionalChart, chartIndex: number, style: ChartStyle, chartBlockId: number): AreaChartViewOptions {
    let gradientIds: GradientId[] = [];
    for (let index = 0; index < style.elementColors.length; index++) {
        gradientIds.push(getGradientId(chartIndex, index, chartBlockId));
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

export function getGradientId(chartIndex: number, subIndex: number, chartBlockId: number): GradientId {
    return `chart-${chartBlockId}-gradient-chart-${chartIndex}-sub-${subIndex}`;
}
