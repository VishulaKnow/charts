import { Config, PolarChart, TwoDimensionalChart, IntervalOptions, IntervalChart, TwoDimensionalOptions, PolarOptions } from "../config/config";
import { BarOptionsCanvas, DataType, DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { LegendCanvasModel } from "./legendModel/legendCanvasModel";
import { MIN_DONUT_BLOCK_SIZE } from "./legendModel/legendModel";
import { BlockMargin, DataRow, DataScope, DataSource, Field, LegendBlockModel, LegendPosition, Size } from "./model";
import { ModelHelper } from "./modelHelper";

export class DataManagerModel
{
    public static getPreparedData(data: DataSource, allowableKeys: string[], config: Config): DataSource {
        const scopedData = this.getScopedData(data, allowableKeys, config);
        this.setDataType(scopedData, config);
        
        return scopedData;
    }

    public static getDataScope(config: Config, margin: BlockMargin, data: DataSource, designerConfig: DesignerConfig, legendBlock: LegendBlockModel): DataScope {
        if(config.options.type === '2d' || config.options.type === 'interval') {
            return this.getDataScopeFor2D(config.options, config.canvas.size, margin, data, designerConfig);
        } else if(config.options.type === 'polar') {
            return this.getDataScopeForPolar(config.options, config.canvas.size, margin, data, designerConfig, legendBlock);
        }
    }

    public static getDataValuesByKeyField(data: DataSource, dataSource: string, keyFieldName: string): string[] {
        return data[dataSource].map(dataRow => dataRow[keyFieldName]);
    }


    private static getDataScopeFor2D(configOptions: TwoDimensionalOptions | IntervalOptions, blockSize: Size, margin: BlockMargin, data: DataSource, designerConfig: DesignerConfig): DataScope {
        // Выбор чартов, которые используют столбики
        const chartsWithBarElement = (configOptions.charts as Array<TwoDimensionalChart | IntervalChart>)
            .filter((chart: TwoDimensionalChart | IntervalChart) => chart.type === 'bar' || chart.type === 'gantt');

        if(chartsWithBarElement.length !== 0) {
            console.log(chartsWithBarElement.length);

            const axisLength = AxisModel.getAxisLength(configOptions.orientation, margin, blockSize);
            const uniqueKeys = ModelHelper.getUniqueValues(data[configOptions.data.dataSource].map(d => d[configOptions.data.keyField.name]));
            const dataLength = uniqueKeys.length;
            
            const limit = this.getDataLimitByBarSize(this.getElementsInGroupAmount(configOptions, chartsWithBarElement.length), dataLength, axisLength, designerConfig.canvas.chartOptions.bar);
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

    private static getDataScopeForPolar(configOptions: PolarOptions, blockSize: Size, margin: BlockMargin, data: DataSource, designerConfig: DesignerConfig, legendBlock: LegendBlockModel): DataScope {
        const dataset = data[configOptions.data.dataSource];
        const keyFieldName = configOptions.data.keyField.name;
        const keys = dataset.map(dataRow => dataRow[keyFieldName]);

        if(!configOptions.legend.show) {
            return {
                allowableKeys: keys,
                hidedRecordsAmount: 0
            }
        }

        let position: LegendPosition;
        if(blockSize.width - margin.left - margin.right >= MIN_DONUT_BLOCK_SIZE)
            position = 'right';
        else
            position = 'bottom';

        if(position === 'right') {
            if(blockSize.width - margin.left - margin.right < MIN_DONUT_BLOCK_SIZE)
                position = 'bottom';
        }

        let maxItemsNumber: number;
        if(position === 'right') {
            maxItemsNumber = LegendCanvasModel.findElementsAmountByLegendSize(keys, position, 200, blockSize.height - margin.top - margin.bottom);
        } else {
            let marginBottom = margin.bottom - (legendBlock.bottom.size === 0 ? legendBlock.bottom.size : legendBlock.bottom.size - legendBlock.bottom.margin.bottom);
            maxItemsNumber = LegendCanvasModel.findElementsAmountByLegendSize(keys, position, blockSize.width - margin.left - margin.right, blockSize.height - margin.top - marginBottom - legendBlock.bottom.margin.bottom - MIN_DONUT_BLOCK_SIZE);
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
        if(configOptions.type === '2d')
            return this.getBarChartsInGroupAmount(configOptions.charts);

        return chartsLength;
    }

    private static getBarChartsInGroupAmount(charts: TwoDimensionalChart[]): number {
        let barsAmount = 0;
        charts.forEach(chart => {
            if(chart.type === 'bar' && chart.isSegmented)
                barsAmount += 1; // в сегментированном баре все valueFields находятся внутри одного бара, поэтому бар всегда один.
            else if(chart.type === 'bar')
                barsAmount += chart.data.valueFields.length;
        });
        return barsAmount;
    }

    private static getScopedData(data: DataSource, allowableKeys: string[], config: Config): DataSource {
        const newData: DataSource = {};
        newData[config.options.data.dataSource] = this.getScopedChartData(data[config.options.data.dataSource], allowableKeys, config.options.data.keyField.name);

        return newData;
    }

    private static getScopedChartData(data: DataRow[], allowableKeys: string[], keyFieldName: string): DataRow[] {
        return data.filter(d => allowableKeys.findIndex(key => key === d[keyFieldName]) !== -1);
    }

    private static setDataType(data: DataSource, config: Config): void { 
        if(config.options.type === 'polar' || config.options.type === '2d') {
            // Форматиривание для оси ключей пока не совсем верно установлено
            // if(config.options.data.keyField.format === 'date') {
            //     data[config.options.data.dataSource] = this.getTypedData(data[config.options.data.dataSource], config.options.data.keyField);
            // }
        } else if(config.options.type === 'interval') {
            config.options.charts.forEach((chart: IntervalChart) => {
                if(chart.data.valueField1.format === 'date') {
                    data[config.options.data.dataSource] = this.getTypedData(data[config.options.data.dataSource], chart.data.valueField1);
                }
                if(chart.data.valueField2.format === 'date') {
                    data[config.options.data.dataSource] = this.getTypedData(data[config.options.data.dataSource], chart.data.valueField2);
                }
            });
        }
    }

    private static getTypedData(data: DataRow[], field: Field): DataRow[] {
        if(field.format === 'date')
            data.forEach(d => {
                d[field.name] = new Date(d[field.name]);
            });
        return data;
    }

    private static getDataLimitByBarSize(elementsInGroupAmount: number, dataLength: number, axisLength: number, barOptions: BarOptionsCanvas): number {
        let sumSize = dataLength * (elementsInGroupAmount * barOptions.minBarWidth + (elementsInGroupAmount - 1) * barOptions.barDistance + barOptions.groupMinDistance);
        while(dataLength !== 0 && axisLength < sumSize) {
            dataLength--;
            // find whole space for bars in group + distance between bars + group distance
            sumSize = dataLength * (elementsInGroupAmount * barOptions.minBarWidth + (elementsInGroupAmount - 1) 
                * barOptions.barDistance + barOptions.groupMinDistance);
        }
        
        return dataLength;
    }
}