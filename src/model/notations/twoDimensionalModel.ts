import { ChartOrientation, MdtChartsTwoDimensionalChart, TwoDimensionalChartType, MdtChartsTwoDimensionalOptions } from "../../config/config";
import { ChartOptionsCanvas, DesignerConfig } from "../../designer/designerConfig";
import { ChartStyleModelService } from "../chartStyleModel/chartStyleModel";
import { TwoDimensionalChartStyleModel } from "../chartStyleModel/twoDimensionalChartStyleModel";
import { AxisModel } from "../featuresModel/axisModel";
import { ScaleAxisRecalcer } from "../featuresModel/scaleModel/scaleAxisRecalcer";
import { ScaleModel } from "../featuresModel/scaleModel/scaleModel";
import { TwoDimensionalOptionsModel, TwoDimensionalChartModel, EmbeddedLabelTypeModel, AdditionalElementsOptions, TwoDimChartElementsSettings } from "../model";
import { TwoDimConfigReader } from "../modelInstance/configReader";
import { ModelInstance } from "../modelInstance/modelInstance";
import { getLegendMarkerOptions, parseDashStyles, parseShape } from "./twoDimensional/styles";
import { getResolvedTitle } from "../../model/featuresModel/titleModel";
import { DataRepositoryModel } from "../modelInstance/dataModel/dataRepository";


export class TwoDimensionalModel {
    public static getOptions(configReader: TwoDimConfigReader, designerConfig: DesignerConfig, modelInstance: ModelInstance): TwoDimensionalOptionsModel {
        const options = configReader.options;
        const canvasModel = modelInstance.canvasModel;
        const resolvedTitle = getResolvedTitle(options.title, modelInstance.dataModel.repository.getRawRows())
        const scaleModel = new ScaleModel();

        const scaleMarginRecalcer = new ScaleAxisRecalcer(() => scaleModel.getScaleLinear(options, modelInstance.dataModel.repository.getScopedRows(), canvasModel, configReader));
        scaleMarginRecalcer.recalculateMargin(canvasModel, options.orientation, options.axis.key);
        const scaleValueInfo = scaleMarginRecalcer.getScaleValue();

        const secondaryScaleMarginRecalcer = new ScaleAxisRecalcer(() => scaleModel.getScaleSecondaryLinear(options, modelInstance.dataModel.repository.getScopedRows(), canvasModel, configReader));
        secondaryScaleMarginRecalcer.recalculateMargin(canvasModel, options.orientation, options.axis.key);
        const secondaryScaleValueInfo = secondaryScaleMarginRecalcer.getScaleValue();

        return {
            legend: canvasModel.legendCanvas.getModel(),
            title: resolvedTitle,
            selectable: !!options.selectable,
            orient: options.orientation,
            scale: {
                key: scaleModel.getScaleKey(modelInstance.dataModel.getAllowableKeys(), options.orientation, canvasModel, options.charts, this.getChartsByType(options.charts, 'bar')),
                value: scaleValueInfo.scale,
                valueSecondary: secondaryScaleValueInfo.scale,
            },
            axis: {
                key: AxisModel.getKeyAxis(options, modelInstance.dataModel.repository.getScopedFullSource(), designerConfig.canvas.axisLabel, canvasModel, designerConfig.elementsOptions.tooltip, () => scaleValueInfo.scaleFn(0)),
                value: AxisModel.getValueAxis(options.orientation, options.axis.value, designerConfig.canvas.axisLabel, canvasModel)
            },
            type: options.type,
            data: { ...options.data },
            charts: this.getChartsModel(options.charts, options.orientation, designerConfig, modelInstance.dataModel.repository),
            additionalElements: this.getAdditionalElements(options),
            tooltip: options.tooltip,
            chartSettings: this.getChartsSettings(designerConfig.canvas.chartOptions, options.orientation)
        }
    }

