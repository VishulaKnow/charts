import { Config, PolarChart, TwoDimensionalChart, IntervalOptions, IntervalChart } from "../config/config";
import { BarOptionsCanvas, DataType, DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { BlockMargin, DataRow, DataScope, DataSource, IntervalChartModel, Model, PolarChartModel, TwoDimensionalChartModel } from "./model";
import { ModelHelper } from "./modelHelper";

export class DataManagerModel
{
    public static getScopedDataLength(data: DataSource, dataSource: string, hidedRecordsAmount: number): number {
        return data[dataSource].length - hidedRecordsAmount;
    }

    public static getScopedChartData(data: DataRow[], allowableKeys: string[], keyFieldName: string): DataRow[] {
        return data.filter(d => allowableKeys.includes(d[keyFieldName]));
    }

    public static getPreparedData(data: DataSource, allowableKeys: string[], config: Config): DataSource {
        const scopedData = this.getScopedData(data, allowableKeys, config);
        this.setDataType(scopedData, config);
        return scopedData;
    }

    public static getScopedData(data: DataSource, allowableKeys: string[], config: Config): DataSource {
        const newData: DataSource = {};
        config.options.charts.forEach((chart: TwoDimensionalChart | PolarChart | IntervalChart) => {
            newData[chart.data.dataSource] = this.getScopedChartData(data[chart.data.dataSource], allowableKeys, chart.data.keyField.name);
        });
        return newData;
    }

    public static getDataScope(config: Config, margin: BlockMargin, data: DataSource, designerConfig: DesignerConfig): DataScope {
        if(config.options.type === '2d') {
            const barCharts = config.options.charts.filter((chart: TwoDimensionalChart) => chart.type === 'bar');
            if(barCharts.length !== 0) {
                const axisLength = AxisModel.getAxisLength(barCharts[0].orientation, margin, config.canvas.size);
                const dataLength = data[barCharts[0].data.dataSource].length;
                const limit = this.getDataLimitByBarSize(barCharts.length, dataLength, axisLength, designerConfig.canvas.chartOptions.bar);
                const allowableKeys = this.getDataValuesByKeyField(data, barCharts[0]).slice(0, limit);
                
                return {
                    allowableKeys,
                    hidedRecordsAmount: dataLength - allowableKeys.length
                }
            }
            return {
                allowableKeys: this.getDataValuesByKeyField(data, config.options.charts[0]),
                hidedRecordsAmount: 0   
            }
        } else if(config.options.type === 'polar') {
            const dataset = data[config.options.charts[0].data.dataSource];
            const valueField = config.options.charts[0].data.valueField.name;
            const keyField = config.options.charts[0].data.keyField.name;
            
            const values = dataset.map((dataRow: DataRow) => dataRow[valueField]);
            const radius = ModelHelper.getDonutRadius(margin, config.canvas.size);
            let sum = ModelHelper.getValuesSum(values);

            const allowableKeys: string[] = [];

            if(radius <= 0) {
                return {
                    allowableKeys,
                    hidedRecordsAmount: dataset.length
                }
            }   

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
        } else if(config.options.type === 'interval') {
            return {
                allowableKeys: this.getDataValuesByKeyField(data, config.options.charts[0]),
                hidedRecordsAmount: 0   
            }
        }
    }

    public static getDataValuesByKeyField(data: DataSource, chart: TwoDimensionalChart | PolarChart | IntervalChart): string[] {
        return data[chart.data.dataSource].map(dataRow => dataRow[chart.data.keyField.name]);
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

    private static getDataLimitByBarSize(chartsAmount: number, dataLength: number, axisLength: number, barOptions: BarOptionsCanvas): number {
        let sumSize = dataLength * (chartsAmount * barOptions.minBarWidth + (chartsAmount - 1) * barOptions.barDistance + barOptions.groupDistance);
        while(dataLength !== 0 && axisLength < sumSize) {
            dataLength--;
            sumSize = dataLength * (chartsAmount * barOptions.minBarWidth + (chartsAmount - 1) * barOptions.barDistance + barOptions.groupDistance);
        }
        return dataLength;
    }
}