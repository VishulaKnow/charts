import { Color } from "d3";
import { ChartOrientation, Config, TwoDimensionalChart, TwoDimensionalChartType, TwoDimensionalOptions } from "../config/config";
import { DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { ChartStyleModel } from "./chartStyleModel";
import { DataManagerModel } from "./dataManagerModel";
import { GridLineModel } from "./gridLineModel";
import { LegendModel } from "./legendModel/legendModel";
import { BlockMargin, DataScope, DataSource, AdditionalElementsOptions, TwoDimensionalChartModel, TwoDimensionalOptionsModel, EmbededLabelTypeModel } from "./model";
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
                    maxLabelSize: designerConfig.canvas.axisLabel.maxSize.main,
                    ticks: configOptions.axis.keyAxis.ticks,
                    labelPositition: AxisModel.getKeyAxisLabelPosition(margin, config.canvas.size, DataManagerModel.getDataValuesByKeyField(data, configOptions.charts[0]).length)
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
                    ticks: configOptions.axis.valueAxis.ticks,
                    labelPositition: 'straight'
                }
            },
            type: configOptions.type,
            charts: this.getChartsModel(configOptions.charts, designerConfig.chart.style.palette, configOptions.orientation),
            additionalElements: this.getAdditionalElements(configOptions, designerConfig)
        }
    }

    public static getChartsEmbededLabelsFlag(charts: TwoDimensionalChart[], chartOrientation: ChartOrientation): boolean {
        return chartOrientation === 'horizontal' && charts.length === this.findChartsWithEmbededKeyLabels(charts).length;
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
                embededLabels: this.getEmbededLabelType(chart, chartOrientation),
                index
            });
        });
        
        return chartsModel;
    }

    private static findChartsWithEmbededKeyLabels(charts: TwoDimensionalChart[]): TwoDimensionalChart[] {
        const chartsWithEmbededLabels: TwoDimensionalChart[] = [];

        charts.forEach(chart => {
            if(chart.type === 'bar' && chart.embededLabels === 'key')
                chartsWithEmbededLabels.push(chart);
        });

        return chartsWithEmbededLabels;
    }

    private static getEmbededLabelType(currentChart: TwoDimensionalChart, chartOrientation: ChartOrientation): EmbededLabelTypeModel {
        if(chartOrientation === 'horizontal' && currentChart.type === 'bar')
            return currentChart.embededLabels;
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