    public static getChartsEmbeddedLabelsFlag(charts: MdtChartsTwoDimensionalChart[], chartOrientation: ChartOrientation): boolean {
        // Если НЕ найден хотя бы один чарт, который сегментированный или хотя бы один НЕ бар чарт, то лейблы можно прятать
        return charts.findIndex(chart => chart.isSegmented || chart.type !== 'bar') === -1
            && chartOrientation === 'horizontal'
            && charts.length === this.findChartsWithEmbeddedKeyLabels(charts).length;
    }

    /**
     * Сортирует список чартов в порядке: area - bar - line.
     * Используется для того, чтобы при рендере графики с наибольшей площадью (area) не перекрывали графики с меньшей площадью (bar, line).
     * @param charts Чарты из конфига
     */
    public static sortCharts(charts: MdtChartsTwoDimensionalChart[]): void {
        const chartOrder: TwoDimensionalChartType[] = ['area', 'bar', 'line'];
        charts.sort((chart1, chart2) => chartOrder.indexOf(chart1.type) - chartOrder.indexOf(chart2.type));
    }

    public static getChartsSettings(chartOptions: ChartOptionsCanvas, chartOrientation: ChartOrientation): TwoDimChartElementsSettings {
        return {
            bar: { ...chartOptions.bar },
            lineLike: { shape: parseShape(chartOrientation, chartOptions.line?.shape) }
        }
    }

    private static getChartsModel(charts: MdtChartsTwoDimensionalChart[], chartOrientation: ChartOrientation, designerConfig: DesignerConfig, dataModelRep: DataRepositoryModel): TwoDimensionalChartModel[] {
        const styleModel = new TwoDimensionalChartStyleModel(charts, designerConfig.chartStyle);
        this.sortCharts(charts);
        const chartsModel: TwoDimensionalChartModel[] = [];

        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                isSegmented: chart.isSegmented,
                data: { ...chart.data },
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModelService.getCssClasses(index),
                style: styleModel.getChartStyle(chart, index),
                embeddedLabels: this.getEmbeddedLabelType(chart, chartOrientation),
                markersOptions: {
                    show: dataModelRep.getScopedRows().length === 1 ? true : chart.markers.show,
                    styles: {
                        highlighted: {
                            size: { radius: designerConfig.canvas.markers?.highlighted?.radius ?? 4, borderSize: '3.5px' }
                        },
                        normal: {
                            size: {
                                radius: designerConfig.canvas.markers?.normal?.radius ?? 3,
                                borderSize: `${designerConfig.canvas.markers?.normal?.borderSize ?? 2}px`
                            }
                        }
                    }
                },
                lineViewOptions: {
                    dashedStyles: parseDashStyles(chart.lineStyles?.dash),
                    renderForKey: (dataRow, valueFieldName) => dataRow[valueFieldName] !== null && dataRow[valueFieldName] !== undefined
                },
                barViewOptions: { hatch: { on: chart.barStyles?.hatch?.on ?? false } },
                legend: getLegendMarkerOptions(chart),
                index
            });
        });

        return chartsModel;
    }

    private static findChartsWithEmbeddedKeyLabels(charts: MdtChartsTwoDimensionalChart[]): MdtChartsTwoDimensionalChart[] {
        const chartsWithEmbeddedLabels: MdtChartsTwoDimensionalChart[] = [];

        charts.forEach(chart => {
            if (chart.type === 'bar' && chart.embeddedLabels === 'key')
                chartsWithEmbeddedLabels.push(chart);
        });

        return chartsWithEmbeddedLabels;
    }

    private static getEmbeddedLabelType(currentChart: MdtChartsTwoDimensionalChart, chartOrientation: ChartOrientation): EmbeddedLabelTypeModel {
        if (chartOrientation === 'horizontal' && currentChart.type === 'bar')
            return currentChart.embeddedLabels;
        return 'none';
    }

    private static getAdditionalElements(options: MdtChartsTwoDimensionalOptions): AdditionalElementsOptions {
        return {
            gridLine: options.additionalElements.gridLine
        }
    }

    private static getChartsByType(charts: MdtChartsTwoDimensionalChart[], type: TwoDimensionalChartType): MdtChartsTwoDimensionalChart[] {
        return charts.filter(chart => chart.type === type);
    }
}