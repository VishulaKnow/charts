import { Size } from "../../../config/config";
import { AdditionalElementsOptions, AxisModelOptions, BlockMargin, GridLineFlag, GridLineOptions, IAxisModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Scales } from "../scale/scale";
import { GridLineAttributes, GridLineHelper } from "./gidLineHelper";
import { Selection, BaseType } from "d3-selection";

export class GridLine {
    private static readonly gridLineClass = 'grid-line';

    public static render(block: Block, options: GridLineOptions, axes: IAxisModel, blockSize: Size, margin: BlockMargin, scales: Scales): void {
        if (options.flag.value) {
            const lineLength = GridLineHelper.getGridLineLength('value', axes.key, axes.value, blockSize, margin);
            const lineAttributes = GridLineHelper.getLineAttributes(axes.value, lineLength);
            this.renderLine(block, axes.value, lineAttributes, options)
                .style('display', (d, i, group) => {
                    return d === 0 ? 'none' : 'block';
                });
        }
        if (options.flag.key) {
            const lineAttributes = GridLineHelper.getKeyLineAttributes(axes.key, scales.value);
            this.renderLine(block, axes.key, lineAttributes, options);
        }

        this.removeGridLinesOnAxes(block, axes.key, axes.value, true);
    }

    public static update(block: Block, options: GridLineOptions, axes: IAxisModel, blockSize: Size, margin: BlockMargin, scales: Scales): void {
        this.clear(block, axes.key.cssClass, axes.value.cssClass);
        this.render(block, options, axes, blockSize, margin, scales);
    }

    private static renderLine(block: Block, axis: AxisModelOptions, lineAttributes: GridLineAttributes, options: GridLineOptions): Selection<SVGLineElement, unknown, BaseType, unknown> {
        const gridLine = block
            .getSvg()
            .selectAll(`.${axis.cssClass}`)
            .selectAll('g.tick')
            .append('line')
            .attr('class', this.gridLineClass)
            .attr('x1', lineAttributes.x1)
            .attr('y1', lineAttributes.y1)
            .attr('x2', lineAttributes.x2)
            .attr('y2', lineAttributes.y2);

        if (options.styles.dash.on)
            gridLine.style('stroke-dasharray', 3);

        return gridLine;
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

        const tickOnKey = block.getSvg()
            .select(`.${valueAxis.cssClass}`)
            .select(`g.tick${tickOnKeyAxisSelector}`);
        const tickOnValue = block.getSvg()
            .select(`.${keyAxis.cssClass}`)
            .select(`g.tick${tickOnValueAxisSelector}`)


        // this.rmGridLineOnTick(tickOnKey);
        // if (!excludeKey)
        //     this.rmGridLineOnTick(tickOnValue);
    }

    private static rmGridLineOnTick(tick: Selection<BaseType, unknown, HTMLElement, any>) {
        tick
            .select(`.${this.gridLineClass}`)
            .remove();
    }
}