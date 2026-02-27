import { arc, Arc, pie, PieArcDatum } from "d3-shape";
import { BaseType, select, Selection } from "d3-selection";
import { interpolate } from "d3-interpolate";
import { PolarSegmentLabelDataItem } from "../../../model/modelTypes/valueLabelsModel";
import { DonutHelper } from "../donut/donutHelper";
import { DonutChartTranslateModel } from "../../../model/model";
import { Block } from "../../block/block";
import { createHtmlForMultilineSvgText } from "../../utils/createHtmlForMultilineSvgText";

interface SunburstSegmentLabelOptions {
	sizesForGenerators: {
		innerRadius: number;
		outerRadius: number;
		padAngle?: number;
	};
	wrapperTranslate: DonutChartTranslateModel;
}

export class PolarLikeSegmentLabel {
	private static readonly arcLabelClass = "mdt-charts-arc-label";

	private readonly wrapperCssClassName: string;

	constructor(
		private readonly block: Block,
		index: number = 0
	) {
		this.wrapperCssClassName = `mdt-charts-donut-label-wrapper-${index}`;
	}

	render(options: SunburstSegmentLabelOptions, segments: PolarSegmentLabelDataItem[]) {
		const { arcGenerator, pieGenerator } = this.getGenerators(options);

		let parentSelection = this.block.getSvg().select<SVGGElement>(`.${this.wrapperCssClassName}`);
		if (parentSelection.empty()) {
			parentSelection = this.block
				.getSvg()
				.append("g")
				.classed(this.wrapperCssClassName, true)
				.attr("transform", `translate(${options.wrapperTranslate.x}, ${options.wrapperTranslate.y})`);
		}

		parentSelection
			.selectAll<SVGTextElement, PieArcDatum<PolarSegmentLabelDataItem>>("text")
			.data(pieGenerator(segments), (d) => d.data.key)
			.enter()
			.append("text")
			.attr("transform", (d) => {
				return this.getTransformAttrValue(arcGenerator, d);
			})
			.classed(PolarLikeSegmentLabel.arcLabelClass, true)
			.each(function (d) {
				select(this).selectAll("tspan").remove();
				createHtmlForMultilineSvgText(this, 0, d.data.textContent.split("\n"));

				if (d.data.cssClass) select(this).classed(d.data.cssClass, true);

				(this as any)._currentDataForUsingOnUpdate = d;
			});
	}

	update(
		options: SunburstSegmentLabelOptions,
		segments: PolarSegmentLabelDataItem[],
		animationDuration: number
	): Promise<Selection<SVGTextElement, PieArcDatum<PolarSegmentLabelDataItem>, BaseType, unknown>> {
		const parentSelection = this.block.getSvg().select<SVGGElement>(`.${this.wrapperCssClassName}`);

		parentSelection.attr("transform", `translate(${options.wrapperTranslate.x}, ${options.wrapperTranslate.y})`);

		const oldLabels = parentSelection
			.selectAll<SVGTextElement, PieArcDatum<PolarSegmentLabelDataItem>>("text")
			.data()
			.map((d) => d.data);

		const valueLabelsZeroRows = DonutHelper.mergeDataWithZeros(segments, oldLabels);

		this.render(options, segments);

		const { arcGenerator, pieGenerator } = this.getGenerators(options);

		const labelsNewAndOld = parentSelection
			.selectAll<SVGTextElement, PieArcDatum<PolarSegmentLabelDataItem>>("text")
			.data(pieGenerator(valueLabelsZeroRows), (d) => d.data.key);

		const onlyNewLabels = parentSelection
			.selectAll<SVGTextElement, PieArcDatum<PolarSegmentLabelDataItem>>("text")
			.data(pieGenerator(segments), (d) => d.data.key);

		onlyNewLabels.each(function (d) {
			select(this).selectAll("tspan").remove();
			createHtmlForMultilineSvgText(this, 0, d.data.textContent.split("\n"));
		});

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
		arcGenerator: Arc<any, PieArcDatum<PolarSegmentLabelDataItem>>,
		d: PieArcDatum<PolarSegmentLabelDataItem>
	) {
		const [x, y] = arcGenerator.centroid(d);
		let attrValue = `translate(${x},${y})`;

		if (d.data.rotation.type === "tangential") {
			const a = (d.startAngle + d.endAngle) / 2;
			let rotate = (a * 180) / Math.PI - 90;

			if (rotate > 90) rotate -= 180;
			if (rotate < -90) rotate += 180;

			attrValue += ` rotate(${rotate})`;
		}

		return attrValue;
	}

	private getGenerators(options: SunburstSegmentLabelOptions) {
		const arcGenerator = arc<PieArcDatum<PolarSegmentLabelDataItem>>()
			.innerRadius(options.sizesForGenerators.innerRadius)
			.outerRadius(options.sizesForGenerators.outerRadius)
			.padAngle(options.sizesForGenerators.padAngle);

		const pieGenerator = pie<PolarSegmentLabelDataItem>()
			.sort(null)
			.value((d) => d.value);

		return { arcGenerator, pieGenerator };
	}
}
