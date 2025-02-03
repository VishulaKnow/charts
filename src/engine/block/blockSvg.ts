import { Selection, BaseType } from "d3-selection";
import { Size } from "../../config/config";
import { BlockMargin } from "../../model/model";
import { NamesHelper } from "../helpers/namesHelper";
import { BlockHelper } from "./blockHelper";
import { HatchPatternDef } from "./defs/hatchPattern";

interface BlockSvgOptions {
	parentBlockId: number;
	svgCssClasses: string;
}

export class BlockSvg {
	private parentBlockId: number;
	private parent: Selection<BaseType, unknown, HTMLElement, any>;
	private svgCssClasses: string;
	private hatchPatternDef = new HatchPatternDef();

	private readonly chartBlockClass = "chart-block";
	private readonly chartGroupClass = "chart-group";

	constructor(options: BlockSvgOptions) {
		this.svgCssClasses = options.svgCssClasses;
		this.parentBlockId = options.parentBlockId;
	}

	initParent(parent: Selection<BaseType, unknown, HTMLElement, any>) {
		this.parent = parent;
	}

	render(blockSize: Size) {
		this.parent
			.append("svg")
			.attr("width", blockSize.width)
			.attr("height", blockSize.height)
			.attr("class", this.svgCssClasses + " " + NamesHelper.getClassName("svg-chart"));
	}

	getBlock(): Selection<SVGElement, unknown, HTMLElement, any> {
		return this.parent.select(`svg.${NamesHelper.getClassName("svg-chart")}`);
	}

	renderChartsBlock() {
		this.getBlock().append("g").attr("class", this.chartBlockClass);
	}

	getChartBlock(): Selection<SVGGElement, unknown, HTMLElement, any> {
		return this.getBlock().select(`.${this.chartBlockClass}`);
	}

	getChartGroup(chartIndex: number): Selection<SVGGElement, any, BaseType, any> {
		let group: Selection<SVGGElement, any, BaseType, any> = this.getChartBlock().select(
			`.${this.chartGroupClass}-${chartIndex}`
		);
		if (group.empty()) {
			group = this.getChartBlock().append("g").attr("class", `${this.chartGroupClass}-${chartIndex}`);
		}

		return group;
	}

	getClipPathId() {
		return NamesHelper.getId("clip-path", this.parentBlockId);
	}

	renderChartClipPath(margin: BlockMargin, blockSize: Size): void {
		const attributes = BlockHelper.getClipPathAttributes(blockSize, margin);
		this.ensureDefsRendered()
			.append("clipPath")
			.attr("id", this.getClipPathId())
			.append("rect")
			.attr("x", attributes.x)
			.attr("y", attributes.y)
			.attr("width", attributes.width)
			.attr("height", attributes.height);
	}

	updateChartClipPath(margin: BlockMargin, blockSize: Size): void {
		const attributes = BlockHelper.getClipPathAttributes(blockSize, margin);
		this.ensureDefsRendered()
			.select("clipPath")
			.select("rect")
			.attr("x", attributes.x)
			.attr("y", attributes.y)
			.attr("width", attributes.width)
			.attr("height", attributes.height);
	}

	renderBarHatchPattern() {
		this.hatchPatternDef.appendToDefsBlock(this.ensureDefsRendered());
	}

	ensureDefsRendered(): Selection<SVGDefsElement, unknown, HTMLElement, unknown> {
		let defs = this.getBlock().select<SVGDefsElement>("defs");
		if (defs.empty()) defs = this.getBlock().append<SVGDefsElement>("defs");

		return defs;
	}
}
