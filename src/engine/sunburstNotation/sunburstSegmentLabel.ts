import { Arc, Pie, PieArcDatum } from "d3-shape";
import { SunburstLevelSegment } from "../../model/model";
import { BaseType, Selection } from "d3-selection";
import { interpolate } from "d3-interpolate";

export class SunburstSegmentLabel {
	private static readonly arcLabelClass = "mdt-charts-arc-label";

	constructor(private readonly parentSelection: Selection<BaseType, unknown, BaseType, unknown>) {}

	render(
		generators: {
			arcGenerator: Arc<any, PieArcDatum<SunburstLevelSegment>>;
			pieGenerator: Pie<any, SunburstLevelSegment>;
		},
		segments: SunburstLevelSegment[]
	) {
		const { arcGenerator, pieGenerator } = generators;

		this.parentSelection
			.selectAll<SVGTextElement, PieArcDatum<SunburstLevelSegment>>("text")
			.data(pieGenerator(segments), (d) => d.data.key)
			.enter()
			.append("text")
			.attr("transform", (d) => {
				const [x, y] = arcGenerator.centroid(d);
				const a = (d.startAngle + d.endAngle) / 2;
				let rotate = (a * 180) / Math.PI - 90;

				if (rotate > 90) rotate -= 180;
				if (rotate < -90) rotate += 180;

				return `translate(${x},${y}) rotate(${rotate})`;
			})
			.classed(SunburstSegmentLabel.arcLabelClass, true)
			.text((d) => d.data.key)
			.each(function (d) {
				(this as any)._currentDataForUsingOnUpdate = d;
			});
	}

	update(
		generators: {
			arcGenerator: Arc<any, PieArcDatum<SunburstLevelSegment>>;
			pieGenerator: Pie<any, SunburstLevelSegment>;
		},
		segments: SunburstLevelSegment[],
		dataWithOldZeroSegments: SunburstLevelSegment[],
		animationDuration: number
	) {
		const { arcGenerator, pieGenerator } = generators;

		this.render(generators, segments);

		const labelsNewAndOld = this.parentSelection
			.selectAll<SVGTextElement, PieArcDatum<SunburstLevelSegment>>("text")
			.data(pieGenerator(dataWithOldZeroSegments), (d) => d.data.key);

		const onlyNewLabels = this.parentSelection
			.selectAll<SVGTextElement, PieArcDatum<SunburstLevelSegment>>("text")
			.data(pieGenerator(segments), (d) => d.data.key);

		return new Promise<void>((resolve) => {
			labelsNewAndOld
				.interrupt()
				.transition()
				.duration(animationDuration)
				.on("end", () => {
					onlyNewLabels.exit().remove();
					resolve();
				})
				.attrTween("transform", function (d) {
					const interpolateFunc = interpolate((this as any)._currentDataForUsingOnUpdate, d);
					return (t) => {
						(this as any)._currentDataForUsingOnUpdate = interpolateFunc(t);

						const [x, y] = arcGenerator.centroid((this as any)._currentDataForUsingOnUpdate);
						const a = (d.startAngle + d.endAngle) / 2;
						let rotate = (a * 180) / Math.PI - 90;

						if (rotate > 90) rotate -= 180;
						if (rotate < -90) rotate += 180;

						return `translate(${x},${y}) rotate(${rotate})`;
					};
				});
		});
	}
}
