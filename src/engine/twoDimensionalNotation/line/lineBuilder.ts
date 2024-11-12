import { Block } from "../../../engine/block/block";
import { MdtChartsDataRow } from "../../../config/config";
import { TwoDimensionalChartModel } from "../../../model/model";
import { BaseType, Selection } from "d3-selection";
import { Segment } from "../../../engine/twoDimensionalNotation/lineLike/generatorMiddleware/lineLikeGeneratorDefineMiddleware";
import { Helper } from "../../../engine/helpers/helper";
import { Line as ILine } from "d3-shape";
import { Transition } from "d3-transition";

export class LineBuilder {

    public static renderSegmented(lineGenerator: ILine<MdtChartsDataRow>, stackedData: Segment[][], block: Block, chart: TwoDimensionalChartModel, lineClass: string): Selection<SVGPathElement, Segment[], SVGGElement, any> {
        return block.svg.getChartGroup(chart.index)
            .selectAll(`.${lineClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData)
            .enter()
            .append('path')
            .attr('d', d => lineGenerator(d))
            .attr('class', lineClass)
            .style('fill', 'none')
            .style('clip-path', `url(#${block.svg.getClipPathId()})`)
            .style('pointer-events', 'none');
    }

    public static setSegmentColor(segments: Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: string[]): void {
        segments.style('stroke', (d, i) => colorPalette[i % colorPalette.length]);
    }

    public static updateSegmentedPath(block: Block, linesObjects: Selection<BaseType, any, BaseType, any>, lineGenerator: ILine<MdtChartsDataRow>): Promise<any> {
        return new Promise(resolve => {
            if (linesObjects.size() === 0) {
                resolve('');
                return;
            }

            let linesHandler: Selection<BaseType, any, BaseType, any> | Transition<BaseType, any, BaseType, any> = linesObjects;
            if (block.transitionManager.durations.chartUpdate > 0)
                linesHandler = linesHandler.interrupt()
                    .transition()
                    .duration(block.transitionManager.durations.chartUpdate)
                    .on('end', () => resolve(''));

            linesHandler
                .attr('d', d => lineGenerator(d));

            if (block.transitionManager.durations.chartUpdate <= 0)
                resolve('');
        });
    }

    public static getAllLines(stackedData: Segment[][], block: Block, chart: TwoDimensionalChartModel, lineClass: string): Selection<SVGPathElement, Segment[], SVGGElement, any> {
        return block.svg.getChartGroup(chart.index)
            .selectAll<SVGPathElement, MdtChartsDataRow[]>(`path.${lineClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData);
    }
}
