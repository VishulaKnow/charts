import { line } from "d3-shape";
import { MdtChartsDataRow } from "../../../config/config";
import { LineLikeGeneratorMiddleware } from "../lineLike/generatorMiddleware/lineLikeGeneratorMiddleware";

interface LineGeneratorOptions {
    middlewares: LineLikeGeneratorMiddleware[];
}

type CoordinateGetter = (dataRow: MdtChartsDataRow) => number

export class LineGenerator {
    constructor(private options: LineGeneratorOptions) { }

    get(xValue: CoordinateGetter, yValue: CoordinateGetter) {
        const generator = line<MdtChartsDataRow>()
            .x(xValue)
            .y(yValue);

        this.options.middlewares.forEach(middleware => middleware.handle(generator));

        return generator;
    }
}