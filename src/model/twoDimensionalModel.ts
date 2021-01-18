import { Color } from "d3";
import { Config, TwoDimensionalChart, TwoDimensionalOptions } from "../config/config";
import { DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { ChartStyleModel } from "./chartStyleModel";
import { GridLineModel } from "./gridLineModel";
import { BlockMargin, DataScope, DataSource, AdditionalElementsOptions, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "./model";
import { AxisType } from "./modelOptions";
import { ScaleModel, ScaleType } from "./scaleModel";

export class TwoDimensionalModel
{
    public static getOptions(config: Config, designerConfig: DesignerConfig, margin: BlockMargin, dataScope: DataScope, data: DataSource): TwoDimensionalOptionsModel {
        const configOptions = <TwoDimensionalOptions>config.options
        return {
            scale: {
                scaleKey: {
                    domain: ScaleModel.getScaleKeyDomain(dataScope.allowableKeys),
                    range: {
                        start: 0,
                        end: ScaleModel.getScaleRangePeek(ScaleType.Key, configOptions.charts[0].orientation, margin, config.canvas.size)
                    },
                    type: ScaleModel.getScaleKeyType(configOptions.charts)
                },
                scaleValue: {
                    domain: ScaleModel.getScaleLinearValueDomain(configOptions.axis.valueAxis.domain, data, configOptions.charts, configOptions.axis.keyAxis.position),
                    range: {
                        start: 0,
                        end: ScaleModel.getScaleRangePeek(ScaleType.Value, configOptions.charts[0].orientation, margin, config.canvas.size)
                    },
                    type: ScaleModel.getScaleValueType(configOptions.charts)
                }
            },
            axis: {
                keyAxis: {
                    orient: AxisModel.getAxisOrient(AxisType.Key, configOptions.charts[0].orientation, configOptions.axis.keyAxis.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Key, configOptions.charts[0].orientation, configOptions.axis.keyAxis.position, margin, config.canvas.size.width),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Key, configOptions.charts[0].orientation, configOptions.axis.keyAxis.position, margin, config.canvas.size.height)
                    },
                    class: 'key-axis',
                    maxLabelSize: designerConfig.canvas.axisLabel.maxSize.main,
                    ticks: configOptions.axis.keyAxis.ticks
                },
                valueAxis: {
                    orient: AxisModel.getAxisOrient(AxisType.Value, configOptions.charts[0].orientation, configOptions.axis.valueAxis.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Value, configOptions.charts[0].orientation, configOptions.axis.valueAxis.position, margin, config.canvas.size.width),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Value, configOptions.charts[0].orientation, configOptions.axis.valueAxis.position, margin, config.canvas.size.height)
                    },          
                    class: 'value-axis',
                    maxLabelSize: designerConfig.canvas.axisLabel.maxSize.main,
                    ticks: configOptions.axis.valueAxis.ticks
                }
            },
            type: configOptions.type,
            charts: this.getChartsModel(configOptions.charts, designerConfig.chart.style.palette),
            additionalElements: this.getAdditionalElements(configOptions, designerConfig)
        }
    }

    private static getChartsModel(charts: TwoDimensionalChart[], chartPalette: Color[]): TwoDimensionalChartModel[] {
        const chartsModel: TwoDimensionalChartModel[] = [];
        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                data: { ...chart.data },
                orient: chart.orientation,
                legend: chart.legend,
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModel.getCssClasses(chart.type, index),
                elementColors: ChartStyleModel.getElementColorPallete(chartPalette, '2d', charts.length, index)
            });
        });
        return chartsModel;
    }

    private static getAdditionalElements(options: TwoDimensionalOptions, designerConfig: DesignerConfig): AdditionalElementsOptions {
        return {
            gridLine: GridLineModel.getGridLineOptions(options, designerConfig)
        }
    }
}