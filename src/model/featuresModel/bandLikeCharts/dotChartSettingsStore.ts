import { BandLikeChartSettingsStore } from "../../model";

export class DotChartSettingsStore implements BandLikeChartSettingsStore {
	constructor(private readonly canvasConfig: { scaleBandWidth: number }) {}

	getBandSubItemSize(): number {
		return this.canvasConfig.scaleBandWidth;
	}

	getBandItemPad(): number {
		return 0;
	}
}
