import { ChartOrientation, Config, TwoDimensionalChart, TwoDimensionalChartType, TwoDimensionalOptions } from "../../config/config";
import { ChartStyleConfig, DesignerConfig } from "../../designer/designerConfig";
import { ChartStyleModel } from "../chartStyleModel";
import { DataManagerModel } from "../dataManagerModel";
import { AxisModel } from "../featuresModel/axisModel";
import { LegendModel } from "../featuresModel/legendModel/legendModel";
import { ScaleModel } from "../featuresModel/scaleModel";
import { BlockMargin, DataScope, DataSource, TwoDimensionalOptionsModel, TwoDimensionalChartModel, EmbeddedLabelTypeModel, AdditionalElementsOptions } from "../model";
import { AxisType } from "../modelBuilder";


export class TwoDimensionalModel {
    public static getOptions(config: Config, designerConfig: DesignerConfig, margin: BlockMargin, dataScope: DataScope, data: DataSource): TwoDimensionalOptionsModel {
        const options = <TwoDimensionalOptions>config.options;
        //TODO: вынести получение scale и получение axis в отдельные компоненты
        return {
            legend: LegendModel.getLegendModel(config.options.type, config.options.legend.show, config.canvas.size, margin),
            title: options.title,
            selectable: options.selectable,
            orient: options.orientation,
            scale: {
                key: ScaleModel.getScaleKey(dataScope.allowableKeys, options.orientation, margin, config.canvas.size, options.charts, this.getChartsByType(options.charts, 'bar')),
                value: ScaleModel.getScaleLinear(options, data, margin, config.canvas.size)
            },
            axis: {
                keyAxis: {
                    type: 'key',
                    orient: AxisModel.getAxisOrient(AxisType.Key, options.orientation, options.axis.keyAxis.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Key, options.orientation, options.axis.keyAxis.position, margin, config.canvas.size.width),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Key, options.orientation, options.axis.keyAxis.position, margin, config.canvas.size.height)
                    },
                    cssClass: 'key-axis',
                    ticks: options.axis.keyAxis.ticks,
                    labels: {
                        maxSize: AxisModel.getLabelSize(designerConfig.canvas.axisLabel.maxSize.main, data[options.data.dataSource].map(d => d[options.data.keyField.name])).width,
                        positition: AxisModel.getKeyAxisLabelPosition(margin, config.canvas.size, DataManagerModel.getDataValuesByKeyField(data, options.data.dataSource, options.data.keyField.name).length),
                        visible: !TwoDimensionalModel.getChartsEmbeddedLabelsFlag(options.charts, options.orientation)
                    },
                    visibility: options.axis.keyAxis.visibility
                },
                valueAxis: {
                    type: 'value',
                    orient: AxisModel.getAxisOrient(AxisType.Value, options.orientation, options.axis.valueAxis.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Value, options.orientation, options.axis.valueAxis.position, margin, config.canvas.size.width),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Value, options.orientation, options.axis.valueAxis.position, margin, config.canvas.size.height)
                    },
                    cssClass: 'value-axis',
                    ticks: options.axis.valueAxis.ticks,
                    labels: {
                        maxSize: designerConfig.canvas.axisLabel.maxSize.main,
                        positition: 'straight',
                        visible: true
                    },
                    visibility: options.axis.valueAxis.visibility
                }
            },
            type: options.type,
            data: { ...options.data },
            charts: this.getChartsModel(options.charts, options.orientation, designerConfig.chartStyle),
            additionalElements: this.getAdditionalElements(options)
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

    private static getChartsModel(charts: TwoDimensionalChart[], chartOrientation: ChartOrientation, chartStyleConfig: ChartStyleConfig): TwoDimensionalChartModel[] {
        this.sortCharts(charts);
        const chartsModel: TwoDimensionalChartModel[] = [];
        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                isSegmented: chart.isSegmented,
                data: { ...chart.data },
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModel.getCssClasses(index),
                style: ChartStyleModel.get2DChartStyle(charts.length, chart.type, this.getChartsValueFieldsAmount(charts), index, chart.isSegmented, chartStyleConfig),
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

    private static getAdditionalElements(options: TwoDimensionalOptions): AdditionalElementsOptions {
        return {
            gridLine: options.additionalElements.gridLine
        }
    }

    private static getChartsByType(charts: TwoDimensionalChart[], type: TwoDimensionalChartType): TwoDimensionalChart[] {
        return charts.filter(chart => chart.type === type);
    }

    private static getChartsValueFieldsAmount(charts: TwoDimensionalChart[]): number[] {
        return charts.map(chart => chart.data.valueFields.length);
    }
}