import { BlockMargin, Size } from "../../model/model";
import { ValueFormatter } from "../valueFormatter";

export interface GAttributes {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class BlockHelper
{
    public static getChartBlockAttributes(blockSize: Size, margin: BlockMargin): GAttributes {
        return {
            x: margin.left - 2,
            y: margin.top - 2,
            width: ValueFormatter.getValueOrZero(blockSize.width - margin.left - margin.right) + 4,
            height: ValueFormatter.getValueOrZero(blockSize.height - margin.top - margin.bottom) + 4
        }
    }

    public static getFormattedCssClassesForWrapper(cssClasses: string[]): string[] {
        const wrapperClasses: string[] = [];
        cssClasses.forEach(cssClass =>{
            wrapperClasses.push(cssClass + '-wrapper');
        });
        
        return wrapperClasses
    }
}