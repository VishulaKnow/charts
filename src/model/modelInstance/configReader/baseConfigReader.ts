import { MdtChartsField } from "../../../config/config";
import { BlockMargin } from "../../model";

export interface BaseConfigReader {
	getValueFields(): MdtChartsField[];
	getChartBlockMargin(): BlockMargin;
}
