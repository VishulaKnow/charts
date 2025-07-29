import { BandLikeChartSettingsStore, BarChartSettings } from "../../model";

export class BarSettingsStore implements BandLikeChartSettingsStore {
	constructor(
		private readonly modelSettings: BarChartSettings,
		private readonly canvasConfig: { scaleBandWidth: number; barsAmount: number }
	) {}

	getBandItemSize() {
		const barSize =
			this.getBarStep() > this.modelSettings.maxBarWidth ? this.modelSettings.maxBarWidth : this.getBarStep();
		return barSize;
	}

	getBandItemPad(barIndex: number) {
		const barDiff = ((this.getBarStep() - this.getBandItemSize()) * this.canvasConfig.barsAmount) / 2; // if bar bigger than maxWidth, diff for x coordinate
		const barPad = this.getBandItemSize() * barIndex + this.modelSettings.barDistance * barIndex + barDiff; // Отступ бара от края. Зависит от количества баров в одной группе и порядке текущего бара
		return barPad;
	}

	private getBarStep() {
		return (
			(this.canvasConfig.scaleBandWidth - this.modelSettings.barDistance * (this.canvasConfig.barsAmount - 1)) /
			this.canvasConfig.barsAmount
		); // Space for one bar
	}
}
