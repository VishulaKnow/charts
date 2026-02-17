import { MdtChartsDataRow } from "./config";

export interface DonutChartValueLabelsConfig {
	on: boolean;
	rotation?: {
		type: "none" | "tangential";
	};
	cssClass?: string;
	content?: (dataRow: MdtChartsDataRow) => string;
}

export interface SunburstChartValueLabelsConfig {
	on: boolean;
	rotation?: {
		type: "none" | "tangential";
	};
	cssClass?: string;
	content?: (segment: { attachedDataRows: MdtChartsDataRow[] }) => string;
}
