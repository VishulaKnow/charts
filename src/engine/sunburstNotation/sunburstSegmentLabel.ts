import { arc, Arc, pie, PieArcDatum } from "d3-shape";
import { BaseType, Selection } from "d3-selection";
import { interpolate } from "d3-interpolate";

interface SunburstSegmentLabelOptions {
	sizesForGenerators: {
		innerRadius: number;
		outerRadius: number;
		padAngle?: number;
	};
}

interface SunburstSegmentLabelDataItem {
	key: string | number;
	value: number;
}

export class SunburstSegmentLabel {
	private static readonly arcLabelClass = "mdt-charts-arc-label";

	constructor(private readonly parentSelection: Selection<BaseType, unknown, BaseType, unknown>) {}

	render(options: SunburstSegmentLabelOptions, segments: SunburstSegmentLabelDataItem[]) {
		const { arcGenerator, pieGenerator } = this.getGenerators(options);

		this.parentSelection
			.selectAll<SVGTextElement, PieArcDatum<SunburstSegmentLabelDataItem>>("text")
			.data(pieGenerator(segments), (d) => d.data.key)
			.enter()
			.append("text")
			.attr("transform", (d) => {
				return this.getTransformAttrValue(arcGenerator, d);
			})
			.classed(SunburstSegmentLabel.arcLabelClass, true)
			.text((d) => d.data.key)
			.each(function (d) {
				(this as any)._currentDataForUsingOnUpdate = d;
			});
	}

	update(
		options: SunburstSegmentLabelOptions,
		segments: SunburstSegmentLabelDataItem[],
		dataWithOldZeroSegments: SunburstSegmentLabelDataItem[],
		animationDuration: number
	): Promise<Selection<SVGTextElement, PieArcDatum<SunburstSegmentLabelDataItem>, BaseType, unknown>> {
		this.render(options, segments);

		const { arcGenerator, pieGenerator } = this.getGenerators(options);

		const labelsNewAndOld = this.parentSelection
			.selectAll<SVGTextElement, PieArcDatum<SunburstSegmentLabelDataItem>>("text")
			.data(pieGenerator(dataWithOldZeroSegments), (d) => d.data.key);

		const onlyNewLabels = this.parentSelection
			.selectAll<SVGTextElement, PieArcDatum<SunburstSegmentLabelDataItem>>("text")
			.data(pieGenerator(segments), (d) => d.data.key);

		const thisClass = this;

		return new Promise((resolve) => {
			labelsNewAndOld
				.interrupt()
				.transition()
				.duration(animationDuration)
				.on("end", () => {
					onlyNewLabels.exit().remove();
					resolve(onlyNewLabels);
				})
				.attrTween("transform", function (d) {
					const interpolateFunc = interpolate((this as any)._currentDataForUsingOnUpdate, d);
					return (t) => {
						(this as any)._currentDataForUsingOnUpdate = interpolateFunc(t);

						return thisClass.getTransformAttrValue(
							arcGenerator,
							(this as any)._currentDataForUsingOnUpdate
						);
					};
				});
		});
	}

	private getTransformAttrValue(
		arcGenerator: Arc<any, PieArcDatum<SunburstSegmentLabelDataItem>>,
		d: PieArcDatum<SunburstSegmentLabelDataItem>
	) {
		const [x, y] = arcGenerator.centroid(d);
		const a = (d.startAngle + d.endAngle) / 2;
		let rotate = (a * 180) / Math.PI - 90;

		if (rotate > 90) rotate -= 180;
		if (rotate < -90) rotate += 180;

		return `translate(${x},${y}) rotate(${rotate})`;
	}

	private getGenerators(options: SunburstSegmentLabelOptions) {
		const arcGenerator = arc<PieArcDatum<SunburstSegmentLabelDataItem>>()
			.innerRadius(options.sizesForGenerators.innerRadius)
			.outerRadius(options.sizesForGenerators.outerRadius)
			.padAngle(options.sizesForGenerators.padAngle);

		const pieGenerator = pie<SunburstSegmentLabelDataItem>()
			.sort(null)
			.value((d) => d.value);

		return { arcGenerator, pieGenerator };
	}
}
