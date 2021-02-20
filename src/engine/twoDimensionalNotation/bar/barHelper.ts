import { BarChartSettings, BlockMargin, DataRow, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Scale, Scales } from "../../features/scale/scale";
import { ValueFormatter } from "../../valueFormatter";

export interface BarAttrs {
    x: (dataRow: DataRow) => number;
    y: (dataRow: DataRow) => number;
    width: (dataRow: DataRow) => number;
    height: (dataRow: DataRow) => number;
}

export class BarHelper
{
    public static getGroupedBarAttrsByKeyOrient(block: Block, axisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, blockSize: Size, barIndex: number, barsAmount: number, barSettings: BarChartSettings, barItemCssClass: string): BarAttrs {
        const barDistance = barSettings.barDistance;
        const barStep = (Scale.getScaleWidth(scales.scaleKey) - barDistance * (barsAmount - 1)) / barsAmount; // Space for one bar
        const barSize = barStep > barSettings.maxBarWidth ? barSettings.maxBarWidth : barStep;
        const barDiff = (barStep - barSize) * barsAmount / 2; // if bar bigger than maxWidth, diff for x coordinate

        const attrs: BarAttrs = {
            x: null,
            y: null,
            width: null,
            height: null
        }

        if(axisOrient === 'top' || axisOrient === 'bottom') {
            attrs.x = d => scales.scaleKey(d[keyField]) + margin.left + barSize * barIndex + barDistance * barIndex + barDiff;
            attrs.width = d => barSize;
        }
        if(axisOrient === 'left' || axisOrient === 'right') {
            attrs.y = d => scales.scaleKey(d[keyField]) + margin.top + barSize * barIndex + barDistance * barIndex + barDiff;
            attrs.height = d => barSize;
        }
        
        if(axisOrient === 'top') {
            attrs.y = d => margin.top;
            attrs.height = d => ValueFormatter.getValueOrZero(scales.scaleValue(d[valueField]));
        } 
        else if(axisOrient === 'bottom') {
            attrs.y = d => scales.scaleValue(d[valueField]) + margin.top;
            attrs.height = d => ValueFormatter.getValueOrZero(blockSize.height - margin.top - margin.bottom - scales.scaleValue(d[valueField]));
        }   
        else if(axisOrient === 'left') {
            attrs.x = d => margin.left + 1;
            attrs.width = d => ValueFormatter.getValueOrZero(scales.scaleValue(d[valueField]));
        }    
        else if(axisOrient === 'right') {
            attrs.x = d => scales.scaleValue(d[valueField]) + margin.left;
            attrs.width = d => ValueFormatter.getValueOrZero(blockSize.width - margin.left - margin.right - scales.scaleValue(d[valueField]));
        }

        return attrs;
    }

    public static getStackedBarAttrByKeyOrient(axisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, blockSize: Size, barIndex: number, barsAmount: number, barSettings: BarChartSettings): BarAttrs {
        const barDistance = barSettings.barDistance;
        const barStep = (Scale.getScaleWidth(scales.scaleKey) - barDistance * (barsAmount - 1)) / barsAmount; // Space for one bar
        const barSize = barStep > barSettings.maxBarWidth ? barSettings.maxBarWidth : barStep;
        const barDiff = (barStep - barSize) * barsAmount / 2; // if bar bigger than maxWidth, diff for x coordinate

        const attrs: BarAttrs = {
            x: null,
            y: null,
            width: null,
            height: null
        }

        if(axisOrient === 'top' || axisOrient === 'bottom') {
            attrs.x = d => scales.scaleKey(d.data[keyField]) + margin.left + barSize * barIndex + barDistance * barIndex + barDiff;
            attrs.width = d => barSize;
        }
        if(axisOrient === 'left' || axisOrient === 'right') {
            attrs.y = d => scales.scaleKey(d.data[keyField]) + margin.top + barSize * barIndex + barDistance * barIndex + barDiff;
            attrs.height = d => barSize;
        }
        
        if(axisOrient === 'top') {
            attrs.y = d => margin.top + scales.scaleValue(d[0]);
            attrs.height = d => ValueFormatter.getValueOrZero(scales.scaleValue(d[1] - d[0]));
        }
        if(axisOrient === 'bottom') {
            attrs.y = d => scales.scaleValue(d[1]) + margin.top;
            attrs.height = d => blockSize.height - margin.top - margin.bottom - scales.scaleValue(d[1] - d[0]);
        }
        if(axisOrient === 'left') {
            attrs.x = d => margin.left + scales.scaleValue(d[0]) + 1;
            attrs.width = d => ValueFormatter.getValueOrZero(scales.scaleValue(d[1] - d[0]));
        }
        if(axisOrient === 'right') {
            attrs.x = d => scales.scaleValue(d[1]) + margin.left;
            attrs.width = d => ValueFormatter.getValueOrZero(blockSize.width - margin.left - margin.right - scales.scaleValue(d[1] - d[0]));
        }

        return attrs;
    }

    public static getBarsInGroupAmount(charts: TwoDimensionalChartModel[]): number[] {
        let amounts: number[] = [];
        charts.forEach((chart, i) => {
            if(chart.type === 'bar' && chart.isSegmented)
                amounts.push(1) // Сегментированный бар содержит все свои valueFields в одном баре
            else if(chart.type === 'bar')
                amounts.push(chart.data.valueFields.length);
        });
        return amounts;
    }

    public static getBarIndex(barsAmounts: number[], chartIndex: number): number {
        if(barsAmounts.length < 2)
            return 0;
            
        let index = 0;
        barsAmounts.forEach((chartBars, i) => {
            if(i < chartIndex) {
                index += chartBars;
            }
        });
        return index;
    }
}