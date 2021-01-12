import { Color } from "d3";
import { PolarChart } from "../../config/config";
import { ChartStyleModel } from "../chartStyleModel/chartStyleModel";
import { PolarChartModel } from "../model";

export class PolarModel
{
    static getPolarChartsModel(charts: PolarChart[], chartPalette: Color[]): PolarChartModel[] {
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
                elementColors: ChartStyleModel.getElementColorPallete(chartPalette, 'polar')
            });
        });
        return chartsModel;
    }
}