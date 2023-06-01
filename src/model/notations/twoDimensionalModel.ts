import { ChartOrientation, MdtChartsTwoDimensionalChart, TwoDimensionalChartType, MdtChartsTwoDimensionalOptions } from "../../config/config";
import { BarOptionsCanvas, ChartOptionsCanvas, ChartStyleConfig, DesignerConfig } from "../../designer/designerConfig";
import { ChartStyleModelService } from "../chartStyleModel/chartStyleModel";
import { TwoDimensionalChartStyleModel } from "../chartStyleModel/TwoDimensionalChartStyleModel";
import { AxisModel } from "../featuresModel/axisModel";
import { ScaleAxisRecalcer } from "../featuresModel/scaleModel/scaleAxisRecalcer";
import { ScaleModel } from "../featuresModel/scaleModel/scaleModel";
import { TwoDimensionalOptionsModel, TwoDimensionalChartModel, EmbeddedLabelTypeModel, AdditionalElementsOptions, TwoDimChartElementsSettings } from "../model";
import { ModelInstance } from "../modelInstance/modelInstance";
import { parseDashStyles, parseShape } from "./twoDimensional/styles";


export class TwoDimensionalModel {
    public static getOptions(options: MdtChartsTwoDimensionalOptions, designerConfig: DesignerConfig, modelInstance: ModelInstance): TwoDimensionalOptionsModel {
        const canvasModel = modelInstance.canvasModel;
        const dataModelRep = modelInstance.dataModel.repository;
        const scaleModel = new ScaleModel();

        const scaleMarginRecalcer = new ScaleAxisRecalcer(() => scaleModel.getScaleLinear(options, dataModelRep.getScopedRows(), canvasModel));
        scaleMarginRecalcer.recalculateMargin(canvasModel, options.orientation, options.axis.key);
        const scaleValueInfo = scaleMarginRecalcer.getScaleValue();

        return {
            legend: canvasModel.legendCanvas.getModel(),
            title: options.title,
            selectable: !!options.selectable,
            orient: options.orientation,
            scale: {
                key: scaleModel.getScaleKey(modelInstance.dataModel.getAllowableKeys(), options.orientation, canvasModel, options.charts, this.getChartsByType(options.charts, 'bar')),
                value: scaleValueInfo.scale
            },
            axis: {
                key: AxisModel.getKeyAxis(options, dataModelRep.getScopedFullSource(), designerConfig.canvas.axisLabel, canvasModel, designerConfig.elementsOptions.tooltip, () => scaleValueInfo.scaleFn(0)),
                value: AxisModel.getValueAxis(options.orientation, options.axis.value, designerConfig.canvas.axisLabel, canvasModel)
            },
            type: options.type,
            data: { ...options.data },
            charts: this.getChartsModel(options.charts, options.orientation, designerConfig.chartStyle),
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

    private static getChartsModel(charts: MdtChartsTwoDimensionalChart[], chartOrientation: ChartOrientation, chartStyleConfig: ChartStyleConfig): TwoDimensionalChartModel[] {
        const styleModel = new TwoDimensionalChartStyleModel(charts, chartStyleConfig);
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
                markersOptions: chart.markers,
                lineViewOptions: { dashedStyles: parseDashStyles(chart.lineStyles?.dash) },
                barViewOptions: { hatch: { on: chart.barStyles?.hatch?.on ?? false } },
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

    public static getChartsValueFieldsAmount(charts: MdtChartsTwoDimensionalChart[]): number[] {
        return charts.map(chart => chart.data.valueFields.length);
    }
}