import { MdtChartsConfig, TwoDimensionalChart, IntervalOptions, IntervalChart, TwoDimensionalOptions, PolarOptions, Size, MdtChartsDataSource, MdtChartsDataRow } from "../config/config";
import { BarOptionsCanvas, DesignerConfig, LegendBlockCanvas } from "../designer/designerConfig";
import { AxisModel } from "./featuresModel/axisModel";
import { LegendCanvasModel } from "./featuresModel/legendModel/legendCanvasModel";
import { MIN_DONUT_BLOCK_SIZE } from "./featuresModel/legendModel/legendModel";
import { BlockMargin, DataScope, Field, LegendBlockModel, LegendPosition } from "./model";
import { ModelHelper } from "./modelHelper";
import { ModelInstance } from "./modelInstance/modelInstance";

export class DataManagerModel {
    public static getPreparedData(data: MdtChartsDataSource, allowableKeys: string[], config: MdtChartsConfig): MdtChartsDataSource {
        const scopedData = this.getScopedData(data, allowableKeys, config);
        this.setDataType(scopedData, config);

        return scopedData;
    }

    public static getDataScope(config: MdtChartsConfig, data: MdtChartsDataSource, designerConfig: DesignerConfig, legendBlock: LegendBlockModel, modelInstance: ModelInstance): DataScope {
        if (config.options.type === '2d' || config.options.type === 'interval') {
            return this.getDataScopeFor2D(config.options, modelInstance, data, designerConfig);
        } else if (config.options.type === 'polar') {
            return this.getDataScopeForPolar(config.options, modelInstance, data, legendBlock, designerConfig.canvas.legendBlock);
        }
    }

    public static getDataValuesByKeyField(data: MdtChartsDataSource, dataSourceName: string, keyFieldName: string): string[] {
        return data[dataSourceName].map(dataRow => dataRow[keyFieldName]);
    }


    private static getDataScopeFor2D(configOptions: TwoDimensionalOptions | IntervalOptions, modelInstance: ModelInstance, data: MdtChartsDataSource, designerConfig: DesignerConfig): DataScope {
        // Для interval всегда один элемент, так как там может быть только один столбик
        let itemsLength: number = 1;
        if (configOptions.type === '2d') {
            itemsLength = (configOptions.charts)
                .filter((chart) => chart.type === 'bar').length;
            if (itemsLength === 0) itemsLength = 1; // Если баров нет, то для одной записи выделяется столько же места, сколько для одного столбика
        }

        if (itemsLength !== 0) {
            const axisLength = AxisModel.getAxisLength(configOptions.orientation, modelInstance.canvasModel);
            const uniqueKeys = ModelHelper.getUniqueValues(data[configOptions.data.dataSource].map(d => d[configOptions.data.keyField.name]));
            const dataLength = uniqueKeys.length;

            const limit = this.getDataLimitByItemSize(this.getElementsInGroupAmount(configOptions, itemsLength), dataLength, axisLength, designerConfig.canvas.chartOptions.bar);
            const allowableKeys = uniqueKeys.slice(0, limit);

            return {
                allowableKeys,
                hidedRecordsAmount: dataLength - allowableKeys.length
            }
        }

        return {
            allowableKeys: this.getDataValuesByKeyField(data, configOptions.data.dataSource, configOptions.data.keyField.name),
            hidedRecordsAmount: 0
        }
    }

