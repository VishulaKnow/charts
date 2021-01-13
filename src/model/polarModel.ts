import { Color } from "d3";
import { PolarChart, PolarOptions } from "../config/config";
import { ChartStyleModel } from "./chartStyleModel";
import { DataManagerModel } from "./dataManagerModel";
import { DataScope, DataSource, PolarChartModel, PolarOptionsModel } from "./model";

export class PolarModel
{
    static getPolarChartsModel(charts: PolarChart[], chartPalette: Color[], data: DataSource, dataScope: DataScope): PolarChartModel[] {
        const chartsModel: PolarChartModel[] = [];
        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                data: {
                    dataSource: chart.data.dataSource,
                    keyField: chart.data.keyField,
                    valueField: chart.data.valueField
                },
                appearanceOptions: {
                    innerRadius: chart.appearanceOptions.innerRadius,
                    padAngle: chart.appearanceOptions.padAngle
                },
                legend: chart.legend,
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModel.getCssClasses(chart.type, index),
                elementColors: ChartStyleModel.getElementColorPallete(chartPalette, 'polar', DataManagerModel.getDataLength(data, chart.data.dataSource, dataScope.hidedRecordsAmount))
            });
        });
        return chartsModel;
    }

    static getPolarOptions(configOptions: PolarOptions, chartPalette: Color[], data: DataSource, dataScope: DataScope): PolarOptionsModel {
        return {
            type: configOptions.type,
            charts: this.getPolarChartsModel(configOptions.charts, chartPalette, data, dataScope),
        }
    }
}