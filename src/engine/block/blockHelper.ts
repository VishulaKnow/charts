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
            x: margin.left,
            y: margin.top,
            width: ValueFormatter.getValueOrZero(blockSize.width - margin.left - margin.right),
            height: ValueFormatter.getValueOrZero(blockSize.height - margin.top - margin.bottom)
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