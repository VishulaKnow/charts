import { Selection, BaseType, select } from "d3-selection";
import { Block } from "../../block/block";
import { ARROW_DEFAULT_POSITION, ARROW_SIZE, TooltipLineAttributes } from "./tooltipDomHelper";
import { ChartOrientation } from "../../../config/config";
import { easeLinear } from "d3-ease";
import { interrupt } from "d3-transition";
import { Tooltip } from "./tooltip";
import { NewTooltip, TooltipCoordinate } from "./newTooltip/newTooltip";

export class TooltipComponentsManager {
	public static showComponent(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): void {
		tooltipBlock.style("display", "block");
	}

	public static hideComponent(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): void {
		tooltipBlock.style("display", "none");
	}

	public static renderTooltipWrapper(block: Block): void {
		let tooltipWrapper = block.getWrapper().select(`.${Tooltip.tooltipWrapperClass}`);

		if (tooltipWrapper.empty()) block.getWrapper().append("div").attr("class", Tooltip.tooltipWrapperClass);
	}

	public static renderTooltipBlock(block: Block, translateX: number = 0, translateY: number = 0) {
		const wrapper = block.getWrapper().select<HTMLElement>(`.${Tooltip.tooltipWrapperClass}`);

		const tooltipService = new NewTooltip();
		let tooltipBlock = tooltipService.findInWrapper(wrapper);
		if (tooltipBlock.empty()) {
			tooltipBlock = tooltipService.render(wrapper);
			tooltipBlock.style("position", "absolute").style("display", "none");
		}

		if (translateX !== 0 || translateY !== 0)
			tooltipBlock.style("transform", `translate(${translateX}px, ${translateY}px)`);

		return tooltipService;
	}

	public static renderTooltipContentBlock(
		tooltipBlock: NewTooltip
	): Selection<HTMLDivElement, unknown, HTMLElement, any> {
		let tooltipContentBlock = tooltipBlock.getEl().select<HTMLDivElement>(`.${Tooltip.tooltipContentClass}`);

		if (tooltipContentBlock.empty()) {
			tooltipContentBlock = select(document.createElement("div")).attr("class", Tooltip.tooltipContentClass);
			tooltipBlock.appendContent(tooltipContentBlock.node());
		}

		return tooltipContentBlock;
	}

	public static renderTooltipLine(block: Block): Selection<SVGLineElement, unknown, HTMLElement, any> {
		let tooltipLine = block.svg.getChartBlock().select<SVGLineElement>(`.${Tooltip.tooltipLineClass}`);

		if (tooltipLine.empty())
			tooltipLine = block.svg.getChartBlock().append("line").attr("class", Tooltip.tooltipLineClass).lower();

		return tooltipLine;
	}

	public static setTooltipLineAttributes(
		tooltipLine: Selection<SVGLineElement, unknown, HTMLElement, any>,
		attributes: TooltipLineAttributes,
		transition: number
	): void {
		interrupt(tooltipLine.node());

		if (transition > 0 && tooltipLine.style("display") === "block") {
			tooltipLine
				.interrupt()
				.transition()
				.duration(transition)
				.ease(easeLinear)
				.attr("x1", attributes.x1)
				.attr("x2", attributes.x2)
				.attr("y1", attributes.y1)
				.attr("y2", attributes.y2);
		} else {
			tooltipLine
				.attr("x1", attributes.x1)
				.attr("x2", attributes.x2)
				.attr("y1", attributes.y1)
				.attr("y2", attributes.y2);
		}
	}

	public static getLineWidth(tooltipLine: Selection<BaseType, any, BaseType, any>): number {
		return parseFloat(tooltipLine.style("stroke-width"));
	}

	public static renderTooltipArrow(
		tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>
	): Selection<BaseType, unknown, HTMLElement, any> {
		let arrowSize: number = ARROW_SIZE / 2;
		let tooltipArrow = tooltipBlock.select(`.${Tooltip.tooltipArrowClass}`);
		if (tooltipArrow.empty())
			tooltipArrow = tooltipBlock
				.append("div")
				.attr("class", Tooltip.tooltipArrowClass)
				.style("position", "absolute")
				.style("left", `${ARROW_DEFAULT_POSITION}px`)
				.style("border-top-width", `${arrowSize}px`)
				.style("border-right-width", `${arrowSize}px`)
				.style("border-bottom-width", `0px`)
				.style("border-left-width", `${arrowSize}px`);

		return tooltipArrow;
	}

	public static setLineTooltipCoordinate(
		tooltip: NewTooltip,
		tooltipCoordinate: TooltipCoordinate,
		chartOrientation: ChartOrientation,
		transition: number = null
	): void {
		const tooltipBlock = tooltip.getEl();
		interrupt(tooltipBlock.node());

		if (!transition || transition <= 0) tooltip.setCoordinate(tooltipCoordinate);

		if (
			chartOrientation === "vertical" &&
			tooltipBlock.style("left") !== "0px" &&
			tooltipBlock.style("right") !== "0px" &&
			tooltipCoordinate.right !== "0px" &&
			tooltipCoordinate.left !== null
		) {
			tooltipBlock
				.style("right", tooltipCoordinate.right)
				.style("bottom", tooltipCoordinate.bottom)
				.style("top", tooltipCoordinate.top)
				.interrupt()
				.transition()
				.duration(transition)
				.ease(easeLinear)
				.style("left", tooltipCoordinate.left);
		} else if (
			chartOrientation === "horizontal" &&
			tooltipBlock.style("top") !== "0px" &&
			parseInt(tooltipBlock.style("bottom")) > 0 &&
			tooltipCoordinate.bottom === null
		) {
			tooltipBlock
				.style("right", tooltipCoordinate.right)
				.style("bottom", tooltipCoordinate.bottom)
				.style("left", tooltipCoordinate.left)
				.interrupt()
				.transition()
				.duration(transition)
				.ease(easeLinear)
				.style("top", tooltipCoordinate.top);
		} else {
			tooltip.setCoordinate(tooltipCoordinate);
		}
	}
}
