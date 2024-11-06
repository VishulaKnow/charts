import { PolarChart, MdtChartsPolarOptions, MdtChartsDataRow } from "../../../config/config";
import { ChartStyleConfig, DesignerConfig, DonutOptionsCanvas } from "../../../designer/designerConfig";
import { ChartStyleModelService } from "../../chartStyleModel/chartStyleModel";
import { PolarOptionsModel, PolarChartModel, DonutChartSettings, LegendCoordinate } from "../../model";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { DonutModel } from "./donut/donutModel";
import { getResolvedTitle } from "../../../model/featuresModel/titleModel";

export const MIN_DONUT_BLOCK_SIZE = 120;

export class PolarModel {
    private static donutModel = new DonutModel();

    public static getOptions(options: MdtChartsPolarOptions, designerConfig: DesignerConfig, modelInstance: ModelInstance): PolarOptionsModel {
        const dataRows = modelInstance.dataModel.repository.getRawRows()
        const resolvedTitle = getResolvedTitle(options.title, dataRows)

        return {
            type: options.type,
            selectable: !!options.selectable,
            title: resolvedTitle,
            data: { ...options.data },
            charts: this.getChartsModel(options.chart, modelInstance.dataModel.repository.getScopedRows().length, designerConfig.chartStyle),
            legend: modelInstance.canvasModel.legendCanvas.getModel(),
            tooltip: options.tooltip,
            chartCanvas: this.getDonutSettings(designerConfig.canvas.chartOptions.donut, options.chart, modelInstance.dataModel.repository.getRawRows()),
            defs: { gradients: [] },
        }
    }

    //TODO: type for returned value
    public static getLegendPositionByBlockSize(canvasModel: CanvasModel): "bottom" | "right" {
        const widthCoefficientWhenLegendShouldInBottom = 1.5;
        const avgLegendWidth = 100;
        const blockWidth = canvasModel.getBlockSize().width;
        const blockHeight = canvasModel.getBlockSize().height;

        return canvasModel.getChartBlockWidth() < MIN_DONUT_BLOCK_SIZE + avgLegendWidth
            && blockWidth * widthCoefficientWhenLegendShouldInBottom < blockHeight
            ? 'bottom'
            : 'right';
    }

    public static doesChartBlockHasEnoughWidthForContainsLegend(chartBlockWidth: number, legendWidth: number, legendCoordinate: LegendCoordinate) {
        const rightLegendMargin = legendCoordinate.right.margin;
        return chartBlockWidth - legendWidth - rightLegendMargin.left - rightLegendMargin.right >= MIN_DONUT_BLOCK_SIZE;
    }

    public static doesChartBlockHasEnoughHeightForContainsLegend(chartBlockHeight: number, legendCoordinate: LegendCoordinate) {
        const minHeightForLegend = 30;
        const bottomLegendMargin = legendCoordinate.bottom.margin;
        const heightForLegend = chartBlockHeight - bottomLegendMargin.bottom - bottomLegendMargin.top - MIN_DONUT_BLOCK_SIZE;
        return heightForLegend >= minHeightForLegend;
    }

    private static getDonutSettings(settings: DonutOptionsCanvas, chartOptions: PolarChart, dataRows: MdtChartsDataRow[]): DonutChartSettings {
        return this.donutModel.getSettings(settings, chartOptions, dataRows);
    }

    private static getChartsModel(chart: PolarChart, dataLength: number, chartStyleConfig: ChartStyleConfig): PolarChartModel[] {
        const chartsModel: PolarChartModel[] = [];
        chartsModel.push({
            type: chart.type,
            data: { ...chart.data },
            tooltip: { show: true },
            cssClasses: ChartStyleModelService.getCssClasses(0),
            style: ChartStyleModelService.getChartStyle(dataLength, chartStyleConfig),
            legend: {
                markerShape: "default",
                barViewOptions: {
                    hatch: { on: false },
                    borderRadius: {
                        grouped: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
                        segmented: { handle: () => null }
                    },
                    width: 0 },
                lineViewOptions: { dashedStyles: { on: false, dashSize: 0, gapSize: 0 }, width: 0 }
            }
        });
        return chartsModel;
    }
}