import { curveBasis, curveMonotoneX, line, Line as ILine, curveMonotoneY, CurveFactory } from "d3-shape";
import { MdtChartsDataRow } from "../../../config/config";
import { LineCurveType } from "../../../model/model";

interface LineGeneratorOptions {
    curve?: LineCurveType;
}

type CoordinateGetter = (dataRow: MdtChartsDataRow) => number

export class LineGenerator {
    private readonly curvies: Record<LineCurveType, CurveFactory | undefined> = {
        [LineCurveType.monotoneX]: curveMonotoneX,
        [LineCurveType.monotoneY]: curveMonotoneY,
        [LineCurveType.basis]: curveBasis,
        [LineCurveType.none]: undefined
    }

    constructor(private options: LineGeneratorOptions) { }

    get(xValue: CoordinateGetter, yValue: CoordinateGetter) {
        const generator = line<MdtChartsDataRow>()
            .x(xValue)
            .y(yValue);

        this.setCurve(generator);

        return generator;
    }

    private setCurve(generator: ILine<MdtChartsDataRow>) {
        if (this.options.curve != null) {
            const curve = this.curvies[this.options.curve];
            if (curve) generator.curve(curve);
        }
    }
}