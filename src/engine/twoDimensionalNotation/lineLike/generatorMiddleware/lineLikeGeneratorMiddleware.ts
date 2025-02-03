import { Line as ILine, Area as IArea } from "d3-shape";
import { MdtChartsDataRow } from "../../../../config/config";

export interface LineLikeGeneratorMiddleware {
	handle(
		generator: ILine<MdtChartsDataRow> | IArea<MdtChartsDataRow>
	): ILine<MdtChartsDataRow> | IArea<MdtChartsDataRow>;
}
