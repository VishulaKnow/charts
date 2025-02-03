import { Line as ILine, stack } from "d3-shape";
import { MdtChartsDataRow } from "../../../config/config";
import { TwoDimensionalChartModel } from "../../../model/model";
import { Scale } from "../../features/scale/scale";
import { LineGenerator } from "./lineGenerator";
import { Pipeline } from "../../helpers/pipeline/Pipeline";
import { BaseType, Selection } from "d3-selection";
import { LineLikeGeneratorCurveMiddleware } from "../lineLike/generatorMiddleware/lineLikeGeneratorCurveMiddleware";
import {
	LineLikeGeneratorDefinedMiddleware,
	Segment
} from "../lineLike/generatorMiddleware/lineLikeGeneratorDefineMiddleware";
import { LineLikeGeneratorFactoryOptions } from "../lineLike/generatorFactory/lineLikeGeneratorFactory";

export class LineGeneratorFactory {
	constructor(private options: LineLikeGeneratorFactoryOptions) {}

	public getLineGenerator(valueFieldName: string): ILine<MdtChartsDataRow> {
		const { keyAxisOrient, scales, keyFieldName, margin, shouldRender } = this.options;

		const generator = new LineGenerator({
			middlewares: [
				new LineLikeGeneratorCurveMiddleware({ curve: this.options.curve }),
				new LineLikeGeneratorDefinedMiddleware({
					definedFn: shouldRender,
					valueFieldNameGetter: () => valueFieldName,
					dataRowGetter: (d) => d
				})
			]
		});

		if (keyAxisOrient === "bottom" || keyAxisOrient === "top") {
			return generator.get(
				(d) => Scale.getScaledValue(scales.key, d[keyFieldName]) + margin.left,
				(d) => scales.value(d[valueFieldName]) + margin.top
			);
		}

		if (keyAxisOrient === "left" || keyAxisOrient === "right") {
			return generator.get(
				(d) => scales.value(d[valueFieldName]) + margin.left,
				(d) => Scale.getScaledValue(scales.key, d[keyFieldName]) + margin.top
			);
		}
	}

	public getSegmentedLineGenerator(): ILine<MdtChartsDataRow> {
		const { keyAxisOrient, scales, keyFieldName, margin, shouldRender } = this.options;

		const generator = new LineGenerator({
			middlewares: [
				new LineLikeGeneratorCurveMiddleware({ curve: this.options.curve }),
				new LineLikeGeneratorDefinedMiddleware({
					definedFn: shouldRender,
					valueFieldNameGetter: (d) => d.fieldName,
					dataRowGetter: (d) => d.data
				})
			]
		});

		if (keyAxisOrient === "bottom" || keyAxisOrient === "top") {
			return generator.get(
				(d) => Scale.getScaledValue(scales.key, d.data[keyFieldName]) + margin.left,
				(d) => scales.value(d[1]) + margin.top
			);
		}

		if (keyAxisOrient === "left" || keyAxisOrient === "right") {
			return generator.get(
				(d) => scales.value(d[1]) + margin.left,
				(d) => Scale.getScaledValue(scales.key, d.data[keyFieldName]) + margin.top
			);
		}
	}
}

export function onLineChartInit(
	creatingPipeline: Pipeline<Selection<SVGElement, any, BaseType, any>, TwoDimensionalChartModel>
) {
	creatingPipeline.push((path, chart) => {
		if (chart.lineLikeViewOptions.dashedStyles.on) {
			return applyLineDash(
				path,
				chart.lineLikeViewOptions.dashedStyles.dashSize,
				chart.lineLikeViewOptions.dashedStyles.gapSize
			);
		}
		return path;
	});
	creatingPipeline.push(setStrokeWidth);
}

function setStrokeWidth(
	path: Selection<SVGElement, any, BaseType, any>,
	chart: TwoDimensionalChartModel
): Selection<SVGElement, any, BaseType, any> {
	return path.style("stroke-width", chart.lineLikeViewOptions.strokeWidth);
}

export function applyLineDash(
	lineSelection: Selection<SVGElement, any, BaseType, any>,
	dashSize: number,
	gapSize: number
) {
	return lineSelection.style("stroke-dasharray", `${dashSize} ${gapSize}`);
}

export function getStackedData(data: MdtChartsDataRow[], chart: TwoDimensionalChartModel): Segment[][] {
	let stackedData = stack()
		.keys(chart.data.valueFields.map((field) => field.name))(data)
		.map((layer, index) => {
			const fieldName = chart.data.valueFields[index].name;
			return layer.map((segment: Segment) => {
				segment.fieldName = fieldName;
				return segment;
			});
		});
	return stackedData;
}
