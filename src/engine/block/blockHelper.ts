import { BlockMargin, Size } from "../../model/model";

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
            width: blockSize.width - margin.left - margin.right,
            height: blockSize.height - margin.top - margin.bottom
        }
    }
}