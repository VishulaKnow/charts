import { Config, PolarChart, PolarOptions } from "../config/config";
import { ChartStyleConfig } from "../designer/designerConfig";
import designerConfig from "../designer/designerConfigExample";
import { ChartStyleModel } from "./chartStyleModel";
import { LegendModel } from "./legendModel/legendModel";
import { BlockMargin, DataSource, PolarChartModel, PolarOptionsModel } from "./model";

export class PolarModel
{
    public static getOptions(config: Config, data: DataSource, margin: BlockMargin): PolarOptionsModel {
        const configOptions = <PolarOptions>config.options;
        return {
            type: configOptions.type,
            data: { ...configOptions.data },
            charts: this.getChartsModel(configOptions.charts, data[configOptions.data.dataSource].length, designerConfig.chartStyle),
            legend: LegendModel.getLegendModel(config.options.type, config.options.legend.show, config.canvas.size, margin)
        }
    }

    private static getChartsModel(charts: PolarChart[], dataLength: number, chartStyleConfig: ChartStyleConfig): PolarChartModel[] {
        const chartsModel: PolarChartModel[] = [];
        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                title: chart.title,
                data: { ...chart.data },
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModel.getCssClasses(index),
                style: ChartStyleModel.getChartStyle(dataLength, chartStyleConfig)
            });
        });
        return chartsModel;
    }
}