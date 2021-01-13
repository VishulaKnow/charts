import { BlockMargin, Size } from "./model";

export class ModelHelper
{
    static getValuesSum(values: number[]): number {
        let sum = 0;
        for (let i = 0; i < values.length; i++) {
            sum += values[i];
        }
        return sum;
    }
    
    static getDonutRadius(margin: BlockMargin, blockSize: Size): number {
        return Math.min(blockSize.height - margin.top - margin.bottom, blockSize.width - margin.left - margin.right) / 2;
    }
    
    static getAngleByValue(value: number, valuesSum: number): number {
        return value / valuesSum * 360;
    }
    
    static getMinAngleByLength(minLength: number, radius: number): number {
        return minLength * 360 / (2 * Math.PI * radius);
    }
}