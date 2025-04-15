import { CurveFactory } from "d3-shape";
import { Area, curveBasis, curveMonotoneX, curveMonotoneY, Line } from "d3-shape";
import { LineCurveType } from "../../../../model/model";
import { LineLikeGeneratorMiddleware } from "./lineLikeGeneratorMiddleware";
import { MdtChartsDataRow } from "../../../../config/config";

interface LineLikeGeneratorCurveMiddlewareOptions {
	curve?: LineCurveType;
}

export class LineLikeGeneratorCurveMiddleware implements LineLikeGeneratorMiddleware {
	private readonly curvies: Record<LineCurveType, CurveFactory | undefined> = {
		[LineCurveType.monotoneX]: curveMonotoneX,
		[LineCurveType.monotoneY]: curveMonotoneY,
		[LineCurveType.basis]: curveBasis,
		[LineCurveType.none]: undefined
	};

	constructor(private options: LineLikeGeneratorCurveMiddlewareOptions) {}

	handle(
		generator: Line<MdtChartsDataRow> | Area<MdtChartsDataRow>
	): Line<MdtChartsDataRow> | Area<MdtChartsDataRow> {
		if (this.options.curve != null) {
			const curve = this.curvies[this.options.curve];
			if (curve) generator.curve(curve);
		}
		return generator;
	}
}
