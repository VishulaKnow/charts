import { Size } from "../../../config/config";
import { AxisModelOptions, BlockMargin } from "../../../model/model";
import { GridLineType } from "./gridLine";

export class gridLineHeler{
    public static getGridLineLength(gridLineType: GridLineType, keyAxis: AxisModelOptions, valueAxis: AxisModelOptions, blockSize: Size, margin: BlockMargin): number {
        let axis: AxisModelOptions;
        let axisLength: number;

        if(gridLineType === 'key')
            axis = keyAxis;
        else    
            axis = valueAxis;

        if(axis.orient === 'left' || axis.orient === 'right')
            axisLength = blockSize.width - margin.left - margin.right;
        else
            axisLength = blockSize.height - margin.top - margin.bottom;

        if(axis.orient === 'right' || axis.orient === 'bottom')
            axisLength = -axisLength;
        return axisLength;
    }
}