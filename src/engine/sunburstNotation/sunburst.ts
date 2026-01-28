import { arc, Arc, Pie, pie, PieArcDatum } from "d3-shape";
import { SunburstLevel, SunburstLevelSegment } from "../../model/model";
import { Block } from "../block/block";
import { Selection } from "d3-selection";
import { merge } from "d3-array";
import { interpolate } from "d3-interpolate";
import { SunburstHighlightState } from "./sunburstHighlightState/sunburstHighlightState";

export class Sunburst {
	public static readonly donutBlockClassPrefix = "level-donut-block";
	public static readonly arcItemClass = "arc";
	private static readonly arcItemNonHighlightedClass = "mdt-charts-arc-non-highlighted";
	public static readonly arcPathClass = "arc-path";

	static getAllArcGroups(block: Block) {
		return block.getSvg().selectAll(`.${Sunburst.arcItemClass}`) as Selection<
			SVGGElement,
			PieArcDatum<SunburstLevelSegment>,
			SVGGElement,
			unknown
		>;
	}

	static getLevelArcGroups(block: Block, levelIndex: number) {
		return block
			.getSvg()
			.selectAll(`.${Sunburst.donutBlockClassPrefix}-${levelIndex} .${Sunburst.arcItemClass}`) as Selection<
			SVGGElement,
			PieArcDatum<SunburstLevelSegment>,
			SVGGElement,
			unknown
		>;
	}

	private readonly pagAngle = 0.005;

	constructor(private readonly block: Block) {
		this.block = block;
	}

	render(levels: SunburstLevel[]) {
		levels.forEach((level, levelIndex) => {
			const { arcGenerator, pieGenerator } = this.getGenerators(level);

			const levelDonutBlock = this.block
				.getSvg()
				.append("g")
				.attr("class", `${Sunburst.donutBlockClassPrefix}-${levelIndex}`)
				.attr("x", level.sizes.translate.x)
				.attr("y", level.sizes.translate.y)
				.attr("transform", `translate(${level.sizes.translate.x}, ${level.sizes.translate.y})`);

			this.renderNewArcItems(levelDonutBlock, pieGenerator, arcGenerator, level.segments);
		});

		return Sunburst.getAllArcGroups(this.block);
	}

	update(
		newLevels: SunburstLevel[]
	): Promise<Selection<SVGGElement, PieArcDatum<SunburstLevelSegment>, SVGGElement, unknown>> {
		const promises: Promise<void>[] = [];

		newLevels.forEach((level, levelIndex) => {
			const { arcGenerator, pieGenerator } = this.getGenerators(level);

			const oldSegments = Sunburst.getLevelArcGroups(this.block, levelIndex)
				.data()
				.map((d) => d.data);

			const dataNewZeroRows = this.mergeSegmentsWithZeros(level.segments, oldSegments);
			const dataExtraZeroRows = this.mergeSegmentsWithZeros(oldSegments, level.segments);

			const levelDonutBlock = this.block
				.getSvg()
				.select<SVGGElement>(`.${Sunburst.donutBlockClassPrefix}-${levelIndex}`)
				.attr("x", level.sizes.translate.x)
				.attr("y", level.sizes.translate.y)
				.attr("transform", `translate(${level.sizes.translate.x}, ${level.sizes.translate.y})`);

			this.renderNewArcItems(levelDonutBlock, pieGenerator, arcGenerator, dataNewZeroRows);

			const path = Sunburst.getLevelArcGroups(this.block, levelIndex)
				.data(pieGenerator(dataExtraZeroRows), (d) => d.data.key)
				.select<SVGPathElement>("path");
			const items = Sunburst.getLevelArcGroups(this.block, levelIndex).data(
				pieGenerator(level.segments),
				(d) => d.data.key
			);

			items.style("fill", (segment) => segment.data.color);

			promises.push(
				new Promise((resolve) => {
					path.interrupt()
						.transition()
						.duration(this.block.transitionManager.durations.chartUpdate)
						.on("end", () => {
							items.exit().remove();
							resolve();
						})
						.attrTween("d", function (d) {
							const interpolateFunc = interpolate((this as any)._currentData, d);
							return (t) => {
								(this as any)._currentData = interpolateFunc(t);
								return arcGenerator((this as any)._currentData);
							};
						});
				})
			);
		});

		return Promise.all(promises).then(() => Sunburst.getAllArcGroups(this.block));
	}

