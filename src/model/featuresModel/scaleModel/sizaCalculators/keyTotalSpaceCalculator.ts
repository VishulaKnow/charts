import { CanvasKeyItemOptions } from "../../../../config/config";
import { ScaleCanvasSizesCalculator } from "./scaleCanvasSizesCalculator";

interface KeyTotalSpaceCalculatorOptions {
	scaleSizesCalculator: ScaleCanvasSizesCalculator;
}

export class KeyTotalSpaceCalculator {
	constructor(private readonly options: KeyTotalSpaceCalculatorOptions) {}

	calculate(): CanvasKeyItemOptions[] {
		const sizes = this.options.scaleSizesCalculator.calculate();
		const items = new Array<CanvasKeyItemOptions>(sizes.keysAmount);
		for (let i = 0; i < sizes.keysAmount; i++) {
			let addByOuter = 0;
			if (i === 0) addByOuter += sizes.outerPadding;
			if (i === sizes.keysAmount - 1) addByOuter += sizes.outerPadding;

			let addByInner = sizes.innerPadding;
			if (sizes.keysAmount > 1 && (i === 0 || i === sizes.keysAmount - 1)) addByInner /= 2;
			if (sizes.keysAmount <= 1) addByInner = 0;

			items[i] = { totalSize: addByOuter + sizes.oneKeyPureSize + addByInner };
		}
		return items;
	}
}
