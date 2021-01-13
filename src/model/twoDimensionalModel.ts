import { Color } from "d3";
import { Config, TwoDimensionalChart, TwoDimensionalOptions } from "../config/config";
import { AxisLabelCanvas, DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { ChartStyleModel } from "./chartStyleModel";
import { BlockMargin, GridLineOptions, TwoDimensionalAdditionalElementsOptions, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "./model";
import { AxisType } from "./modelOptions";
import { ScaleModel, ScaleType } from "./scaleModel";

export class TwoDimensionalModel
{
    static get2DOptions(config: Config, designerConfig: DesignerConfig, configOptions: TwoDimensionalOptions, axisLabelDesignerOptions: AxisLabelCanvas, chartPalette: Color[], margin: BlockMargin, allowableKeys: string[], data: any): TwoDimensionalOptionsModel {
        return {
            scale: {
                scaleKey: {
                    domain: ScaleModel.getScaleDomain(ScaleType.Key, configOptions.axis.keyAxis.domain, data[configOptions.charts[0].data.dataSource], configOptions.charts[0], null, allowableKeys),
                    range: {
                        start: 0,
                        end: ScaleModel.getScaleRangePeek(ScaleType.Key, configOptions.charts[0].orientation, margin, config.canvas.size)
                    }
                },
                scaleValue: {
                    domain: ScaleModel.getScaleDomain(ScaleType.Value, configOptions.axis.valueAxis.domain, data[configOptions.charts[0].data.dataSource], configOptions.charts[0], configOptions.axis.keyAxis.position),
                    range: {
                        start: 0,
                        end: ScaleModel.getScaleRangePeek(ScaleType.Value, configOptions.charts[0].orientation, margin, config.canvas.size)
                    }
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
                    maxLabelSize: axisLabelDesignerOptions.maxSize.main
                },
                valueAxis: {
                    orient: AxisModel.getAxisOrient(AxisType.Value, configOptions.charts[0].orientation, configOptions.axis.valueAxis.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Value, configOptions.charts[0].orientation, configOptions.axis.valueAxis.position, margin, config.canvas.size.width),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Value, configOptions.charts[0].orientation, configOptions.axis.valueAxis.position, margin, config.canvas.size.height)
                    },          
                    class: 'value-axis',
                    maxLabelSize: axisLabelDesignerOptions.maxSize.main
                }
            },
            type: configOptions.type,
            charts: this.get2DChartsModel(configOptions.charts, chartPalette),
            additionalElements: this.get2DAdditionalElements(configOptions, designerConfig)
        }
    }

    static get2DChartsModel(charts: TwoDimensionalChart[], chartPalette: Color[]): TwoDimensionalChartModel[] {
        const chartsModel: TwoDimensionalChartModel[] = [];
        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                data: {
                    dataSource: chart.data.dataSource,
                    keyField: chart.data.keyField,
                    valueField: chart.data.valueField
                },
                orient: chart.orientation,
                legend: chart.legend,
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModel.getCssClasses(chart.type, index),
                elementColors: ChartStyleModel.getElementColorPallete(chartPalette, '2d', charts.length, index)
            });
        });
        return chartsModel;
    }

    static get2DAdditionalElements(options: TwoDimensionalOptions, designerConfig: DesignerConfig): TwoDimensionalAdditionalElementsOptions {
        return {
            gridLine: this.getGridLineOptions(options, designerConfig)
        }
    }

    static getGridLineOptions(options: TwoDimensionalOptions, designerConfig: DesignerConfig): GridLineOptions {
        let vertical: boolean = false;
        let horizontal: boolean = false;
        if(designerConfig.additionalElements.gridLine.flag.horizontal)
            horizontal = options.additionalElements.gridLine.flag.horizontal;
        if(designerConfig.additionalElements.gridLine.flag.vertical)
            vertical = options.additionalElements.gridLine.flag.vertical;
        return {
            flag: {
                vertical,
                horizontal
            }
        }
    }
}