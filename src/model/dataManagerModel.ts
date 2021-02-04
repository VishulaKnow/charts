import { Config, PolarChart, TwoDimensionalChart, IntervalOptions, IntervalChart, TwoDimensionalOptions, PolarOptions } from "../config/config";
import { BarOptionsCanvas, DataType, DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { BlockMargin, DataRow, DataScope, DataSource, Size } from "./model";
import { ModelHelper } from "./modelHelper";

export class DataManagerModel
{
    public static getPreparedData(data: DataSource, allowableKeys: string[], config: Config): DataSource {
        const scopedData = this.getScopedData(data, allowableKeys, config);
        this.setDataType(scopedData, config);
        
        return scopedData;
    }

    public static getDataScope(config: Config, margin: BlockMargin, data: DataSource, designerConfig: DesignerConfig): DataScope {
        if(config.options.type === '2d' || config.options.type === 'interval') {
            return this.getDataScopeFor2D(config.options, config.canvas.size, margin, data, designerConfig);
        } else if(config.options.type === 'polar') {
            return this.getDataScopeForPolar(config.options, config.canvas.size, margin, data, designerConfig);
        }
    }

    public static getDataValuesByKeyField(data: DataSource, chart: TwoDimensionalChart | PolarChart | IntervalChart): string[] {
        return data[chart.data.dataSource].map(dataRow => dataRow[chart.data.keyField.name]);
    }

    public static getElementsInGroupAmount(configOptions: TwoDimensionalOptions | IntervalOptions, chartsLength: number): number {
        if(configOptions.type === '2d' && !configOptions.isSegmented) {
            return this.getBarChartsInGroupAmount(configOptions);
        }
        return chartsLength;
    }

    private static getDataScopeFor2D(configOptions: TwoDimensionalOptions | IntervalOptions, blockSize: Size, margin: BlockMargin, data: DataSource, designerConfig: DesignerConfig): DataScope {
        const charts = (configOptions.charts as Array<TwoDimensionalChart | IntervalChart>)
            .filter((chart: TwoDimensionalChart | IntervalChart) => chart.type === 'bar' || chart.type === 'gantt');

        if(charts.length !== 0) {
            const axisLength = AxisModel.getAxisLength(configOptions.orientation, margin, blockSize);
            const uniqueKeys = ModelHelper.getUniqueValues(data[charts[0].data.dataSource].map(d => d[charts[0].data.keyField.name]));
            const dataLength = uniqueKeys.length;
            
            const limit = this.getDataLimitByBarSize(this.getElementsInGroupAmount(configOptions, charts.length), dataLength, axisLength, designerConfig.canvas.chartOptions.bar);
            const allowableKeys = uniqueKeys.slice(0, limit);
            
            return {
                allowableKeys,
                hidedRecordsAmount: dataLength - allowableKeys.length
            }
        }

        return {
            allowableKeys: this.getDataValuesByKeyField(data, configOptions.charts[0]),
            hidedRecordsAmount: 0   
        }
    }

    private static getDataScopeForPolar(configOptions: PolarOptions, blockSize: Size, margin: BlockMargin, data: DataSource, designerConfig: DesignerConfig): DataScope {
        const dataset = data[configOptions.charts[0].data.dataSource];
        const valueField = configOptions.charts[0].data.valueField.name;
        const keyField = configOptions.charts[0].data.keyField.name;
        
        const values = dataset.map((dataRow: DataRow) => dataRow[valueField]);
        const radius = ModelHelper.getDonutRadius(margin, blockSize);
        let sum = ModelHelper.getValuesSum(values);

        if(radius <= 0) {
            return {
                allowableKeys: [],
                hidedRecordsAmount: dataset.length
            }
        }   

        const allowableKeys: string[] = [];     // Only records with these keys will show

        const minAngle = ModelHelper.getMinAngleByLength(designerConfig.canvas.chartOptions.donut.minPartSize, radius);            
        dataset.forEach((dataRow: DataRow) => {
            const angle = ModelHelper.getAngleByValue(dataRow[valueField], sum);
            if(angle > minAngle)
                allowableKeys.push(dataRow[keyField]);
        });
        
        return {
            allowableKeys,
            hidedRecordsAmount: dataset.length - allowableKeys.length 
        }
    }

    private static getBarChartsInGroupAmount(configOptions: TwoDimensionalOptions): number {
        let barAmount = 0;
        configOptions.charts.forEach(chart => {
            if(chart.type === 'bar')
                barAmount += chart.data.valueFields.length;
        });
        return barAmount;
    }

    private static getScopedData(data: DataSource, allowableKeys: string[], config: Config): DataSource {
        const newData: DataSource = {};
        config.options.charts.forEach((chart: TwoDimensionalChart | PolarChart | IntervalChart) => {
            newData[chart.data.dataSource] = this.getScopedChartData(data[chart.data.dataSource], allowableKeys, chart.data.keyField.name);
        });

        return newData;
    }

    private static getScopedChartData(data: DataRow[], allowableKeys: string[], keyFieldName: string): DataRow[] {
        return data.filter(d => allowableKeys.includes(d[keyFieldName]));
    }

    private static setDataType(data: DataSource, config: Config): void {
        if(config.options.type === 'polar' || config.options.type === '2d') {
            config.options.charts.forEach((chart: PolarChart | TwoDimensionalChart) => {
                if(chart.data.keyField.format === 'date') {
                    data[chart.data.dataSource] = this.getTypedData(data[chart.data.dataSource], chart.data.keyField.name, chart.data.keyField.format);
                }
            });
        } else if(config.options.type === 'interval') {
            config.options.charts.forEach((chart: IntervalChart) => {
                if(chart.data.valueField1.format === 'date') {
                    data[chart.data.dataSource] = this.getTypedData(data[chart.data.dataSource], chart.data.valueField1.name, chart.data.valueField1.format);
                }
                if(chart.data.valueField2.format === 'date') {
                    data[chart.data.dataSource] = this.getTypedData(data[chart.data.dataSource], chart.data.valueField2.name, chart.data.valueField2.format);
                }
            });
        }
    }

    private static getTypedData(data: DataRow[], fieldName: string, type: DataType): DataRow[] {
        if(type === 'date')
            data.forEach(d => {
                d[fieldName] = new Date(d[fieldName]);
            });
        return data;
    }

    private static getDataLimitByBarSize(elementsInGroupAmount: number, dataLength: number, axisLength: number, barOptions: BarOptionsCanvas): number {
        let sumSize = dataLength * (elementsInGroupAmount * barOptions.minBarWidth + (elementsInGroupAmount - 1) * barOptions.barDistance + barOptions.groupMinDistance);
        while(dataLength !== 0 && axisLength < sumSize) {
            dataLength--;
            sumSize = dataLength * (elementsInGroupAmount * barOptions.minBarWidth + (elementsInGroupAmount - 1) * barOptions.barDistance + barOptions.groupMinDistance);
        }
        
        return dataLength;
    }
}