	updateColors(levelsWithNewColors: SunburstLevel[]) {
		levelsWithNewColors.forEach((level, levelIndex) => {
			const { pieGenerator } = this.getGenerators(level);
			const levelSegments = Sunburst.getLevelArcGroups(this.block, levelIndex);
			levelSegments
				.data(pieGenerator(level.segments), (d) => d.data.key)
				.style("fill", (segmentDatum) => segmentDatum.data.color);
		});
	}

	setHighlightedSegmentsHandle(sunburstHighlightState: SunburstHighlightState) {
		sunburstHighlightState.on("highlightedSegmentsChanged", ({ highlightedSegments }) => {
			const allArcGroups = Sunburst.getAllArcGroups(this.block);

			if (highlightedSegments.length === 0) {
				allArcGroups
					.filter(".mdt-charts-arc-non-highlighted")
					.classed(Sunburst.arcItemNonHighlightedClass, false);
			} else {
				allArcGroups
					.filter(":not(.mdt-charts-arc-non-highlighted)")
					.filter(
						(d) =>
							!highlightedSegments.some((s) => s.key === d.data.key && s.levelIndex === d.data.levelIndex)
					)
					.classed(Sunburst.arcItemNonHighlightedClass, true);

				allArcGroups
					.filter(".mdt-charts-arc-non-highlighted")
					.filter((d) =>
						highlightedSegments.some((s) => s.key === d.data.key && s.levelIndex === d.data.levelIndex)
					)
					.classed(Sunburst.arcItemNonHighlightedClass, false);
			}
		});
	}

	private renderNewArcItems(
		levelDonutBlock: Selection<SVGGElement, unknown, HTMLElement, any>,
		pieGenerator: Pie<any, SunburstLevelSegment>,
		arcGenerator: Arc<any, PieArcDatum<SunburstLevelSegment>>,
		segments: SunburstLevelSegment[]
	): Selection<SVGGElement, PieArcDatum<SunburstLevelSegment>, SVGGElement, unknown> {
		const items = levelDonutBlock
			.selectAll<SVGGElement, PieArcDatum<SunburstLevelSegment>>(`.${Sunburst.arcItemClass}`)
			.data(pieGenerator(segments), (d) => d.data.key)
			.enter()
			.append("g")
			.attr("class", Sunburst.arcItemClass)
			.style("fill", (segment) => segment.data.color);

		items
			.append("path")
			.attr("d", arcGenerator)
			.attr("class", Sunburst.arcPathClass)
			.each(function (d) {
				(this as any)._currentData = d;
			}); // TODO: _currentData используется для получения текущих данных внутри функции обновления.

		return items;
	}

	private getGenerators(level: SunburstLevel): {
		arcGenerator: Arc<any, PieArcDatum<SunburstLevelSegment>>;
		pieGenerator: Pie<any, SunburstLevelSegment>;
	} {
		const arcGenerator = arc<PieArcDatum<SunburstLevelSegment>>()
			.innerRadius(level.sizes.innerRadius)
			.outerRadius(level.sizes.outerRadius)
			.padAngle((d) => (d.value === 0 ? 0 : this.pagAngle));

		const pieGenerator = pie<SunburstLevelSegment>()
			.sort(null)
			.value((d) => d.value);

		return { arcGenerator, pieGenerator };
	}

	private mergeSegmentsWithZeros(
		firstSegments: SunburstLevelSegment[],
		secondSegments: SunburstLevelSegment[]
	): SunburstLevelSegment[] {
		const secondSet = new Set();
		secondSegments.forEach((s) => secondSet.add(s.key));

		const onlyNew = firstSegments
			.filter((s) => !secondSet.has(s.key))
			.map((s, index, array) => {
				const segmentToChangeToZero: SunburstLevelSegment = {
					...s,
					value: 0
				};
				return segmentToChangeToZero;
			});

		const merged = merge<SunburstLevelSegment>([secondSegments, onlyNew]);
		return merged;
	}
}
