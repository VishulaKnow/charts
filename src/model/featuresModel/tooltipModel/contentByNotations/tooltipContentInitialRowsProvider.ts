import { TooltipMarkerModel, ValueField } from "../../../model";

export interface TooltipContentInitialRow {
	marker: TooltipMarkerModel;
	valueField: ValueField;
}

export interface TooltipContentInitialRowsProvider {
	getInitialRows(): TooltipContentInitialRow[];
}
