import * as d3 from "d3";
import { AxisModelOptions, BlockMargin, GridLineFlag, Size } from "../../../model/model";

type GridLineType = 'vertical' | 'horizontal';

export class GridLine
{
    static render(gridLineFlag: GridLineFlag, keyAxis: AxisModelOptions, valueAxis: AxisModelOptions, blockSize: Size, margin: BlockMargin): void {
        if(gridLineFlag.vertical) {
            const axisLength = this.getAxisLength('vertical', keyAxis, valueAxis, blockSize, margin);
            const axisClass = this.getAxisClass('vertical', keyAxis, valueAxis);
            this.renderVerticalGridLine(axisClass, axisLength);
        } 
        if(gridLineFlag.horizontal) {
            const axisLength = this.getAxisLength('horizontal', keyAxis, valueAxis, blockSize, margin);
            const axisClass = this.getAxisClass('horizontal', keyAxis, valueAxis);
            this.renderHorizontalGridLine(axisClass, axisLength);
        }
    }

    static renderVerticalGridLine(axisClass: string, axisLength: number): void {
        d3.select(`.${axisClass}`)
            .selectAll('g.tick')
            .append('line')
            .attr('class', 'grid-line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', axisLength);
    }
    
    static renderHorizontalGridLine(axisClass: string, axisLength: number): void {
        d3.select(`.${axisClass}`)
            .selectAll('g.tick')
            .append('line')
            .attr('class', 'grid-line')
            .attr('x1', 0)
            .attr('x2', axisLength)
            .attr('y1', 0)
            .attr('y2', 0);
    }
    
    static getAxisLength(gridLineType: GridLineType, keyAxis: AxisModelOptions, valueAxis: AxisModelOptions, blockSize: Size, margin: BlockMargin): number {
        if(gridLineType === 'vertical') {
            let axisLength = blockSize.height - margin.top - margin.bottom;
            if(keyAxis.orient === 'bottom' || valueAxis.orient === 'bottom')
                axisLength = -axisLength;
            return axisLength;
        } else {
            let axisLength = blockSize.width - margin.left - margin.right;
            if(keyAxis.orient === 'right' || valueAxis.orient === 'right')
                axisLength = -axisLength;
            return axisLength;
        }
    }
    
    static getAxisClass(gridLineType: GridLineType, keyAxis: AxisModelOptions, valueAxis: AxisModelOptions): string {
        if(gridLineType === 'vertical') {
            if(keyAxis.orient === 'bottom' || keyAxis.orient === 'top') {
                return keyAxis.class;
            } else {
                return valueAxis.class
            }
        } else {
            if(keyAxis.orient === 'left' || keyAxis.orient === 'right') {
                return keyAxis.class;
            } else {
                return valueAxis.class
            }
        }
    }
}