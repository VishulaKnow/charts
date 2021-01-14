import { line } from "d3";
import { AxisModel } from "../../../model/axisModel";
import { AxisModelOptions, BlockMargin, GridLineFlag, Size } from "../../../model/model";
import { SvgBlock } from "../../svgBlock/svgBlock";

type GridLineType = 'key' | 'value';
interface LineAttributes {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export class GridLine
{
    public static render(gridLineFlag: GridLineFlag, keyAxis: AxisModelOptions, valueAxis: AxisModelOptions, blockSize: Size, margin: BlockMargin): void {
        if(gridLineFlag.value) {
            const lineLength = this.getGridLineLength('value', keyAxis, valueAxis, blockSize, margin);
            const lineAttributes = this.getLineAttributes(valueAxis, lineLength);
            this.renderLine(valueAxis, lineAttributes);
        } 
        if(gridLineFlag.key) {
            const lineLength = this.getGridLineLength('key', keyAxis, valueAxis, blockSize, margin);
            const lineAttributes = this.getLineAttributes(keyAxis, lineLength);
            this.renderLine(keyAxis, lineAttributes);
        }
    }

    public static rerender(gridLineFlag: GridLineFlag, keyAxis: AxisModelOptions, valueAxis: AxisModelOptions, blockSize: Size, margin: BlockMargin): void {
        this.clear(keyAxis.class, valueAxis.class);
        this.render(gridLineFlag, keyAxis, valueAxis, blockSize, margin);
    }

    private static renderLine(axis: AxisModelOptions, lineAttributes: LineAttributes): void {
        SvgBlock
            .getSvg()
            .selectAll(`.${axis.class}`)
            .selectAll('g.tick')
            .append('line')
            .attr('class', 'grid-line')
            .attr('x1', lineAttributes.x1)
            .attr('y1', lineAttributes.y1)
            .attr('x2', lineAttributes.x2)
            .attr('y2', lineAttributes.y2);
    }

    private static getLineAttributes(axis: AxisModelOptions, lineLength: number): LineAttributes {
        const attributes: LineAttributes = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0
        }
        if(axis.orient === 'left' || axis.orient === 'right')
            attributes.x2 = lineLength;
        else
            attributes.y2 = lineLength;
        return attributes;
    }

    private static clear(keyAxisClass: string, valueAxisClass: string): void {
        SvgBlock.getSvg()
            .select(`.${keyAxisClass}, .${valueAxisClass}`)
            .selectAll('g.tick')
            .selectAll('.grid-line')
            .remove();
    }
    
    private static getGridLineLength(gridLineType: GridLineType, keyAxis: AxisModelOptions, valueAxis: AxisModelOptions, blockSize: Size, margin: BlockMargin): number {
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