import { Color } from "d3";
import { Config, IntervalChart, IntervalOptions } from "../config/config";
import { DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { ChartStyleModel } from "./chartStyleModel";
import { GridLineModel } from "./gridLineModel";
import { AdditionalElementsOptions, BlockMargin, DataScope, DataSource, IntervalChartModel, IntervalOptionsModel } from "./model";
import { AxisType } from "./modelOptions";
import { ScaleModel, ScaleType } from "./scaleModel";

export class IntervalModel {
    public static getOptions(config: Config, designerConfig: DesignerConfig, margin: BlockMargin, dataScope: DataScope, data: DataSource): IntervalOptionsModel {
        const configOptions = <IntervalOptions>config.options
        return {
            legend: configOptions.legend,
            orient: configOptions.orientation,
            scale: {
                scaleKey: {
                    domain: ScaleModel.getScaleKeyDomain(dataScope.allowableKeys),
                    range: {
                        start: 0,
                        end: ScaleModel.getScaleRangePeek(ScaleType.Key, configOptions.orientation, margin, config.canvas.size)
                    },
                    type: ScaleModel.getScaleKeyType(configOptions.charts)
                },
                scaleValue: {
                    domain: ScaleModel.getScaleDateValueDomain(data, configOptions.charts, configOptions.axis.keyAxis.position, dataScope.allowableKeys),
                    range: {
                        start: 0,
                        end: ScaleModel.getScaleRangePeek(ScaleType.Value, configOptions.orientation, margin, config.canvas.size)
                    },
                    type: ScaleModel.getScaleValueType(configOptions.charts)
                }
            },
            axis: {
                keyAxis: {
                    type:  'key',
                    orient: AxisModel.getAxisOrient(AxisType.Key, configOptions.orientation, configOptions.axis.keyAxis.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Key, configOptions.orientation, configOptions.axis.keyAxis.position, margin, config.canvas.size.width),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Key, configOptions.orientation, configOptions.axis.keyAxis.position, margin, config.canvas.size.height)
                    },
                    cssClass: 'key-axis',
                    maxLabelSize: designerConfig.canvas.axisLabel.maxSize.main,
                    ticks: configOptions.axis.keyAxis.ticks
                },
                valueAxis: {
                    type: 'value',
                    orient: AxisModel.getAxisOrient(AxisType.Value, configOptions.orientation, configOptions.axis.valueAxis.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Value, configOptions.orientation, configOptions.axis.valueAxis.position, margin, config.canvas.size.width),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Value, configOptions.orientation, configOptions.axis.valueAxis.position, margin, config.canvas.size.height)
                    },          
                    cssClass: 'value-axis',
                    maxLabelSize: designerConfig.canvas.axisLabel.maxSize.main,
                    ticks: configOptions.axis.valueAxis.ticks
                }
            },
            type: configOptions.type,
            charts: this.getChartsModel(configOptions.charts, designerConfig.chart.style.palette),
            additionalElements: this.getAdditionalElements(configOptions, designerConfig)
        }
    }

    public static getAdditionalElements(options: IntervalOptions, designerConfig: DesignerConfig): AdditionalElementsOptions {
        return {
            gridLine: GridLineModel.getGridLineOptions(options, designerConfig)
        }
    }

    private static getChartsModel(charts: IntervalChart[], chartPalette: Color[]): IntervalChartModel[] {
        const chartsModel: IntervalChartModel[] = [];
        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                title: chart.title,
                data: { ...chart.data },
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModel.getCssClasses(chart.type, index),
                elementColors: ChartStyleModel.getElementColorPallete(chartPalette, 'interval', charts.length, index)
            });
        });
        return chartsModel;
    }
}