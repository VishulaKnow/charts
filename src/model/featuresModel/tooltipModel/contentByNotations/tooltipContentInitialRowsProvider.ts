import { MdtChartsDataRow } from "../../../../config/config";
import { TooltipMarkerModel, ValueField } from "../../../model";

export interface TooltipContentInitialRow {
	marker: TooltipMarkerModel;
	valueField: ValueField;
}

export interface TooltipContentInitialRowsProviderContext {
	keyFieldValue: string;
	currentDataRow: MdtChartsDataRow;
}

export interface TooltipContentInitialRowsProvider {
	getInitialRows(context: TooltipContentInitialRowsProviderContext): TooltipContentInitialRow[];
}
