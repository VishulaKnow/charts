import { TwoDimensionalChartModel } from "../../../model";
import { TooltipContentInitialRow, TooltipContentInitialRowsProvider } from "./tooltipContentInitialRowsProvider";

export interface TwoDimInitialRowsProviderOptions {
	chartsInfo: Pick<TwoDimensionalChartModel, "data" | "style" | "legend">[];
}

export class TwoDimInitialRowsProvider implements TooltipContentInitialRowsProvider {
	constructor(private readonly options: TwoDimInitialRowsProviderOptions) {}

	getInitialRows(): TooltipContentInitialRow[] {
		const initialRows: TooltipContentInitialRow[] = [];

		this.options.chartsInfo.forEach((chart) => {
			chart.data.valueFields.forEach((valueField, valueFieldIndex) => {
				initialRows.push({
					marker: {
						color: chart.style.elementColors[valueFieldIndex % chart.style.elementColors.length],
						...chart.legend
					},
					valueField
				});
			});
		});

		return initialRows;
	}
}
