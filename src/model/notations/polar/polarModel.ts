import { MdtChartsDataSource, PolarChart, MdtChartsPolarOptions, MdtChartsDataRow } from "../../../config/config";
import { ChartStyleConfig, DesignerConfig, DonutOptionsCanvas } from "../../../designer/designerConfig";
import { ChartStyleModelService } from "../../chartStyleModel/chartStyleModel";
import { PolarOptionsModel, PolarChartModel, DonutChartSettings, LegendCoordinate } from "../../model";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { DonutModel } from "./donut/donutModel";

/** If donut block has width less than this const, legend change postion from "right" to "bottom" */
export const MIN_DONUT_BLOCK_SIZE = 120;

export class PolarModel {
    private static donutModel = new DonutModel();

    public static getOptions(options: MdtChartsPolarOptions, data: MdtChartsDataSource, designerConfig: DesignerConfig, modelInstance: ModelInstance): PolarOptionsModel {
        const dataRows = data[options.data.dataSource];

        return {
            type: options.type,
            selectable: !!options.selectable,
            title: options.title,
            data: { ...options.data },
            charts: this.getChartsModel(options.chart, dataRows.length, designerConfig.chartStyle),
            legend: modelInstance.canvasModel.legendCanvas.getModel(),
            tooltip: options.tooltip,
            chartCanvas: this.getDonutSettings(designerConfig.canvas.chartOptions.donut, options.chart, dataRows)
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
            tooltip: chart.tooltip,
            cssClasses: ChartStyleModelService.getCssClasses(0),
            style: ChartStyleModelService.getChartStyle(dataLength, chartStyleConfig)
        });
        return chartsModel;
    }
}