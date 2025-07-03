import { ChartOrientation, DiscreteAxisOptions, TwoDimGroupingOptions } from "../../../../../config/config";
import { Orient } from "../../../../model";

export class GroupingConfigReader {
	constructor(
		private readonly keyAxisOptions: DiscreteAxisOptions,
		private readonly chartOrientation: ChartOrientation,
		private readonly groupingOptions?: TwoDimGroupingOptions
	) {}

	// isEnabled(): boolean {
	// 	return Boolean(this.groupingOptions) && this.groupingOptions!.items.length > 0;
	// }

	getSlicesByOrients(): { orient: Orient; amount: number }[] {
		const slices: { orient: Orient; amount: number }[] = [];

		const slicesAmountFromKeyAxisSide =
			this.groupingOptions?.items.filter(
				(item) => !item.labels?.position || item.labels.position === this.keyAxisOptions.position
			).length ?? 0;
		const slicesAmountOppositeToKeyAxisSide =
			this.groupingOptions?.items.filter(
				(item) => item.labels?.position && item.labels.position !== this.keyAxisOptions.position
			).length ?? 0;

		const pushIfAmountIsNotZero = (orient: Orient, amount: number) => {
			if (amount > 0) {
				slices.push({ orient, amount });
			}
		};

		if (this.chartOrientation === "vertical") {
			pushIfAmountIsNotZero(
				"top",
				this.keyAxisOptions.position === "start"
					? slicesAmountFromKeyAxisSide
					: slicesAmountOppositeToKeyAxisSide
			);
			pushIfAmountIsNotZero(
				"bottom",
				this.keyAxisOptions.position === "start"
					? slicesAmountOppositeToKeyAxisSide
					: slicesAmountFromKeyAxisSide
			);
		} else {
			pushIfAmountIsNotZero(
				"left",
				this.keyAxisOptions.position === "start"
					? slicesAmountFromKeyAxisSide
					: slicesAmountOppositeToKeyAxisSide
			);
			pushIfAmountIsNotZero(
				"right",
				this.keyAxisOptions.position === "start"
					? slicesAmountOppositeToKeyAxisSide
					: slicesAmountFromKeyAxisSide
			);
		}
		return slices;
	}
}
