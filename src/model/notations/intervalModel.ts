import { Config, IntervalChart, IntervalOptions } from "../../config/config";
import { ChartStyleConfig, DesignerConfig } from "../../designer/designerConfig";
import { AxisModel } from "../featuresModel/axisModel";
import { ChartStyleModel } from "../chartStyleModel";
import { DataManagerModel } from "../dataManagerModel";
import { LegendModel } from "../featuresModel/legendModel/legendModel";
import { AdditionalElementsOptions, BlockMargin, DataScope, DataSource, IntervalChartModel, IntervalOptionsModel } from "../model";
import { AxisType } from "../modelBuilder";
import { ScaleModel, ScaleType } from "../featuresModel/scaleModel";

export class IntervalModel {
    public static getOptions(config: Config, designerConfig: DesignerConfig, margin: BlockMargin, dataScope: DataScope, data: DataSource): IntervalOptionsModel {
        const configOptions = <IntervalOptions>config.options;

        return {
            legend: LegendModel.getLegendModel(config.options.type, config.options.legend.show, config.canvas.size, margin),
            title: configOptions.title,
            selectable: configOptions.selectable,
            orient: configOptions.orientation,
            scale: {
                key: {
                    domain: dataScope.allowableKeys,
                    range: {
                        start: 0,
                        end: ScaleModel.getScaleRangePeek(ScaleType.Key, configOptions.orientation, margin, config.canvas.size)
                    },
                    type: ScaleModel.getScaleKeyType(configOptions.charts),
                    elementsAmount: configOptions.charts.length
                },
                value: {
                    domain: ScaleModel.getScaleDateValueDomain(data, configOptions.charts, configOptions.axis.keyAxis.position, configOptions.data.dataSource),
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
                        maxSize: AxisModel.getLabelSize(designerConfig.canvas.axisLabel.maxSize.main, data[configOptions.data.dataSource].map(d => d[configOptions.data.keyField.name])).width,
                        positition: AxisModel.getKeyAxisLabelPosition(margin, config.canvas.size, DataManagerModel.getDataValuesByKeyField(data, configOptions.data.dataSource, configOptions.data.keyField.name).length),
                        visible: true
                    },
                    visibility: configOptions.axis.keyAxis.visibility
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
                        positition: 'straight',
                        visible: true
                    },
                    visibility: configOptions.axis.valueAxis.visibility
                }
            },
            data: { ...configOptions.data },
            type: configOptions.type,
            charts: this.getChartsModel(configOptions.charts, designerConfig.chartStyle),
            additionalElements: this.getAdditionalElements(configOptions)
        }
    }

    public static getAdditionalElements(options: IntervalOptions): AdditionalElementsOptions {
        return {
            gridLine: options.additionalElements.gridLine
        }
    }

    private static getChartsModel(charts: IntervalChart[], chartStyleConfig: ChartStyleConfig): IntervalChartModel[] {
        const chartsModel: IntervalChartModel[] = [];
        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                data: { ...chart.data },
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModel.getCssClasses(index),
                style: ChartStyleModel.getChartStyle(charts.length, chartStyleConfig)
            });
        });
        return chartsModel;
    }
}