import { Color } from "d3";
import { Config, PolarChart, PolarOptions } from "../config/config";
import { Legend } from "../engine/features/legend/legend";
import { ChartStyleModel } from "./chartStyleModel";
import { LegendModel } from "./legendModel/legendModel";
import { DataScope, DataSource, PolarChartModel, PolarOptionsModel } from "./model";

export class PolarModel
{
    public static getOptions(config: Config, chartPalette: Color[], data: DataSource, dataScope: DataScope): PolarOptionsModel {
        const configOptions = <PolarOptions>config.options;
        return {
            type: configOptions.type,
            charts: this.getChartsModel(configOptions.charts, chartPalette, data, dataScope),
            legend: LegendModel.getLegendModel(config.options.type, config.options.legend.position, config.canvas.size)
        }
    }

    private static getChartsModel(charts: PolarChart[], chartPalette: Color[], data: DataSource, dataScope: DataScope): PolarChartModel[] {
        const chartsModel: PolarChartModel[] = [];
        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                title: chart.title,
                data: { ...chart.data },
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModel.getCssClasses(chart.type, index),
                elementColors: ChartStyleModel.getElementColorPalette(chartPalette, 'polar', data[chart.data.dataSource].length)
            });
        });
        return chartsModel;
    }
}