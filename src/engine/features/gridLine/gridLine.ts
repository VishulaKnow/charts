import { AxisModelOptions, BlockMargin, GridLineFlag, ScaleKeyModel, Size } from "../../../model/model";
import { Block } from "../../block/block";

type GridLineType = 'key' | 'value';
interface GridLineAttributes {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export class GridLine
{
    private static gridLineClass = 'grid-line';

    public static render(block: Block, gridLineFlag: GridLineFlag, keyAxis: AxisModelOptions, valueAxis: AxisModelOptions, blockSize: Size, margin: BlockMargin, scaleKey: ScaleKeyModel): void {
        if(gridLineFlag.value) {
            const lineLength = this.getGridLineLength('value', keyAxis, valueAxis, blockSize, margin);
            const lineAttributes = this.getLineAttributes(valueAxis, lineLength);
            this.renderLine(block, valueAxis, lineAttributes);
        } 
        if(gridLineFlag.key) {
            const lineLength = this.getGridLineLength('key', keyAxis, valueAxis, blockSize, margin);
            const lineAttributes = this.getLineAttributes(keyAxis, lineLength);
            this.renderLine(block, keyAxis, lineAttributes);
            if(scaleKey.type === 'point')
                this.removeGridLineOnValueAxis(block, keyAxis, valueAxis);
        }
    }

    public static rerender(block: Block, gridLineFlag: GridLineFlag, keyAxis: AxisModelOptions, valueAxis: AxisModelOptions, blockSize: Size, margin: BlockMargin, scaleKey: ScaleKeyModel): void {
        this.clear(block, keyAxis.cssClass, valueAxis.cssClass);
        this.render(block, gridLineFlag, keyAxis, valueAxis, blockSize, margin, scaleKey);
    }

    private static renderLine(block: Block, axis: AxisModelOptions, lineAttributes: GridLineAttributes): void {
        block
            .getSvg()
            .selectAll(`.${axis.cssClass}`)
            .selectAll('g.tick')
            .append('line')
            .attr('class', this.gridLineClass)
            .attr('x1', lineAttributes.x1)
            .attr('y1', lineAttributes.y1)
            .attr('x2', lineAttributes.x2)
            .attr('y2', lineAttributes.y2)
            .attr('shape-rendering', 'crispEdges');
    }

    private static getLineAttributes(axis: AxisModelOptions, lineLength: number): GridLineAttributes {
        const attributes: GridLineAttributes = {
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

    private static clear(block: Block, keyAxisClass: string, valueAxisClass: string): void {
        block.getSvg()
            .select(`.${keyAxisClass}, .${valueAxisClass}`)
            .selectAll('g.tick')
            .selectAll(`.${this.gridLineClass}`)
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

    private static removeGridLineOnValueAxis(block: Block, keyAxis: AxisModelOptions, valueAxis: AxisModelOptions): void {
        if(valueAxis.orient === 'left') {           
            block.getSvg()
                .select(`.${keyAxis.cssClass}`)
                .select('g.tick')
                .select(`.${this.gridLineClass}`)
                .remove();
        } else if(valueAxis.orient === 'right') {
            block.getSvg()
                .select(`.${keyAxis.cssClass}`)
                .select('g.tick:last-of-type')
                .select(`.${this.gridLineClass}`)
                .remove();
        }
    }
}