import { TwoDimensionalChartType } from "../../../config/config";
import { BandLikeChartSettingsStore, BarChartSettings, ScaleKeyModel } from "../../model";
import { BarSettingsStore } from "./barChartSettingsStore";
import { DotChartSettingsStore } from "./dotChartSettingsStore";

export function createBandLikeChartSettingsStore(
	chartType: TwoDimensionalChartType,
	modelSettings: BarChartSettings,
	barsAmount: number,
	keyScale: ScaleKeyModel
): BandLikeChartSettingsStore | undefined {
	const scaleBandWidth = keyScale.type === "band" ? keyScale.sizes.bandSize : 0;
	if (chartType === "bar") return new BarSettingsStore(modelSettings, { barsAmount, scaleBandWidth });
	if (chartType === "dot") return new DotChartSettingsStore({ scaleBandWidth });
	return undefined;
}
