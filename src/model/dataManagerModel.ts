import { Config, TwoDimensionalChart } from "../config/config";
import { BarOptionsCanvas, DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { BlockMargin, DataRow, DataScope, DataSource } from "./model";
import { ModelHelper } from "./modelHelper";

export class DataManagerModel
{
    static getDataLimitByBarSize(chartsAmount: number, dataLength: number, axisLength: number, barOptions: BarOptionsCanvas): number {
        let sumSize = dataLength * (chartsAmount * barOptions.minBarWidth + (chartsAmount - 1) * barOptions.barDistance + barOptions.groupDistance);
        while(dataLength !== 0 && axisLength < sumSize) {
            dataLength--;
            sumSize = dataLength * (chartsAmount * barOptions.minBarWidth + (chartsAmount - 1) * barOptions.barDistance + barOptions.groupDistance);
        }
        return dataLength;
    }
    
    static getDataScope(config: Config, margin: BlockMargin, data: DataSource, designerConfig: DesignerConfig): DataScope {
        if(config.options.type === '2d') {
            const barCharts = config.options.charts.filter((chart: TwoDimensionalChart) => chart.type === 'bar');
            if(barCharts.length !== 0) {
                const axisLength = AxisModel.getAxisLength(barCharts[0].orientation, margin, config.canvas.size);
                const dataLength = data[barCharts[0].data.dataSource].length;
                
                const limit = this.getDataLimitByBarSize(config.options.charts.filter((chart: TwoDimensionalChart) => chart.type === 'bar').length,
                    dataLength, 
                    axisLength, 
                    designerConfig.canvas.chartOptions.bar);
    
                const allowableKeys: string[] = data[barCharts[0].data.dataSource].slice(0, limit).map((d: DataRow) => d[barCharts[0].data.keyField.name]);
                return {
                    allowableKeys,
                    hidedRecordsAmount: dataLength - allowableKeys.length
                }
            }
            return {
                allowableKeys: data[config.options.charts[0].data.dataSource].map((d: DataRow) => d[config.options.charts[0].data.keyField.name]),
                hidedRecordsAmount: 0   
            }
        } else {
            const dataset = data[config.options.charts[0].data.dataSource];
            const valueField = config.options.charts[0].data.valueField.name;
            const keyField = config.options.charts[0].data.keyField.name;
            
            const values = dataset.map((dataRow: DataRow) => dataRow[valueField]);
            let sum = ModelHelper.getValuesSum(values);
            const radius = ModelHelper.getDonutRadius(margin, config.canvas.size);
            const minAngle = ModelHelper.getMinAngleByLength(designerConfig.canvas.chartOptions.donut.minPartSize, radius);
            
            const allowableKeys: string[] = [];
            dataset.forEach((dataRow: DataRow) => {
                const angle = ModelHelper.getAngleByValue(dataRow[valueField], sum);
                if(angle > minAngle)
                    allowableKeys.push(dataRow[keyField])
            });
            return {
                allowableKeys,
                hidedRecordsAmount: dataset.length - allowableKeys.length 
            };
        }
    }

    static getDataLength(data: DataSource, dataSource: string, hidedRecordsAmount: number): number {
        return data[dataSource].length - hidedRecordsAmount;
    }
}