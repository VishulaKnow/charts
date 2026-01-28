import { select, Selection, BaseType } from "d3-selection";
import { Transitions } from "../../designer/designerConfig";
import { Scales } from "../features/scale/scale";
import { TipBox } from "../features/tipBox/tipBox";
import { Helper } from "../helpers/helper";
import { FilterEventManager } from "../filterManager/filterEventManager";
import { Donut } from "../polarNotation/donut/donut";
import { TransitionManager } from "../transitionManager";
import { BlockHelper } from "./blockHelper";
import { Size } from "../../config/config";
import { BlockSvg } from "./blockSvg";
import { BlockHtml } from "./blockHtml";
import { Sunburst } from "../sunburstNotation/sunburst";

export class Block {
	public parentElement: HTMLElement;
	public transitionManager: TransitionManager;
	public scales: Scales;
	public filterEventManager: FilterEventManager;
	public svg: BlockSvg;
	public html: BlockHtml;

	private wrapperCssClasses: string[];
	private parentElementSelection: Selection<BaseType, any, HTMLElement, any>;
	private wrapper: Selection<HTMLDivElement, any, HTMLElement, any>;

	constructor(
		cssClass: string,
		parentElement: HTMLElement,
		blockId: number,
		filterEventManager: FilterEventManager,
		transitions: Transitions = null
	) {
		this.svg = new BlockSvg({
			svgCssClasses: cssClass,
			parentBlockId: blockId
		});
		this.html = new BlockHtml({ blockCssClass: cssClass });

		this.wrapperCssClasses = Helper.getCssClassesArray(cssClass);
		this.wrapperCssClasses = BlockHelper.getFormattedCssClassesForWrapper(this.wrapperCssClasses);
		this.parentElement = parentElement;
		this.parentElementSelection = select(parentElement);

		this.transitionManager = new TransitionManager(this, transitions);
		this.filterEventManager = filterEventManager;
	}

	public renderWrapper(blockSize: Size): void {
		this.wrapper = this.parentElementSelection
			.append("div")
			.attr("class", this.wrapperCssClasses.join(" "))
			.style("width", blockSize.width + "px")
			.style("height", blockSize.height + "px")
			.style("position", "relative");

		this.svg.initParent(this.wrapper);
		this.html.initParent(this.wrapper);
	}

	public destroy(): void {
		this.transitionManager.interruptTransitions();
		this.getWrapper().remove();
	}

	public getSvg(): Selection<SVGElement, unknown, HTMLElement, any> {
		//TODO: move this method in blockSvg
		return this.svg.getBlock();
	}

	public getWrapper(): Selection<BaseType, unknown, HTMLElement, any> {
		return this.wrapper;
	}

	public clearWrapper(): void {
		this.getWrapper().selectAll("*").remove();
	}
}
