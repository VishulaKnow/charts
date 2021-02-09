import { Config, PolarChart, PolarOptions } from "../config/config";
import { ChartColors } from "../designer/designerConfig";
import { ChartStyleModel } from "./chartStyleModel";
import { LegendModel } from "./legendModel/legendModel";
import { BlockMargin, DataSource, PolarChartModel, PolarOptionsModel } from "./model";

export class PolarModel
{
    public static getOptions(config: Config, chartPalette: ChartColors, data: DataSource, margin: BlockMargin): PolarOptionsModel {
        const configOptions = <PolarOptions>config.options;
        return {
            type: configOptions.type,
            charts: this.getChartsModel(configOptions.charts, chartPalette, data),
            legend: LegendModel.getLegendModel(config.options.type, config.options.legend.position, config.canvas.size, margin)
        }
    }

    private static getChartsModel(charts: PolarChart[], chartPalette: ChartColors, data: DataSource): PolarChartModel[] {
        const chartsModel: PolarChartModel[] = [];
        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                title: chart.title,
                data: { ...chart.data },
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModel.getCssClasses(index),
                style: ChartStyleModel.getChartStyle(chartPalette, data[chart.data.dataSource].length)
            });
        });
        return chartsModel;
    }
}