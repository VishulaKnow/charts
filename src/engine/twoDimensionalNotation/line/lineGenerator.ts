import { line } from "d3-shape";
import { MdtChartsDataRow } from "../../../config/config";
import { LineLikeGeneratorMiddleware } from "../lineLike/generatorMiddleware/lineLikeGeneratorMiddleware";
import { CoordinateGetter } from "../lineLike/generatorFactory/lineLikeGeneratorFactory";

interface LineGeneratorOptions {
    middlewares: LineLikeGeneratorMiddleware[];
}

export class LineGenerator {
    constructor(private options: LineGeneratorOptions) {}

    get(xValue: CoordinateGetter, yValue: CoordinateGetter) {
        const generator = line<MdtChartsDataRow>().x(xValue).y(yValue);

        this.options.middlewares.forEach((middleware) => middleware.handle(generator));

        return generator;
    }
}
