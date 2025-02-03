import { Selection } from "d3-selection";
import { Size } from "../../../config/config";
import { OptionsModelTitle, TitleBlockModel } from "../../../model/model";
import { Block } from "../../block/block";
import { DomHelper } from "../../helpers/domHelper";

interface TitleAttributes {
	x: number;
	y: number;
	maxWidth: number;
	dominantBaseline: string;
}

export class Title {
	private static readonly titleCssClass = "chart-title";

	public static render(
		block: Block,
		title: OptionsModelTitle,
		titleBlockModel: TitleBlockModel,
		blockSize: Size
	): void {
		if (!title.textContent) return;

		const titleBlock = block.getSvg().append("text").attr("class", this.titleCssClass);

		const titleCoordinate = this.getTitleAttributes(blockSize, titleBlockModel);

		this.fillTitleBlockAttributes(titleBlock, titleCoordinate, title);
		this.setTitleTooltip(titleBlock, title.textContent);
	}

	public static updateData(block: Block, title: OptionsModelTitle): void {
		block.getSvg().select(`.${this.titleCssClass}`).text(title.textContent);
	}

	private static fillTitleBlockAttributes(
		titleBlock: Selection<SVGTextElement, unknown, HTMLElement, any>,
		attributes: TitleAttributes,
		title: OptionsModelTitle
	) {
		titleBlock
			.attr("x", attributes.x)
			.attr("y", attributes.y)
			.attr("dominant-baseline", attributes.dominantBaseline)
			.text(title.textContent)
			.style("font-size", `${title.fontSize}px`);

		DomHelper.cropSvgLabels(titleBlock, attributes.maxWidth);
	}

	private static getTitleAttributes(blockSize: Size, titleBlockModel: TitleBlockModel): TitleAttributes {
		const coordinate: TitleAttributes = {
			x: 0,
			y: 0,
			maxWidth: 0,
			dominantBaseline: "hanging"
		};

		coordinate.x = titleBlockModel.margin.left;
		coordinate.y = titleBlockModel.margin.top;
		coordinate.maxWidth = blockSize.width - titleBlockModel.margin.left - titleBlockModel.margin.right;

		return coordinate;
	}

	private static setTitleTooltip(
		titleBlock: Selection<SVGTextElement, unknown, HTMLElement, any>,
		text: string
	): void {
		titleBlock.append("title").text(text);
	}
}
