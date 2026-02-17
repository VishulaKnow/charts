import { MdtChartsDataRow } from "../../../../config/config";
import { PolarSegmentModel, ValueField } from "../../../model";
import { POLAR_LEGEND_MARKER } from "../../../notations/polar/modelConstants/polarLegendMarker";
import {
	TooltipContentInitialRow,
	TooltipContentInitialRowsProvider,
	TooltipContentInitialRowsProviderContext
} from "./tooltipContentInitialRowsProvider";

export interface PolarInitialRowsProviderOptions {
	valueField: ValueField;
	segments: PolarSegmentModel[];
	chartColors: string[];
}

export class PolarInitialRowsProvider implements TooltipContentInitialRowsProvider {
	constructor(private readonly options: PolarInitialRowsProviderOptions) {}

	getInitialRows(context: TooltipContentInitialRowsProviderContext): TooltipContentInitialRow[] {
		const currentSegment = this.options.segments.find((segment) => segment.key === context.keyFieldValue);

		if (!currentSegment) {
			throw new Error(`Segment with key ${context.keyFieldValue} not found`);
		}

		return [
			{
				marker: {
					...POLAR_LEGEND_MARKER,
					color: currentSegment.color
				},
				valueField: this.options.valueField
			}
		];
	}
}
