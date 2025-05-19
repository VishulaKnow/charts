import { Selection, BaseType } from "d3-selection";
import { TooltipBasicModel } from "../../../model/model";
import { TooltipHelper } from "./tooltipHelper";
import { Size } from "../../../config/config";
import { getMarkerCreator } from "../legend/legendMarkerCreator";

export interface TooltipLineAttributes {
	x1: number;
	x2: number;
	y1: number;
	y2: number;
}

export const ARROW_SIZE = 20;
export const ARROW_DEFAULT_POSITION = 9;
export const TOOLTIP_ARROW_PADDING_X = ARROW_DEFAULT_POSITION - (ARROW_SIZE * Math.sqrt(2) - ARROW_SIZE) / 2 + 14;
export const TOOLTIP_ARROW_PADDING_Y = 13;

export class TooltipDomHelper {
	private static readonly groupClass = "tooltip-group";
	private static readonly textItemClass = "tooltip-text-item";
	private static readonly tooltipLegendDefaultMarker = "tooltip-circle";

	public static fillContent(
		contentBlock: Selection<HTMLElement, unknown, BaseType, unknown>,
		keyValue: string,
		tooltipOptions: TooltipBasicModel
	): void {
		const content = tooltipOptions.getContent(keyValue);

		contentBlock.html("");

		if (content.type === "html") {
			contentBlock.html(content.htmlContent);
			contentBlock.selectAll(`.${this.textItemClass}`).style("white-space", "pre-wrap");
			contentBlock.selectAll(".tooltip-text-item").style("display", "block");
		} else {
			content.rows.forEach((row) => {
				const group = contentBlock.append("div").attr("class", this.groupClass);

				if (row.wrapper?.cssClassName) {
					group.classed(row.wrapper.cssClassName, true);
				}

				if (row.marker) {
					const colorBlock = group.append("div").attr("class", "tooltip-color");
					getMarkerCreator(row.marker, {
						default: { cssClass: TooltipDomHelper.tooltipLegendDefaultMarker }
					}).renderMarker(colorBlock, row.marker.color);
				}

				const rowTextBlock = group
					.append("div")
					.attr("class", "tooltip-texts")
					.append("div")
					.attr("class", this.textItemClass);

				rowTextBlock.append("span").attr("class", "tooltip-field-title").text(row.textContent.caption);

				if (row.textContent.value)
					rowTextBlock.append("span").attr("class", "tooltip-field-value").text(row.textContent.value);
			});
		}
	}

	public static getRecalcedCoordinateByArrow(
		coordinate: [number, number],
		tooltipBlock: Selection<HTMLElement, unknown, HTMLElement, any>,
		blockSize: Size,
		tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>,
		translateX: number = 0,
		translateY: number = 0
	): [number, number] {
		const tooltipBlockNode = tooltipBlock.node();
		const horizontalPad = TooltipHelper.getHorizontalPad(
			coordinate[0],
			tooltipBlockNode.getBoundingClientRect().width,
			blockSize,
			translateX
		);
		const verticalPad = TooltipHelper.getVerticalPad(
			coordinate[1],
			tooltipBlockNode.getBoundingClientRect().height,
			translateY
		);

		this.setTooltipArrowCoordinate(
			tooltipArrow,
			TooltipHelper.getTooltipArrowPadding(tooltipBlockNode.getBoundingClientRect().width, horizontalPad)
		);

		return [
			coordinate[0] - TOOLTIP_ARROW_PADDING_X - horizontalPad,
			coordinate[1] - TOOLTIP_ARROW_PADDING_Y - tooltipBlockNode.getBoundingClientRect().height - verticalPad
		];
	}

	private static setTooltipArrowCoordinate(
		tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>,
		horizontalPad: number
	): void {
		if (horizontalPad !== 0) tooltipArrow.style("left", `${ARROW_DEFAULT_POSITION + Math.floor(horizontalPad)}px`);
		else tooltipArrow.style("left", `${ARROW_DEFAULT_POSITION}px`);
	}
}
