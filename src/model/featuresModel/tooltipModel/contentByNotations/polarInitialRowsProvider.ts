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

		const markerColor = this.options.chartColors[indexOfCurrentDataRow];

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
