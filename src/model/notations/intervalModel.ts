import { IntervalChart, MdtChartsIntervalOptions } from "../../config/config";
import { ChartStyleConfig, DesignerConfig } from "../../designer/designerConfig";
import { AxisModel } from "../featuresModel/axisModel";
import { ChartStyleModelService } from "../chartStyleModel/chartStyleModel";
import { DataManagerModel } from "../dataManagerModel/dataManagerModel";
import { AdditionalElementsOptions, IntervalChartModel, IntervalOptionsModel } from "../model";
import { AxisType } from "../modelBuilder";
import { TwoDimensionalModel } from "./twoDimensionalModel";
import { ModelInstance } from "../modelInstance/modelInstance";

export class IntervalModel {
    public static getOptions(options: MdtChartsIntervalOptions, designerConfig: DesignerConfig, modelInstance: ModelInstance): IntervalOptionsModel {
        const canvasModel = modelInstance.canvasModel;
        const dataModelRep = modelInstance.dataModel.repository;

        return {
            legend: canvasModel.legendCanvas.getModel(),
            title: options.title,
            selectable: !!options.selectable,
            orient: options.orientation,
            scale: {
                key: {
                    domain: modelInstance.dataModel.getAllowableKeys(),
                    range: {
                        start: 0,
                        end: 0
                    },
                    type: 'band',
                    elementsAmount: 1
                },
                value: {
                    domain: [],
                    range: {
                        start: 0,
                        end: 0
                    },
                    type: 'datetime',
                    formatter: null
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
                        maxSize: AxisModel.getLabelSizeLegacy(designerConfig.canvas.axisLabel.maxSize.main, dataModelRep.getScopedRows().map(d => d[options.data.keyField.name])).width,
                        position: AxisModel.getKeyAxisLabelPosition(canvasModel, DataManagerModel.getDataValuesByKeyField(dataModelRep.getScopedFullSource(), options.data.dataSource, options.data.keyField.name).length),
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
            chartSettings: TwoDimensionalModel.getChartsSettings(designerConfig.canvas.chartOptions, options.orientation)
        }
    }

    public static getAdditionalElements(options: MdtChartsIntervalOptions): AdditionalElementsOptions {
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
            cssClasses: ChartStyleModelService.getCssClasses(0),
            style: ChartStyleModelService.getChartStyle(1, chartStyleConfig)
        });

        return chartsModel;
    }
}