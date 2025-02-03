import { area, Area as IArea } from "d3-shape";
import { LineLikeGeneratorMiddleware } from "../lineLike/generatorMiddleware/lineLikeGeneratorMiddleware";
import { MdtChartsDataRow } from "../../../config/config";
import { CoordinateGetter } from "../lineLike/generatorFactory/lineLikeGeneratorFactory";

interface AreaGeneratorOptions {
    middlewares: LineLikeGeneratorMiddleware[];
}

export class AreaGenerator {
    constructor(private readonly options: AreaGeneratorOptions) {}

    getVertical(
        xValue: CoordinateGetter,
        y0Value: CoordinateGetter,
        y1Value: CoordinateGetter
    ): IArea<MdtChartsDataRow> {
        const generator = area<MdtChartsDataRow>().x(xValue).y0(y0Value).y1(y1Value);

        this.options.middlewares.forEach((middleware) => middleware.handle(generator));

        return generator;
    }

    getHorizontal(
        x0Value: CoordinateGetter,
        x1Value: CoordinateGetter,
        yValue: CoordinateGetter
    ): IArea<MdtChartsDataRow> {
        const generator = area<MdtChartsDataRow>().x0(x0Value).x1(x1Value).y(yValue);

        this.options.middlewares.forEach((middleware) => middleware.handle(generator));

        return generator;
    }
}
