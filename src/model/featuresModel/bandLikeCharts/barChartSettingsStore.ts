import { BandLikeChartSettingsStore, BarChartSettings } from "../../model";

export class BarSettingsStore implements BandLikeChartSettingsStore {
	constructor(
		private readonly modelSettings: BarChartSettings,
		private readonly canvasConfig: { scaleBandWidth: number; oneKeyBarsAmount: number }
	) {}

	getBandItemSize() {
		return (
			(this.canvasConfig.scaleBandWidth -
				this.modelSettings.barDistance * (this.canvasConfig.oneKeyBarsAmount - 1)) /
			this.canvasConfig.oneKeyBarsAmount
		); // Space for one bar
	}

	getBandItemPad(barIndex: number) {
		return this.getBandItemSize() * barIndex + this.modelSettings.barDistance * barIndex; // Отступ бара от края. Зависит от количества баров в одной группе и порядке текущего бара
	}
}
