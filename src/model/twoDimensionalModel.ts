import { Color } from "d3";
import { ChartOrientation, Config, TwoDimensionalChart, TwoDimensionalChartType, TwoDimensionalOptions } from "../config/config";
import { DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { ChartStyleModel } from "./chartStyleModel";
import { DataManagerModel } from "./dataManagerModel";
import { GridLineModel } from "./gridLineModel";
import { LegendModel } from "./legendModel/legendModel";
import { BlockMargin, DataScope, DataSource, AdditionalElementsOptions, TwoDimensionalChartModel, TwoDimensionalOptionsModel, EmbeddedLabelTypeModel } from "./model";
import { ModelHelper } from "./modelHelper";
import { AxisType } from "./modelOptions";
import { ScaleModel, ScaleType } from "./scaleModel";

export class TwoDimensionalModel
{
    public static getOptions(config: Config, designerConfig: DesignerConfig, margin: BlockMargin, dataScope: DataScope, data: DataSource): TwoDimensionalOptionsModel {
        const configOptions = <TwoDimensionalOptions>config.options;

        return {
            legend: LegendModel.getLegendModel(config.options.type, config.options.legend.position, config.canvas.size),
            orient: configOptions.orientation,
            isSegmented: configOptions.isSegmented,
            scale: {
                scaleKey: {
                    domain: ScaleModel.getScaleKeyDomain(dataScope.allowableKeys),
                    range: {
                        start: 0,
                        end: ScaleModel.getScaleRangePeek(ScaleType.Key, configOptions.orientation, margin, config.canvas.size)
                    },
                    type: ScaleModel.getScaleKeyType(configOptions.charts),
                    elementsAmount: ModelHelper.getMaxNumberValue(this.getChartsByType(configOptions.charts, 'bar').map(chart => chart.data.valueField.length)) || 1
                },
                scaleValue: {
                    domain: ScaleModel.getScaleLinearValueDomain(configOptions.axis.valueAxis.domain, data, configOptions),
                    range: {
                        start: 0,
                        end: ScaleModel.getScaleRangePeek(ScaleType.Value, configOptions.orientation, margin, config.canvas.size)
                    },
                    type: ScaleModel.getScaleValueType(configOptions.charts)
                }
            },
            axis: {
                keyAxis: {
                    type: 'key',
                    orient: AxisModel.getAxisOrient(AxisType.Key, configOptions.orientation, configOptions.axis.keyAxis.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Key, configOptions.orientation, configOptions.axis.keyAxis.position, margin, config.canvas.size.width),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Key, configOptions.orientation, configOptions.axis.keyAxis.position, margin, config.canvas.size.height)
                    },
                    cssClass: 'key-axis',
                    ticks: configOptions.axis.keyAxis.ticks,
                    labels: {
                        maxSize: designerConfig.canvas.axisLabel.maxSize.main,
                        positition: AxisModel.getKeyAxisLabelPosition(margin, config.canvas.size, DataManagerModel.getDataValuesByKeyField(data, configOptions.charts[0]).length)
                    }
                },
                valueAxis: {
                    type: 'value',
                    orient: AxisModel.getAxisOrient(AxisType.Value, configOptions.orientation, configOptions.axis.valueAxis.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Value, configOptions.orientation, configOptions.axis.valueAxis.position, margin, config.canvas.size.width),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Value, configOptions.orientation, configOptions.axis.valueAxis.position, margin, config.canvas.size.height)
                    },          
                    cssClass: 'value-axis',
                    ticks: configOptions.axis.valueAxis.ticks,
                    labels: {
                        maxSize: designerConfig.canvas.axisLabel.maxSize.main,
                        positition: 'straight'
                    }
                }
            },
            type: configOptions.type,
            charts: this.getChartsModel(configOptions.charts, designerConfig.chart.style.palette, configOptions.orientation),
            additionalElements: this.getAdditionalElements(configOptions, designerConfig)
        }
    }

    public static getChartsEmbeddedLabelsFlag(charts: TwoDimensionalChart[], chartOrientation: ChartOrientation): boolean {
        return chartOrientation === 'horizontal' && charts.length === this.findChartsWithEmbeddedKeyLabels(charts).length;
    }

    private static getChartsModel(charts: TwoDimensionalChart[], chartPalette: Color[], chartOrientation: ChartOrientation): TwoDimensionalChartModel[] {
        const chartsModel: TwoDimensionalChartModel[] = [];
        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                title: chart.title,
                data: { ...chart.data },
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModel.getCssClasses(chart.type, index),
                style: ChartStyleModel.get2DChartStyle(chartPalette, charts, index),
                embeddedLabels: this.getEmbeddedLabelType(chart, chartOrientation),
                index
            });
        });
        
        return chartsModel;
    }

    private static findChartsWithEmbeddedKeyLabels(charts: TwoDimensionalChart[]): TwoDimensionalChart[] {
        const chartsWithEmbeddedLabels: TwoDimensionalChart[] = [];

        charts.forEach(chart => {
            if(chart.type === 'bar' && chart.embeddedLabels === 'key')
                chartsWithEmbeddedLabels.push(chart);
        });

        return chartsWithEmbeddedLabels;
    }

    private static getEmbeddedLabelType(currentChart: TwoDimensionalChart, chartOrientation: ChartOrientation): EmbeddedLabelTypeModel {
        if(chartOrientation === 'horizontal' && currentChart.type === 'bar')
            return currentChart.embeddedLabels;
        return 'none';
    }

    private static getAdditionalElements(options: TwoDimensionalOptions, designerConfig: DesignerConfig): AdditionalElementsOptions {
        return {
            gridLine: GridLineModel.getGridLineOptions(options, designerConfig)
        }
    }

    private static getChartsByType(charts: TwoDimensionalChart[], type: TwoDimensionalChartType): TwoDimensionalChart[] {
        return charts.filter(chart => chart.type === type);
    }
}