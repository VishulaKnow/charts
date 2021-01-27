import { Color } from "d3";
import { PolarChart, PolarOptions } from "../config/config";
import { ChartStyleModel } from "./chartStyleModel";
import { DataScope, DataSource, PolarChartModel, PolarOptionsModel } from "./model";

export class PolarModel
{
    public static getChartsModel(charts: PolarChart[], chartPalette: Color[], data: DataSource, dataScope: DataScope): PolarChartModel[] {
        const chartsModel: PolarChartModel[] = [];
        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                title: chart.title,
                data: { ...chart.data },
                appearanceOptions: { ...chart.appearanceOptions },
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModel.getCssClasses(chart.type, index),
                elementColors: ChartStyleModel.getElementColorPallete(chartPalette, 'polar', data[chart.data.dataSource].length)
            });
        });
        return chartsModel;
    }

    public static getOptions(configOptions: PolarOptions, chartPalette: Color[], data: DataSource, dataScope: DataScope): PolarOptionsModel {
        return {
            type: configOptions.type,
            charts: this.getChartsModel(configOptions.charts, chartPalette, data, dataScope),
            legend: configOptions.legend
        }
    }
}