import { Color } from "d3";
import { PolarChart, PolarOptions } from "../config/config";
import { ChartStyleModel } from "./chartStyleModel";
import { DataManagerModel } from "./dataManagerModel";
import { DataScope, DataSource, PolarChartModel, PolarOptionsModel } from "./model";

export class PolarModel
{
    public static getChartsModel(charts: PolarChart[], chartPalette: Color[], data: DataSource, dataScope: DataScope): PolarChartModel[] {
        const chartsModel: PolarChartModel[] = [];
        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                data: { ...chart.data },
                appearanceOptions: { ...chart.appearanceOptions },
                legend: chart.legend,
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModel.getCssClasses(chart.type, index),
                elementColors: ChartStyleModel.getElementColorPallete(chartPalette, 'polar', DataManagerModel.getScopedDataLength(data, chart.data.dataSource, dataScope.hidedRecordsAmount))
            });
        });
        return chartsModel;
    }

    public static getOptions(configOptions: PolarOptions, chartPalette: Color[], data: DataSource, dataScope: DataScope): PolarOptionsModel {
        return {
            type: configOptions.type,
            charts: this.getChartsModel(configOptions.charts, chartPalette, data, dataScope),
        }
    }
}