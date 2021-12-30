import { MdtChartsConfig, MdtChartsDataSource, PolarChart, PolarOptions } from "../../config/config";
import { ChartStyleConfig, DesignerConfig, DonutOptionsCanvas } from "../../designer/designerConfig";
import { ChartStyleModelService } from "../chartStyleModel/chartStyleModel";
import { LegendModel } from "../featuresModel/legendModel/legendModel";
import { BlockMargin, PolarOptionsModel, PolarChartModel, DonutChartSettings } from "../model";
import { ModelInstance } from "../modelInstance/modelInstance";


export class PolarModel {
    public static getOptions(options: PolarOptions, data: MdtChartsDataSource, designerConfig: DesignerConfig, modelInstance: ModelInstance): PolarOptionsModel {
        return {
            type: options.type,
            selectable: !!options.selectable,
            title: options.title,
            data: { ...options.data },
            charts: this.getChartsModel(options.chart, data[options.data.dataSource].length, designerConfig.chartStyle),
            legend: LegendModel.getLegendModel(options.type, options.legend.show, modelInstance.canvasModel),
            tooltip: options.tooltip,
            chartCanvas: this.getDonutSettings(designerConfig.canvas.chartOptions.donut, options.chart)
        }
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