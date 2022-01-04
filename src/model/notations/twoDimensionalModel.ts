import { ChartOrientation, MdtChartsDataSource, TwoDimensionalChart, TwoDimensionalChartType, MdtChartsTwoDimensionalOptions } from "../../config/config";
import { BarOptionsCanvas, ChartStyleConfig, DesignerConfig } from "../../designer/designerConfig";
import { ChartStyleModelService } from "../chartStyleModel/chartStyleModel";
import { TwoDimensionalChartStyleModel } from "../chartStyleModel/TwoDimensionalChartStyleModel";
import { AxisModel } from "../featuresModel/axisModel";
import { LegendModel } from "../featuresModel/legendModel/legendModel";
import { ScaleModel } from "../featuresModel/scaleModel";
import { DataScope, TwoDimensionalOptionsModel, TwoDimensionalChartModel, EmbeddedLabelTypeModel, AdditionalElementsOptions, TwoDimChartElementsSettings } from "../model";
import { ModelInstance } from "../modelInstance/modelInstance";


export class TwoDimensionalModel {
    public static getOptions(options: MdtChartsTwoDimensionalOptions, designerConfig: DesignerConfig, dataScope: DataScope, data: MdtChartsDataSource, modelInstance: ModelInstance): TwoDimensionalOptionsModel {
        const canvasModel = modelInstance.canvasModel;
        return {
            legend: LegendModel.getLegendModel(options.type, options.legend.show, canvasModel),
            title: options.title,
            selectable: !!options.selectable,
            orient: options.orientation,
            scale: {
                key: ScaleModel.getScaleKey(dataScope.allowableKeys, options.orientation, canvasModel, options.charts, this.getChartsByType(options.charts, 'bar')),
                value: ScaleModel.getScaleLinear(options, data, canvasModel)
            },
            axis: {
                key: AxisModel.getKeyAxis(options.charts, data, options.data, options.orientation, options.axis.key, designerConfig.canvas.axisLabel, canvasModel, designerConfig.elementsOptions.tooltip),
                value: AxisModel.getValueAxis(options.orientation, options.axis.value, designerConfig.canvas.axisLabel, canvasModel)
            },
            type: options.type,
            data: { ...options.data },
            charts: this.getChartsModel(options.charts, options.orientation, designerConfig.chartStyle),
            additionalElements: this.getAdditionalElements(options),
            tooltip: options.tooltip,
            chartSettings: this.getChartsSettings(designerConfig.canvas.chartOptions.bar)
        }
    }

    public static getChartsEmbeddedLabelsFlag(charts: TwoDimensionalChart[], chartOrientation: ChartOrientation): boolean {
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
    public static sortCharts(charts: TwoDimensionalChart[]): void {
        const chartOrder: TwoDimensionalChartType[] = ['area', 'bar', 'line'];
        charts.sort((chart1, chart2) => chartOrder.indexOf(chart1.type) - chartOrder.indexOf(chart2.type));
    }

    public static getChartsSettings(barSettings: BarOptionsCanvas): TwoDimChartElementsSettings {
        return {
            bar: { ...barSettings }
        }
    }

    private static getChartsModel(charts: TwoDimensionalChart[], chartOrientation: ChartOrientation, chartStyleConfig: ChartStyleConfig): TwoDimensionalChartModel[] {
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
                index
            });
        });

        return chartsModel;
    }

    private static findChartsWithEmbeddedKeyLabels(charts: TwoDimensionalChart[]): TwoDimensionalChart[] {
        const chartsWithEmbeddedLabels: TwoDimensionalChart[] = [];

        charts.forEach(chart => {
            if (chart.type === 'bar' && chart.embeddedLabels === 'key')
                chartsWithEmbeddedLabels.push(chart);
        });

        return chartsWithEmbeddedLabels;
    }

    private static getEmbeddedLabelType(currentChart: TwoDimensionalChart, chartOrientation: ChartOrientation): EmbeddedLabelTypeModel {
        if (chartOrientation === 'horizontal' && currentChart.type === 'bar')
            return currentChart.embeddedLabels;
        return 'none';
    }

    private static getAdditionalElements(options: MdtChartsTwoDimensionalOptions): AdditionalElementsOptions {
        return {
            gridLine: options.additionalElements.gridLine
        }
    }

    private static getChartsByType(charts: TwoDimensionalChart[], type: TwoDimensionalChartType): TwoDimensionalChart[] {
        return charts.filter(chart => chart.type === type);
    }

    public static getChartsValueFieldsAmount(charts: TwoDimensionalChart[]): number[] {
        return charts.map(chart => chart.data.valueFields.length);
    }
}