import { Block } from "../../../engine/block/block";
import { MdtChartsDataRow } from "../../../config/config";
import { TwoDimensionalChartModel } from "../../../model/model";
import { BaseType, Selection } from "d3-selection";
import { Segment } from "../../../engine/twoDimensionalNotation/lineLike/generatorMiddleware/lineLikeGeneratorDefineMiddleware";
import { Helper } from "../../../engine/helpers/helper";
import { Line as ILine } from "d3-shape";
import { Transition } from "d3-transition";

interface LineBuilderOptions {
	elementAccessors: {
		getBlock: () => Block;
	};
}

export class LineBuilder {
	constructor(
		private readonly options: LineBuilderOptions,
		private readonly chart: TwoDimensionalChartModel,
		private readonly lineGenerator: ILine<MdtChartsDataRow>
	) {}

	renderSegmented(
		stakedData: Segment[][],
		lineClass: string
	): Selection<SVGPathElement, Segment[], SVGGElement, any> {
		const block = this.options.elementAccessors.getBlock();

		return block.svg
			.getChartGroup(this.chart.index)
			.selectAll(`.${lineClass}${Helper.getCssClassesLine(this.chart.cssClasses)}`)
			.data(stakedData)
			.enter()
			.append("path")
			.attr("d", (d) => this.lineGenerator(d))
			.attr("class", lineClass)
			.style("fill", "none")
			.style("clip-path", `url(#${block.svg.getClipPathId()})`)
			.style("pointer-events", "none");
	}

	setSegmentColor(segments: Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: string[]): void {
		segments.style("stroke", (d, i) => colorPalette[i % colorPalette.length]);
	}

	updateSegmentedPath(linesObjects: Selection<BaseType, any, BaseType, any>): Promise<any> {
		const block = this.options.elementAccessors.getBlock();

		return new Promise((resolve) => {
			if (linesObjects.size() === 0) {
				resolve("");
				return;
			}

			let linesHandler: Selection<BaseType, any, BaseType, any> | Transition<BaseType, any, BaseType, any> =
				linesObjects;
			if (block.transitionManager.durations.chartUpdate > 0)
				linesHandler = linesHandler
					.interrupt()
					.transition()
					.duration(block.transitionManager.durations.chartUpdate)
					.on("end", () => resolve(""));

			linesHandler.attr("d", (d) => this.lineGenerator(d));

			if (block.transitionManager.durations.chartUpdate <= 0) resolve("");
		});
	}

	getAllLinesWithNewData(
		stakedData: Segment[][],
		lineClass: string
	): Selection<SVGPathElement, Segment[], SVGGElement, any> {
		const block = this.options.elementAccessors.getBlock();

		return block.svg
			.getChartGroup(this.chart.index)
			.selectAll<SVGPathElement, MdtChartsDataRow[]>(
				`path.${lineClass}${Helper.getCssClassesLine(this.chart.cssClasses)}`
			)
			.data(stakedData);
	}
}
