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
        const outSize = 5.5;
        return {
            x: margin.left - outSize,
            y: margin.top - outSize,
            width: ValueFormatter.getValueOrZero(blockSize.width - margin.left - margin.right) + outSize * 2,
            height: ValueFormatter.getValueOrZero(blockSize.height - margin.top - margin.bottom) + outSize * 2
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