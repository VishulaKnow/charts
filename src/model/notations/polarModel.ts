import { MdtChartsConfig, MdtChartsDataSource, PolarChart, MdtChartsPolarOptions } from "../../config/config";
import { ChartStyleConfig, DesignerConfig, DonutOptionsCanvas } from "../../designer/designerConfig";
import { ChartStyleModelService } from "../chartStyleModel/chartStyleModel";
import { LegendModel } from "../featuresModel/legendModel/legendModel";
import { BlockMargin, PolarOptionsModel, PolarChartModel, DonutChartSettings, LegendPosition } from "../model";
import { CanvasModel } from "../modelInstance/canvasModel/canvasModel";
import { ModelInstance } from "../modelInstance/modelInstance";

/** If donut block has width less than this const, legend change postion from "right" to "bottom" */
export const MIN_DONUT_BLOCK_SIZE = 260;

export class PolarModel {
    public static getOptions(options: MdtChartsPolarOptions, data: MdtChartsDataSource, designerConfig: DesignerConfig, modelInstance: ModelInstance): PolarOptionsModel {
        return {
            type: options.type,
            selectable: !!options.selectable,
            title: options.title,
            data: { ...options.data },
            charts: this.getChartsModel(options.chart, data[options.data.dataSource].length, designerConfig.chartStyle),
            legend: modelInstance.canvasModel.legendCanvas.getModel(),
            tooltip: options.tooltip,
            chartCanvas: this.getDonutSettings(designerConfig.canvas.chartOptions.donut, options.chart)
        }
    }

    //TODO: type for returned value
    public static getLegendPositionByBlockSize(canvasModel: CanvasModel): "bottom" | "right" {
        return canvasModel.getChartBlockWidth() < MIN_DONUT_BLOCK_SIZE ? 'bottom' : 'right';
    }

    private static getDonutSettings(settings: DonutOptionsCanvas, chartOptions: PolarChart): DonutChartSettings {
        return {
            padAngle: settings.padAngle,
            thickness: { ...settings.thickness },
            aggregator: {
                margin: settings.aggregatorPad,
                text: chartOptions.aggregator.text
            }
        }
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