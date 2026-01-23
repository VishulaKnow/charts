import { pie } from "d3-shape";
import { SunburstOptionsModel, SunburstSliceSegment } from "../../model/model";
import { Block } from "../block/block";
import { DonutHelper } from "../polarNotation/donut/donutHelper";

export class Sunburst {
	public readonly donutBlockClass = "donut-block";
	public readonly arcItemClass = "arc";
	public readonly arcPathClass = "arc-path";

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
				.attr("class", this.donutBlockClass)
				.attr("x", slice.sizes.translate.x)
				.attr("y", slice.sizes.translate.y)
				.attr("transform", `translate(${slice.sizes.translate.x}, ${slice.sizes.translate.y})`);

			const items = donutBlock
				.selectAll(`.${this.arcItemClass}`)
				.data(pieGenerator(slice.segments))
				.enter()
				.append("g")
				.attr("class", this.arcItemClass)
				.style("fill", (segment) => segment.data.color);

			const arcs = items
				.append("path")
				.attr("d", arcGenerator)
				.attr("class", this.arcPathClass)
				.each(function (d) {
					(this as any)._currentData = d;
				}); // _currentData используется для получения текущих данных внутри функции обновления.
		});
	}
}
