import { MdtChartsDataRow } from "../../../../config/config";
import { ValueField } from "../../../model";
import { POLAR_LEGEND_MARKER } from "../../../notations/polar/modelConstants/polarLegendMarker";
import {
	TooltipContentInitialRow,
	TooltipContentInitialRowsProvider,
	TooltipContentInitialRowsProviderContext
} from "./tooltipContentInitialRowsProvider";

export interface PolarInitialRowsProviderOptions {
	valueField: ValueField;
	colorField?: string;
	datasource: MdtChartsDataRow[];
	chartColors: string[];
	keyFieldName: string;
}

export class PolarInitialRowsProvider implements TooltipContentInitialRowsProvider {
	constructor(private readonly options: PolarInitialRowsProviderOptions) {}

	getInitialRows(context: TooltipContentInitialRowsProviderContext): TooltipContentInitialRow[] {
		const indexOfCurrentDataRow = this.options.datasource.findIndex(
			(row) => row[this.options.keyFieldName] === context.keyFieldValue
		);

		let markerColor: string;
		if (this.options.colorField) {
			const currentDataRow = this.options.datasource[indexOfCurrentDataRow];
			markerColor = currentDataRow[this.options.colorField];
		} else markerColor = this.options.chartColors[indexOfCurrentDataRow];

		return [
			{
				marker: {
					...POLAR_LEGEND_MARKER,
					color: markerColor
				},
				valueField: this.options.valueField
			}
		];
	}
}
