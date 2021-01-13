import * as d3 from "d3";
import { AxisPosition, Domain, TwoDimensionalChart } from "../config/config";
import { BlockMargin, DataRow, Size } from "./model";

export enum ScaleType {
    Key, Value
}

export class ScaleModel
{
    static getScaleRangePeek(scaleType: ScaleType, chartOrientation: string, margin: BlockMargin, blockSize: Size): number {
        if(chartOrientation === 'vertical')
            return scaleType === ScaleType.Key 
                ? blockSize.width - margin.left - margin.right
                : blockSize.height - margin.top - margin.bottom;
        return scaleType === ScaleType.Key 
            ? blockSize.height - margin.top - margin.bottom
            : blockSize.width - margin.left - margin.right;
    }
    
    static getScaleDomain(scaleType: ScaleType, configDomain: Domain, data: DataRow[], chart: TwoDimensionalChart, keyAxisPosition: AxisPosition = null, allowableKeys: string[] = []): any[] {
        if(scaleType === ScaleType.Key) {
            return allowableKeys;
        } else {
            let domainPeekMin: number;
            let domainPeekMax: number;
            if(configDomain.start === -1)
                domainPeekMin = 0;
            else
                domainPeekMin = configDomain.start;
            if(configDomain.end === -1)
                domainPeekMax = d3.max(data, d => d[chart.data.valueField.name]);
            else
                domainPeekMax = configDomain.end;
                
            if(chart.orientation === 'horizontal')
                if(keyAxisPosition === 'start')
                    return [domainPeekMin, domainPeekMax];
                else 
                    return [domainPeekMax, domainPeekMin]
            else 
                if(keyAxisPosition === 'start')
                    return [domainPeekMin, domainPeekMax];
                else 
                    return [domainPeekMax, domainPeekMin];
        }
    }
}