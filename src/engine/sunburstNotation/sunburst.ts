import { pie } from "d3-shape";
import { SunburstOptionsModel, SunburstSliceSegment } from "../../model/model";
import { Block } from "../block/block";
import { DonutHelper } from "../polarNotation/donut/donutHelper";
import { Selection } from "d3-selection";

export class Sunburst {
	public static readonly donutBlockClass = "donut-block";
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

	render(block: Block, options: SunburstOptionsModel) {
		options.slices.forEach((slice) => {
			const arcGenerator = DonutHelper.getArcGenerator(slice.sizes.outerRadius, slice.sizes.innerRadius);
			const pieGenerator = pie<SunburstSliceSegment>()
				.padAngle(0.005)
				.sort(null)
				.value((d) => d.value);

			const donutBlock = block
				.getSvg()
				.append("g")
				.attr("class", Sunburst.donutBlockClass)
				.attr("x", slice.sizes.translate.x)
				.attr("y", slice.sizes.translate.y)
				.attr("transform", `translate(${slice.sizes.translate.x}, ${slice.sizes.translate.y})`);

			const items = donutBlock
				.selectAll(`.${Sunburst.arcItemClass}`)
				.data(pieGenerator(slice.segments))
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
		});
	}
}
