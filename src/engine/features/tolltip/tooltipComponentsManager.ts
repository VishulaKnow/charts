import { Selection, BaseType } from 'd3-selection';
import { Block } from "../../block/block";
import { ARROW_DEFAULT_POSITION, ARROW_SIZE, TooltipCoordinate, TooltipLineAttributes } from "./tooltipDomHelper";
import { ChartOrientation } from "../../../config/config";
import { easeLinear } from 'd3-ease';
import { interrupt } from 'd3-transition';
import { Tooltip } from './tooltip';

export class TooltipComponentsManager {
    public static showTooltipBlock(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): void {
        tooltipBlock.style('display', 'block');
    }

    public static hideTooltipBlock(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): void {
        tooltipBlock.style('display', 'none');
    }

    public static renderTooltipWrapper(block: Block): void {
        let tooltipWrapper = block.getWrapper()
            .select(`.${Tooltip.tooltipWrapperClass}`);

        if (tooltipWrapper.empty())
            block.getWrapper()
                .append('div')
                .attr('class', Tooltip.tooltipWrapperClass);
    }

    public static renderTooltipBlock(block: Block, translateX: number = 0, translateY: number = 0): Selection<HTMLElement, unknown, HTMLElement, any> {
        const wrapper = block.getWrapper().select<HTMLElement>(`.${Tooltip.tooltipWrapperClass}`);

        let tooltipBlock = wrapper.select<HTMLElement>(`.${Tooltip.tooltipBlockClass}`);
        if (tooltipBlock.empty()) {
            tooltipBlock = wrapper
                .append('div')
                .attr('class', Tooltip.tooltipBlockClass)
                .style('position', 'absolute')
                .style('display', 'none');
        }

        if (translateX !== 0 || translateY !== 0)
            tooltipBlock.style('transform', `translate(${translateX}px, ${translateY}px)`);

        return tooltipBlock;
    }

    public static renderTooltipContentBlock(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): Selection<HTMLDivElement, unknown, HTMLElement, any> {
        let tooltipContentBlock = tooltipBlock.select<HTMLDivElement>(`.${Tooltip.tooltipContentClass}`);

        if (tooltipContentBlock.empty())
            tooltipContentBlock = tooltipBlock.append('div')
                .attr('class', Tooltip.tooltipContentClass);

        return tooltipContentBlock;
    }

    public static renderTooltipLine(block: Block): Selection<SVGLineElement, unknown, HTMLElement, any> {
        let tooltipLine = block.getChartBlock()
            .select<SVGLineElement>(`.${Tooltip.tooltipLineClass}`)

        if (tooltipLine.empty())
            tooltipLine = block.getChartBlock()
                .append('line')
                .attr('class', Tooltip.tooltipLineClass)
                .lower();

        return tooltipLine;
    }

    public static showTooltipLine(tooltipLine: Selection<SVGLineElement, unknown, HTMLElement, any>): void {
        tooltipLine.style('display', 'block');
    }

    public static hideTooltipLine(tooltipLine: Selection<SVGLineElement, unknown, HTMLElement, any>): void {
        tooltipLine.style('display', 'none');
    }

    public static setTooltipLineAttributes(tooltipLine: Selection<SVGLineElement, unknown, HTMLElement, any>, attributes: TooltipLineAttributes, transition: number): void {
        interrupt(tooltipLine.node());

        if (transition > 0 && tooltipLine.style('display') === 'block') {
            tooltipLine
                .interrupt()
                .transition()
                .duration(transition)
                .ease(easeLinear)
                .attr('x1', attributes.x1)
                .attr('x2', attributes.x2)
                .attr('y1', attributes.y1)
                .attr('y2', attributes.y2);
        } else {
            tooltipLine
                .attr('x1', attributes.x1)
                .attr('x2', attributes.x2)
                .attr('y1', attributes.y1)
                .attr('y2', attributes.y2);
        }
    }

    public static renderTooltipArrow(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): Selection<BaseType, unknown, HTMLElement, any> {
        let arrowSize: number = ARROW_SIZE / 2;
        let tooltipArrow = tooltipBlock.select(`.${Tooltip.tooltipArrowClass}`);
        if (tooltipArrow.empty())
            tooltipArrow = tooltipBlock
                .append('div')
                .attr('class', Tooltip.tooltipArrowClass)
                .style('position', 'absolute')
                .style('left', `${ARROW_DEFAULT_POSITION}px`)
                .style('border-top-width', `${arrowSize}px`)
                .style('border-right-width', `${arrowSize}px`)
                .style('border-bottom-width', `0px`)
                .style('border-left-width', `${arrowSize}px`);

        return tooltipArrow;
    }

    public static setBlockCoordinate(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>, tooltipCoordinate: TooltipCoordinate): void {
        tooltipBlock
            .style('right', tooltipCoordinate.right)
            .style('bottom', tooltipCoordinate.bottom)
            .style('left', tooltipCoordinate.left)
            .style('top', tooltipCoordinate.top);
    }

    public static setLineTooltipCoordinate(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>, tooltipCoordinate: TooltipCoordinate, chartOrientation: ChartOrientation, transition: number = null): void {
        interrupt(tooltipBlock.node());

        if (!transition || transition <= 0)
            this.setBlockCoordinate(tooltipBlock, tooltipCoordinate);

        if (chartOrientation === 'vertical' && tooltipBlock.style('left') !== '0px' && tooltipBlock.style('right') !== '0px' && tooltipCoordinate.right !== '0px' && tooltipCoordinate.left !== null) {
            tooltipBlock
                .style('right', tooltipCoordinate.right)
                .style('bottom', tooltipCoordinate.bottom)
                .style('top', tooltipCoordinate.top)
                .interrupt()
                .transition()
                .duration(transition)
                .ease(easeLinear)
                .style('left', tooltipCoordinate.left);
        } else if (chartOrientation === 'horizontal' && tooltipBlock.style('top') !== '0px' && parseInt(tooltipBlock.style('bottom')) > 0 && tooltipCoordinate.bottom === null) {
            tooltipBlock
                .style('left', tooltipCoordinate.left)
                .style('bottom', tooltipCoordinate.bottom)
                .style('right', tooltipCoordinate.right)
                .interrupt()
                .transition()
                .duration(transition)
                .ease(easeLinear)
                .style('top', tooltipCoordinate.top);
        } else {
            this.setBlockCoordinate(tooltipBlock, tooltipCoordinate);
        }
    }
}