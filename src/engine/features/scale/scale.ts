import { scaleBand, scaleLinear, scalePoint, ScaleBand, ScalePoint, ScaleLinear } from "d3-scale";
import { AxisScale } from "d3-axis";
import { RangeModel, ScaleBandModel, ScaleKeyModel, ScaleValueModel } from "../../../model/model";

export interface Scales {
	key: AxisScale<any>;
	value: AxisScale<any>;
}

export interface ScalesWithSecondary extends Scales {
	valueSecondary: AxisScale<any>;
}

//TODO: incapulate in model
export class Scale {
	public static getScalesWithSecondary(
		scaleKey: ScaleKeyModel,
		scaleValue: ScaleValueModel,
		scaleValueSecondary: ScaleValueModel
	): ScalesWithSecondary {
		const scales = this.getScales(scaleKey, scaleValue);

		return {
			...scales,
			...(scaleValueSecondary && { valueSecondary: this.getScaleValue(scaleValueSecondary) })
		};
	}

	public static getScaleValue(scaleValue: ScaleValueModel) {
		return this.getScaleLinear(scaleValue.domain, scaleValue.range);
	}

	public static getScaleBandWidth(scale: AxisScale<any>): number {
		if ((scale as ScaleBand<string>).bandwidth && scale.bandwidth() !== 0) {
			return scale.bandwidth();
		} else if ((scale as ScalePoint<string>).step) {
			return (scale as ScalePoint<string>).step();
		}
	}

	public static getScaleStep(scale: AxisScale<any>): number {
		if ((scale as ScaleBand<string>).step) {
			return (scale as ScaleBand<string>).step();
		}
	}

	public static getScaledValueOnMiddleOfItem(scale: AxisScale<any>, value: any): number {
		if ((scale as ScaleBand<string>).bandwidth && (scale as ScaleBand<string>).bandwidth() !== 0) {
			return scale(value) + this.getScaleBandWidth(scale) / 2;
		}
		return scale(value);
	}

	static getScaleBand(scaleKey: ScaleBandModel) {
		// Formulas from d3-scale source code: https://github.com/d3/d3-scale/blob/main/src/band.js
		const paddingInner = 1 - scaleKey.sizes.bandSize / scaleKey.sizes.recalculatedStepSize;
		const paddingOuter =
			(Math.abs(scaleKey.range.end - scaleKey.range.start) / scaleKey.sizes.recalculatedStepSize -
				scaleKey.domain.length +
				paddingInner) /
			2;

		return scaleBand()
			.domain(scaleKey.domain)
			.range([scaleKey.range.start, scaleKey.range.end])
			.paddingInner(paddingInner)
			.paddingOuter(paddingOuter);
	}

	private static getScales(scaleKey: ScaleKeyModel, scaleValue: ScaleValueModel): Scales {
		const scales: Scales = {
			key: null,
			value: null
		};

		if (scaleKey.type === "band") scales.key = this.getScaleBand(scaleKey);
		else if (scaleKey.type === "point") scales.key = this.getScalePoint(scaleKey.domain, scaleKey.range);

		scales.value = this.getScaleValue(scaleValue);

		return scales;
	}

	private static getScaleLinear(domain: number[], range: RangeModel): ScaleLinear<number, number, number> {
		const scale = scaleLinear().domain(domain).range([range.start, range.end]);
		scale.unknown(scale(0));
		return scale;
	}

	private static getScalePoint(domain: string[], range: RangeModel): ScalePoint<string> {
		return scalePoint().domain(domain).range([range.start, range.end]);
	}
}
