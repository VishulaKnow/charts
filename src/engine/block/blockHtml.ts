import { Selection } from "d3-selection";
import { NamesHelper } from "../helpers/namesHelper";

interface BlockHtmlOptions {
	blockCssClass: string;
}

export class BlockHtml {
	private parent: Selection<HTMLDivElement, unknown, HTMLElement, any>;
	private block: Selection<HTMLDivElement, unknown, HTMLElement, any>;

	private blockCssClass: string;

	constructor(options: BlockHtmlOptions) {
		this.blockCssClass = options.blockCssClass;
	}

	initParent(parent: Selection<HTMLDivElement, unknown, HTMLElement, any>) {
		this.parent = parent;
	}

	render() {
		this.block = this.parent
			.append("div")
			.attr("class", NamesHelper.getClassName("html-chart"))
			.classed(this.blockCssClass, true);
	}

	getBlock() {
		return this.block;
	}
}
