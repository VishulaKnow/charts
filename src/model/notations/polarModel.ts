import { MdtChartsConfig, MdtChartsDataSource, PolarChart, PolarOptions } from "../../config/config";
import { ChartStyleConfig, DesignerConfig } from "../../designer/designerConfig";
import { ChartStyleModel } from "../chartStyleModel";
import { LegendModel } from "../featuresModel/legendModel/legendModel";
import { BlockMargin, PolarOptionsModel, PolarChartModel } from "../model";


export class PolarModel {
    public static getOptions(config: MdtChartsConfig, data: MdtChartsDataSource, margin: BlockMargin, designerConfig: DesignerConfig): PolarOptionsModel {
        const options = <PolarOptions>config.options;
        return {
            type: options.type,
            selectable: !!options.selectable,
            title: options.title,
            data: { ...options.data },
            charts: this.getChartsModel(options.chart, data[options.data.dataSource].length, designerConfig.chartStyle),
            legend: LegendModel.getLegendModel(config.options.type, config.options.legend.show, config.canvas.size, margin),
            tooltip: options.tooltip
        }
    }

    private static getChartsModel(chart: PolarChart, dataLength: number, chartStyleConfig: ChartStyleConfig): PolarChartModel[] {
        const chartsModel: PolarChartModel[] = [];
        chartsModel.push({
            type: chart.type,
            data: { ...chart.data },
            tooltip: chart.tooltip,
            cssClasses: ChartStyleModel.getCssClasses(0),
            style: ChartStyleModel.getChartStyle(dataLength, chartStyleConfig)
        });
        return chartsModel;
    }
}