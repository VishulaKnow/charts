import { Size } from "../../../config/config";
import { AxisModelOptions, BlockMargin, GridLineFlag, IAxisModel, ScaleKeyModel } from "../../../model/model";
import { Block } from "../../block/block";
import { GridLineAttributes, GridLineHelper } from "./gidLineHelper";

export class GridLine {
    private static readonly gridLineClass = 'grid-line';

    public static render(block: Block, gridLineFlag: GridLineFlag, axes: IAxisModel, blockSize: Size, margin: BlockMargin, scaleKey: ScaleKeyModel): void {
        if (gridLineFlag.value) {
            const lineLength = GridLineHelper.getGridLineLength('value', axes.key, axes.value, blockSize, margin);
            const lineAttributes = GridLineHelper.getLineAttributes(axes.value, lineLength);
            this.renderLine(block, axes.value, lineAttributes);
        }
        if (gridLineFlag.key) {
            const lineLength = GridLineHelper.getGridLineLength('key', axes.key, axes.value, blockSize, margin);
            const lineAttributes = GridLineHelper.getLineAttributes(axes.key, lineLength);
            this.renderLine(block, axes.key, lineAttributes);
        }
        if (scaleKey.type === 'point' && (gridLineFlag.key || gridLineFlag.value))
            this.removeGridLinesOnAxes(block, axes.key, axes.value, false);
        else if (gridLineFlag.key || gridLineFlag.value)
            this.removeGridLinesOnAxes(block, axes.key, axes.value, true);
    }

    public static update(block: Block, gridLineFlag: GridLineFlag, axes: IAxisModel, blockSize: Size, margin: BlockMargin, scaleKey: ScaleKeyModel): void {
        this.clear(block, axes.key.cssClass, axes.value.cssClass);
        this.render(block, gridLineFlag, axes, blockSize, margin, scaleKey);
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
            .attr('y2', lineAttributes.y2);

    }

    private static clear(block: Block, keyAxisClass: string, valueAxisClass: string): void {
        block.getSvg()
            .selectAll(`.${keyAxisClass} `)
            .selectAll('g.tick')
            .selectAll(`.${this.gridLineClass}`)
            .remove();
        block.getSvg()
            .selectAll(`.${valueAxisClass}`)
            .selectAll('g.tick')
            .selectAll(`.${this.gridLineClass}`)
            .remove();
    }

    private static removeGridLinesOnAxes(block: Block, keyAxis: AxisModelOptions, valueAxis: AxisModelOptions, excludeKey: boolean): void {
        let tickOnKeyAxisSelector = '';
        let tickOnValueAxisSelector = '';

        if (valueAxis.orient === 'right' || valueAxis.orient === 'bottom')
            tickOnValueAxisSelector = ':last-of-type';
        if (keyAxis.orient === 'bottom' || keyAxis.orient === 'right')
            tickOnKeyAxisSelector = ':last-of-type';

        block.getSvg()
            .select(`.${valueAxis.cssClass}`)
            .select(`g.tick${tickOnKeyAxisSelector}`)
            .select(`.${this.gridLineClass}`)
            .remove();

        if (!excludeKey)
            block.getSvg()
                .select(`.${keyAxis.cssClass}`)
                .select(`g.tick${tickOnValueAxisSelector}`)
                .select(`.${this.gridLineClass}`)
                .remove();
    }
}