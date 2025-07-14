import {
	BaseScaleKeyModel,
	RangeModel,
	ScaleBandModelSizeParams,
	ScaleKeyModel,
	ScaleKeyType,
	ScaleValueModel
} from "../../model";
import {
	MdtChartsTwoDimensionalChart,
	MdtChartsTwoDimensionalOptions,
	MdtChartsDataRow,
	TwoDimensionalChartType
} from "../../../config/config";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { getElementsAmountForScale, getScaleKeyRangePeek, getScaleValueRangePeek } from "./scaleModelServices";
import { getScaleLinearDomain } from "./scaleDomainService";
import { TwoDimConfigReader } from "../../modelInstance/configReader/twoDimConfigReader/twoDimConfigReader";
import { BarOptionsCanvas } from "../../../designer/designerConfig";

export enum ScaleType {
	Key,
	Value
}

export class ScaleModel {
	constructor(
		private readonly options: MdtChartsTwoDimensionalOptions,
		private readonly canvasModel: CanvasModel,
		private readonly barCanvas: BarOptionsCanvas
	) {}

	getScaleKey(domainValues: string[]): ScaleKeyModel {
		const bandLikeCharts = this.getChartsByTypes(this.options.charts, ["bar", "dot"]);

		const baseModel: BaseScaleKeyModel = {
			domain: domainValues,
			range: {
				start: 0,
				end: getScaleKeyRangePeek(this.options.orientation, this.canvasModel)
			}
		};

		const type = this.getScaleKeyType(this.options.charts);

		if (type === "point") {
			return {
				...baseModel,
				type: "point"
			};
		}

		if (type === "band") {
			return {
				...baseModel,
				type: "band",
				sizes: this.getBandScaleSizeParams(
					baseModel.domain,
					baseModel.range,
					getElementsAmountForScale(bandLikeCharts)
				)
			};
		}

		throw new Error("Unknown scale key type");
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

	private getBandScaleSizeParams(
		domainValues: string[],
		range: RangeModel,
		elementsInGroupAmount: number
	): ScaleBandModelSizeParams {
		const paddings = {
			outer: 0,
			inner: 0
		};

		const getStepSize = () =>
			(Math.abs(range.end - range.start) + paddings.inner - 2 * paddings.outer) / domainValues.length;
		const getBandSize = () => getStepSize() - paddings.inner;

		const oneKeyTotalSpace = getBandSize();

		if (this.barCanvas.groupMinDistance < oneKeyTotalSpace) {
			paddings.inner = this.barCanvas.groupMinDistance;
			paddings.outer = this.barCanvas.groupMinDistance / 2;
		}

		//TODO: calculate without loop
		while (
			getBandSize() >
				this.barCanvas.maxBarWidth * elementsInGroupAmount +
					this.barCanvas.barDistance * (elementsInGroupAmount - 1) &&
			paddings.inner < this.barCanvas.groupMaxDistance
		) {
			paddings.inner++;
		}

		paddings.outer = 1;
		//TODO: calculate without loop
		while (
			getStepSize() >
			this.barCanvas.maxBarWidth * elementsInGroupAmount +
				this.barCanvas.groupMaxDistance +
				this.barCanvas.barDistance * (elementsInGroupAmount - 1)
		) {
			paddings.outer += 1;
		}

		return {
			paddingInner: paddings.inner,
			paddingOuter: paddings.outer,
			oneKeyTotalSpace,
			recalculatedStepSize: getStepSize()
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
