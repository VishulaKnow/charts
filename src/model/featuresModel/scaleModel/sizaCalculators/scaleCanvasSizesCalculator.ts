import { ScaleKeyModel } from "../../../model";

export interface KeyScaleCanvasSizes {
	innerPadding: number;
	outerPadding: number;
	oneKeyPureSize: number;
	keysAmount: number;
}

export class ScaleCanvasSizesCalculator {
	constructor(private readonly options: { keyScale: ScaleKeyModel }) {}

	calculate(): KeyScaleCanvasSizes {
		if (this.options.keyScale.type === "band") {
			const rangeOfKeyAxis =
				Math.abs(this.options.keyScale.range.end - this.options.keyScale.range.start) -
				this.options.keyScale.sizes.paddingOuter * 2 -
				this.options.keyScale.sizes.paddingInner * (this.options.keyScale.domain.length - 1);
			return {
				innerPadding: this.options.keyScale.sizes.paddingInner,
				outerPadding: this.options.keyScale.sizes.paddingOuter,
				oneKeyPureSize: rangeOfKeyAxis / this.options.keyScale.domain.length,
				keysAmount: this.options.keyScale.domain.length
			};
		}
		return {
			innerPadding:
				(this.options.keyScale.range.end - this.options.keyScale.range.start) /
				(this.options.keyScale.domain.length - 1),
			outerPadding: 0,
			oneKeyPureSize: 0,
			keysAmount: this.options.keyScale.domain.length
		};
	}
}
