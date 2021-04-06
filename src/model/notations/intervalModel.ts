import { Config, DataSource, IntervalChart, IntervalOptions } from "../../config/config";
import { ChartStyleConfig, DesignerConfig } from "../../designer/designerConfig";
import { AxisModel } from "../featuresModel/axisModel";
import { ChartStyleModel } from "../chartStyleModel";
import { DataManagerModel } from "../dataManagerModel";
import { LegendModel } from "../featuresModel/legendModel/legendModel";
import { AdditionalElementsOptions, BlockMargin, DataScope, IntervalChartModel, IntervalOptionsModel } from "../model";
import { AxisType } from "../modelBuilder";
import { ScaleModel, ScaleType } from "../featuresModel/scaleModel";

export class IntervalModel {
    public static getOptions(config: Config, designerConfig: DesignerConfig, margin: BlockMargin, dataScope: DataScope, data: DataSource): IntervalOptionsModel {
        const options = <IntervalOptions>config.options;

        return {
            legend: LegendModel.getLegendModel(config.options.type, config.options.legend.show, config.canvas.size, margin),
            title: options.title,
            selectable: !!options.selectable,
            orient: options.orientation,
            scale: {
                key: {
                    domain: dataScope.allowableKeys,
                    range: {
                        start: 0,
                        end: ScaleModel.getRangePeek(ScaleType.Key, options.orientation, margin, config.canvas.size)
                    },
                    type: ScaleModel.getScaleKeyType(options.charts),
                    elementsAmount: options.charts.length
                },
                value: {
                    domain: ScaleModel.getDateValueDomain(data, options.charts, options.axis.key.position, options.data.dataSource),
                    range: {
                        start: 0,
                        end: ScaleModel.getRangePeek(ScaleType.Value, options.orientation, margin, config.canvas.size)
                    },
                    type: ScaleModel.getScaleValueType(options.charts)
                }
            },
            axis: {
                key: {
                    type: 'key',
                    orient: AxisModel.getAxisOrient(AxisType.Key, options.orientation, options.axis.key.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Key, options.orientation, options.axis.key.position, margin, config.canvas.size.width),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Key, options.orientation, options.axis.key.position, margin, config.canvas.size.height)
                    },
                    cssClass: 'key-axis',
                    ticks: options.axis.key.ticks,
                    labels: {
                        maxSize: AxisModel.getLabelSize(designerConfig.canvas.axisLabel.maxSize.main, data[options.data.dataSource].map(d => d[options.data.keyField.name])).width,
                        position: AxisModel.getKeyAxisLabelPosition(margin, config.canvas.size, DataManagerModel.getDataValuesByKeyField(data, options.data.dataSource, options.data.keyField.name).length),
                        visible: true
                    },
                    visibility: options.axis.key.visibility
                },
                value: {
                    type: 'value',
                    orient: AxisModel.getAxisOrient(AxisType.Value, options.orientation, options.axis.value.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Value, options.orientation, options.axis.value.position, margin, config.canvas.size.width),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Value, options.orientation, options.axis.value.position, margin, config.canvas.size.height)
                    },
                    cssClass: 'value-axis',
                    ticks: options.axis.value.ticks,
                    labels: {
                        maxSize: designerConfig.canvas.axisLabel.maxSize.main,
                        position: 'straight',
                        visible: true
                    },
                    visibility: options.axis.value.visibility
                }
            },
            data: { ...options.data },
            type: options.type,
            charts: this.getChartsModel(options.charts, designerConfig.chartStyle),
            additionalElements: this.getAdditionalElements(options),
            tooltip: options.tooltip
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