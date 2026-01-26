import { arc, Arc, Pie, pie, PieArcDatum } from "d3-shape";
import { SunburstOptionsModel, SunburstSlice, SunburstSliceSegment } from "../../model/model";
import { Block } from "../block/block";
import { DonutHelper } from "../polarNotation/donut/donutHelper";
import { Selection } from "d3-selection";
import { merge } from "d3-array";
import { interpolate } from "d3-interpolate";

export class Sunburst {
	public static readonly donutBlockClassPrefix = "slice-donut-block";
	public static readonly arcItemClass = "arc";
	public static readonly arcPathClass = "arc-path";

	static getAllArcGroups(block: Block): Selection<SVGGElement, { data: SunburstSliceSegment }, SVGGElement, unknown> {
		return block.getSvg().selectAll(`.${Sunburst.arcItemClass}`) as Selection<
			SVGGElement,
			{ data: SunburstSliceSegment },
			SVGGElement,
			unknown
		>;
	}

	static getSliceArcGroups(
		block: Block,
		sliceIndex: number
	): Selection<SVGGElement, { data: SunburstSliceSegment }, SVGGElement, unknown> {
		return block
			.getSvg()
			.selectAll(`.${Sunburst.donutBlockClassPrefix}-${sliceIndex} .${Sunburst.arcItemClass}`) as Selection<
			SVGGElement,
			{ data: SunburstSliceSegment },
			SVGGElement,
			unknown
		>;
	}

	constructor(private readonly block: Block) {
		this.block = block;
	}

	render(slices: SunburstSlice[]) {
		slices.forEach((slice, sliceIndex) => {
			const arcGenerator = arc<PieArcDatum<SunburstSliceSegment>>()
				.innerRadius(slice.sizes.innerRadius)
				.outerRadius(slice.sizes.outerRadius);
			const pieGenerator = pie<SunburstSliceSegment>()
				.padAngle(0.005)
				.sort(null)
				.value((d) => d.value);

			const sliceDonutBlock = this.block
				.getSvg()
				.append("g")
				.attr("class", `${Sunburst.donutBlockClassPrefix}-${sliceIndex}`)
				.attr("x", slice.sizes.translate.x)
				.attr("y", slice.sizes.translate.y)
				.attr("transform", `translate(${slice.sizes.translate.x}, ${slice.sizes.translate.y})`);

			this.renderNewArcItems(sliceDonutBlock, pieGenerator, arcGenerator, slice.segments);
		});
	}

	update(newSlices: SunburstSlice[]): Promise<void[]> {
		const promises: Promise<void>[] = [];

		newSlices.forEach((slice, sliceIndex) => {
			const arcGenerator = arc<PieArcDatum<SunburstSliceSegment>>()
				.innerRadius(slice.sizes.innerRadius)
				.outerRadius(slice.sizes.outerRadius);
			const pieGenerator = pie<SunburstSliceSegment>()
				.padAngle(0.005)
				.sort(null)
				.value((d) => d.value);

			const oldSegments = Sunburst.getSliceArcGroups(this.block, sliceIndex)
				.data()
				.map((d) => d.data);

			const dataNewZeroRows = this.mergeSegmentsWithZeros(slice.segments, oldSegments);
			const dataExtraZeroRows = this.mergeSegmentsWithZeros(oldSegments, slice.segments);

			const sliceDonutBlock = this.block
				.getSvg()
				.select<SVGGElement>(`.${Sunburst.donutBlockClassPrefix}-${sliceIndex}`)
				.attr("x", slice.sizes.translate.x)
				.attr("y", slice.sizes.translate.y)
				.attr("transform", `translate(${slice.sizes.translate.x}, ${slice.sizes.translate.y})`);

			this.renderNewArcItems(sliceDonutBlock, pieGenerator, arcGenerator, dataNewZeroRows);

			const path = Sunburst.getSliceArcGroups(this.block, sliceIndex)
				.data(pieGenerator(dataExtraZeroRows))
				.select<SVGPathElement>("path");
			const items = Sunburst.getSliceArcGroups(this.block, sliceIndex).data(pieGenerator(slice.segments));

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

		return Promise.all(promises);
	}

	private renderNewArcItems(
		sliceDonutBlock: Selection<SVGGElement, unknown, HTMLElement, any>,
		pieGenerator: Pie<any, SunburstSliceSegment>,
		arcGenerator: Arc<any, PieArcDatum<SunburstSliceSegment>>,
		segments: SunburstSliceSegment[]
	): Selection<SVGGElement, PieArcDatum<SunburstSliceSegment>, SVGGElement, unknown> {
		const items = sliceDonutBlock
			.selectAll(`.${Sunburst.arcItemClass}`)
			.data(pieGenerator(segments))
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

	private mergeSegmentsWithZeros(
		firstSegments: SunburstSliceSegment[],
		secondSegments: SunburstSliceSegment[]
	): SunburstSliceSegment[] {
		const secondSet = new Set();
		secondSegments.forEach((s) => secondSet.add(s.key));

		const onlyNew = firstSegments
			.filter((s) => !secondSet.has(s.key))
			.map((s, index, array) => {
				const segmentToChangeToZero: SunburstSliceSegment = {
					...s,
					value: 0
				};
				return segmentToChangeToZero;
			});

		const merged = merge<SunburstSliceSegment>([secondSegments, onlyNew]);
		return merged;
	}
}
