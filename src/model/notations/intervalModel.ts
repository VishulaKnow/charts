import { MdtChartsConfig, MdtChartsDataSource, IntervalChart, IntervalOptions } from "../../config/config";
import { ChartStyleConfig, DesignerConfig } from "../../designer/designerConfig";
import { AxisModel } from "../featuresModel/axisModel";
import { ChartStyleModel } from "../chartStyleModel";
import { DataManagerModel } from "../dataManagerModel";
import { LegendModel } from "../featuresModel/legendModel/legendModel";
import { AdditionalElementsOptions, BlockMargin, DataScope, IntervalChartModel, IntervalOptionsModel } from "../model";
import { AxisType } from "../modelBuilder";
import { ScaleModel, ScaleType } from "../featuresModel/scaleModel";
import { TwoDimensionalModel } from "./twoDimensionalModel";
import { ModelInstance } from "../modelInstance/modelInstance";

export class IntervalModel {
    public static getOptions(config: MdtChartsConfig, designerConfig: DesignerConfig, margin: BlockMargin, dataScope: DataScope, data: MdtChartsDataSource, modelInstance: ModelInstance): IntervalOptionsModel {
        const options = <IntervalOptions>config.options;
        const canvasModel = modelInstance.canvasModel;

        return {
            legend: LegendModel.getLegendModel(config.options.type, config.options.legend.show, canvasModel),
            title: options.title,
            selectable: !!options.selectable,
            orient: options.orientation,
            scale: {
                key: {
                    domain: dataScope.allowableKeys,
                    range: {
                        start: 0,
                        end: ScaleModel.getRangePeek(ScaleType.Key, options.orientation, canvasModel)
                    },
                    type: 'band',
                    elementsAmount: 1
                },
                value: {
                    domain: ScaleModel.getDateValueDomain(data, options.chart, options.axis.key.position, options.data.dataSource),
                    range: {
                        start: 0,
                        end: ScaleModel.getRangePeek(ScaleType.Value, options.orientation, canvasModel)
                    },
                    type: 'datetime'
                }
            },
            axis: {
                key: {
                    type: 'key',
                    orient: AxisModel.getAxisOrient(AxisType.Key, options.orientation, options.axis.key.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Key, options.orientation, options.axis.key.position, canvasModel),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Key, options.orientation, options.axis.key.position, canvasModel)
                    },
                    cssClass: 'key-axis',
                    ticks: options.axis.key.ticks,
                    labels: {
                        maxSize: AxisModel.getLabelSize(designerConfig.canvas.axisLabel.maxSize.main, data[options.data.dataSource].map(d => d[options.data.keyField.name])).width,
                        position: AxisModel.getKeyAxisLabelPosition(canvasModel, DataManagerModel.getDataValuesByKeyField(data, options.data.dataSource, options.data.keyField.name).length),
                        visible: true,
                        defaultTooltip: designerConfig.elementsOptions.tooltip.position === 'fixed'
                    },
                    visibility: options.axis.key.visibility
                },
                value: {
                    type: 'value',
                    orient: AxisModel.getAxisOrient(AxisType.Value, options.orientation, options.axis.value.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Value, options.orientation, options.axis.value.position, canvasModel),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Value, options.orientation, options.axis.value.position, canvasModel)
                    },
                    cssClass: 'value-axis',
                    ticks: options.axis.value.ticks,
                    labels: {
                        maxSize: designerConfig.canvas.axisLabel.maxSize.main,
                        position: 'straight',
                        visible: true,
                        defaultTooltip: true
                    },
                    visibility: options.axis.value.visibility
                }
            },
            data: { ...options.data },
            type: options.type,
            charts: this.getChartsModel(options.chart, designerConfig.chartStyle),
            additionalElements: this.getAdditionalElements(options),
            tooltip: options.tooltip,
            chartSettings: TwoDimensionalModel.getChartsSettings(designerConfig.canvas.chartOptions.bar)
        }
    }

    public static getAdditionalElements(options: IntervalOptions): AdditionalElementsOptions {
        return {
            gridLine: options.additionalElements.gridLine
        }
    }

    private static getChartsModel(chart: IntervalChart, chartStyleConfig: ChartStyleConfig): IntervalChartModel[] {
        const chartsModel: IntervalChartModel[] = [];
        chartsModel.push({
            type: chart.type,
            data: { ...chart.data },
            tooltip: chart.tooltip,
            cssClasses: ChartStyleModel.getCssClasses(0),
            style: ChartStyleModel.getChartStyle(1, chartStyleConfig)
        });

        return chartsModel;
    }
}