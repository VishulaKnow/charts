import { scaleBand, scaleLinear, scalePoint, ScaleBand, ScalePoint, ScaleLinear } from "d3-scale";
import { AxisScale } from "d3-axis";
import { BarChartSettings, RangeModel, ScaleKeyModel, ScaleValueModel } from "../../../model/model";

export interface Scales {
	key: AxisScale<any>;
	value: AxisScale<any>;
}

export interface ScalesWithSecondary extends Scales {
	valueSecondary: AxisScale<any>;
}

export class Scale {
	public static getScales(
		scaleKey: ScaleKeyModel,
		scaleValue: ScaleValueModel,
		bandSettings: BarChartSettings
	): Scales {
		const scales: Scales = {
			key: null,
			value: null
		};

		if (scaleKey.type === "band")
			// scales.key = this.getScaleBand(scaleKey.domain, scaleKey.range, bandSettings, scaleKey.elementsAmount);
			scales.key = scaleBand()
				.domain(scaleKey.domain)
				.range([scaleKey.range.start, scaleKey.range.end])
				.paddingInner(scaleKey.sizes.paddingInner / scaleKey.sizes.bandSize)
				.paddingOuter(scaleKey.sizes.paddingOuter / scaleKey.sizes.recalculatedStepSize);
		else if (scaleKey.type === "point") scales.key = this.getScalePoint(scaleKey.domain, scaleKey.range);

		scales.value = this.getScaleValue(scaleValue);

		return scales;
	}

	public static getScalesWithSecondary(
		scaleKey: ScaleKeyModel,
		scaleValue: ScaleValueModel,
		scaleValueSecondary: ScaleValueModel,
		bandSettings: BarChartSettings
	): ScalesWithSecondary {
		const scales = this.getScales(scaleKey, scaleValue, bandSettings);

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

	public static getScaledValue(scale: AxisScale<any>, value: any): number {
		if ((scale as ScaleBand<string>).bandwidth && (scale as ScaleBand<string>).bandwidth() !== 0) {
			return scale(value) + this.getScaleBandWidth(scale) / 2;
		}
		return scale(value);
	}

	private static getScaleBand(
		domain: string[],
		range: RangeModel,
		bandSettings: BarChartSettings,
		elementsInGroupAmount: number
	): ScaleBand<string> {
		const scale = scaleBand().domain(domain).range([range.start, range.end]);

		const bandSize = scale.bandwidth();

		if (bandSettings.groupMinDistance < bandSize) {
			scale.paddingInner(bandSettings.groupMinDistance / bandSize);
			scale.paddingOuter(bandSettings.groupMinDistance / bandSize / 2);
		}

		// Padding inner = 10. If bandwidth more than needed, paddingInner is increased to number less than 35
		let paddingInner = bandSettings.groupMinDistance;
		while (
			scale.bandwidth() >
				bandSettings.maxBarWidth * elementsInGroupAmount +
					bandSettings.barDistance * (elementsInGroupAmount - 1) &&
			paddingInner < bandSettings.groupMaxDistance
		) {
			scale.paddingInner(++paddingInner / bandSize);
		}

		// if bandwidth more than all bars widths in group + distance between it + distance between groups
		let paddingOuter = 1;
		while (
			scale.step() >
			bandSettings.maxBarWidth * elementsInGroupAmount +
				bandSettings.groupMaxDistance +
				bandSettings.barDistance * (elementsInGroupAmount - 1)
		) {
			scale.paddingOuter(++paddingOuter / bandSize);
		}

		return scale;
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