    private static getDataScopeForPolar(configOptions: PolarOptions, modelInstance: ModelInstance, data: MdtChartsDataSource, legendBlock: LegendBlockModel, legendCanvas: LegendBlockCanvas): DataScope {
        const canvas = modelInstance.canvasModel;
        const dataset = data[configOptions.data.dataSource];
        const keyFieldName = configOptions.data.keyField.name;
        const keys = dataset.map(dataRow => dataRow[keyFieldName]);

        if (!configOptions.legend.show) {
            return {
                allowableKeys: keys,
                hidedRecordsAmount: 0
            }
        }

        let position: LegendPosition;
        if (canvas.getChartBlockWidth() >= MIN_DONUT_BLOCK_SIZE)
            position = 'right';
        else
            position = 'bottom';

        let maxItemsNumber: number;
        if (position === 'right') {
            maxItemsNumber = LegendCanvasModel.findElementsAmountByLegendSize(keys, position, legendCanvas.maxWidth, canvas.getChartBlockHeight());
        } else {
            const margin = canvas.getMargin();
            const blockSize = canvas.getBlockSize();
            const marginBottom = margin.bottom - (legendBlock.coordinate.bottom.size === 0 ? legendBlock.coordinate.bottom.size : legendBlock.coordinate.bottom.size - legendBlock.coordinate.bottom.margin.bottom);
            maxItemsNumber = LegendCanvasModel.findElementsAmountByLegendSize(keys, position, canvas.getChartBlockWidth(), blockSize.height - margin.top - marginBottom - legendBlock.coordinate.bottom.margin.bottom - MIN_DONUT_BLOCK_SIZE);
        }

        return {
            allowableKeys: keys.slice(0, maxItemsNumber),
            hidedRecordsAmount: keys.length - maxItemsNumber
        }
    }

    /**
     * Выводит количество элементов (преимущественно баров) в одной группе. Группа - один ключ
     * @param configOptions 
     * @param chartsLength 
     */
    private static getElementsInGroupAmount(configOptions: TwoDimensionalOptions | IntervalOptions, chartsLength: number): number {
        if (configOptions.type === '2d')
            return this.getBarChartsInGroupAmount(configOptions.charts);

        return chartsLength;
    }

    private static getBarChartsInGroupAmount(charts: TwoDimensionalChart[]): number {
        let barsAmount = 0;
        charts.forEach(chart => {
            if (chart.type === 'bar' && chart.isSegmented)
                barsAmount += 1; // в сегментированном баре все valueFields находятся внутри одного бара, поэтому бар всегда один.
            else if (chart.type === 'bar')
                barsAmount += chart.data.valueFields.length;
        });
        return barsAmount;
    }

    private static getScopedData(data: MdtChartsDataSource, allowableKeys: string[], config: MdtChartsConfig): MdtChartsDataSource {
        const newData: MdtChartsDataSource = {};
        newData[config.options.data.dataSource] = this.getScopedChartData(data[config.options.data.dataSource], allowableKeys, config.options.data.keyField.name);

        return newData;
    }

    private static getScopedChartData(data: MdtChartsDataRow[], allowableKeys: string[], keyFieldName: string): MdtChartsDataRow[] {
        return data.filter(d => allowableKeys.findIndex(key => key === d[keyFieldName]) !== -1);
    }

    private static setDataType(data: MdtChartsDataSource, config: MdtChartsConfig): void {
        if (config.options.type === 'polar' || config.options.type === '2d') {
            // Форматиривание для оси ключей пока не совсем верно установлено
            // if(config.options.data.keyField.format === 'date') {
            //     data[config.options.data.dataSource] = this.getTypedData(data[config.options.data.dataSource], config.options.data.keyField);
            // }
        } else if (config.options.type === 'interval') {
            const chart = config.options.chart;
            if (chart.data.valueField1.format === 'date') {
                data[config.options.data.dataSource] = this.getTypedData(data[config.options.data.dataSource], chart.data.valueField1);
            }
            if (chart.data.valueField2.format === 'date') {
                data[config.options.data.dataSource] = this.getTypedData(data[config.options.data.dataSource], chart.data.valueField2);
            }
        }
    }

    private static getTypedData(data: MdtChartsDataRow[], field: Field): MdtChartsDataRow[] {
        if (field.format === 'date')
            data.forEach(d => {
                d[field.name] = new Date(d[field.name]);
            });
        return data;
    }

    private static getDataLimitByItemSize(elementsInGroupAmount: number, dataLength: number, axisLength: number, barOptions: BarOptionsCanvas): number {
        let sumSize = dataLength * (elementsInGroupAmount * barOptions.minBarWidth + (elementsInGroupAmount - 1) * barOptions.barDistance + barOptions.groupMinDistance);
        while (dataLength !== 0 && axisLength < sumSize) {
            dataLength--;
            // find whole space for bars in group + distance between bars + group distance
            sumSize = dataLength * (elementsInGroupAmount * barOptions.minBarWidth + (elementsInGroupAmount - 1)
                * barOptions.barDistance + barOptions.groupMinDistance);
        }

        return dataLength;
    }
}