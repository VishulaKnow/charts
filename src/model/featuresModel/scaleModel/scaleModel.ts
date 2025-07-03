import { ScaleKeyModel, ScaleKeyType, ScaleValueModel } from "../../model";
import {
	MdtChartsTwoDimensionalChart,
	MdtChartsTwoDimensionalOptions,
	MdtChartsDataRow,
	TwoDimensionalChartType
} from "../../../config/config";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { getElementsAmountForScale, getScaleKeyRangePeek, getScaleValueRangePeek } from "./scaleModelServices";
import { getScaleLinearDomain } from "./scaleDomainService";
import { TwoDimConfigReader } from "../../modelInstance/configReader";

export enum ScaleType {
	Key,
	Value
}

export class ScaleModel {
	constructor(private readonly options: MdtChartsTwoDimensionalOptions, private readonly canvasModel: CanvasModel) {}

	getScaleKey(allowableKeys: string[]): ScaleKeyModel {
		const bandLikeCharts = this.getChartsByTypes(this.options.charts, ["bar", "dot"]);

		return {
			domain: allowableKeys,
			range: {
				start: 0,
				end: getScaleKeyRangePeek(this.options.orientation, this.canvasModel)
			},
			type: this.getScaleKeyType(this.options.charts),
			elementsAmount: getElementsAmountForScale(bandLikeCharts)
		};
	}

	getScaleLinear(dataRows: MdtChartsDataRow[], configReader?: TwoDimConfigReader): ScaleValueModel {
		return {
			domain: getScaleLinearDomain(this.options.axis.value.domain, dataRows, this.options),
			range: {
				start: 0,
				end: getScaleValueRangePeek(this.options.orientation, this.canvasModel)
			},
			type: "linear",
			formatter: configReader?.getAxisLabelFormatter() ?? null
		};
	}

	getScaleSecondaryLinear(dataRows: MdtChartsDataRow[], configReader?: TwoDimConfigReader): ScaleValueModel {
		return {
			domain: getScaleLinearDomain(this.options.axis.valueSecondary!.domain, dataRows, this.options, "secondary"),
			range: {
				start: 0,
				end: getScaleValueRangePeek(this.options.orientation, this.canvasModel)
			},
			type: "linear",
			formatter: configReader?.getSecondaryAxisLabelFormatter() ?? null
		};
	}

	private getChartsByTypes(
		charts: MdtChartsTwoDimensionalChart[],
		types: TwoDimensionalChartType[]
	): MdtChartsTwoDimensionalChart[] {
		return charts.filter((chart) => types.includes(chart.type));
	}

	private getScaleKeyType(charts: MdtChartsTwoDimensionalChart[]): ScaleKeyType {
		if (charts.some((chart: MdtChartsTwoDimensionalChart) => chart.type === "bar" || chart.type === "dot"))
			return "band";
		return "point";
	}
}
