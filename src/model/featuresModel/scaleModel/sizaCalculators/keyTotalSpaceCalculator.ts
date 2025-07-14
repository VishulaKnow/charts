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
			if (i === 0 || i === sizes.keysAmount - 1)
				items[i] = { totalSize: sizes.outerPadding + sizes.oneKeyPureSize + sizes.innerPadding / 2 };
			else items[i] = { totalSize: sizes.oneKeyPureSize + sizes.innerPadding };
		}
		return items;
	}
}
