import { BaseType, Selection } from "d3-selection";
import { ChartLegendModel, TwoDimensionalChartLegendBarModel, TwoDimensionalChartLegendLineModel } from "../../../model/model";
import { Legend } from "./legend";
import { HatchPatternDef } from "../../block/defs/hatchPattern";
import { applyLineDash } from "../../twoDimensionalNotation/line/lineHelper";
import { getClipPathValue } from "../../../engine/twoDimensionalNotation/bar/barHelper";

interface MarkerCreationOptions extends ChartLegendModel {
    color: string;
}

type MarkerParentSelection = Selection<BaseType, any, BaseType, any>;

export class LegendMarkerCreator {
    create(selection: MarkerParentSelection, options: MarkerCreationOptions) {
        const creator = getMarkerCreator(options);
        return creator.renderMarker(selection, options.color);
    }

    updateColorForItem(selection: MarkerParentSelection, options: MarkerCreationOptions) {
        const creator = getMarkerCreator(options);
        creator.updateColors(selection, options.color);
    }
}

export interface MarkerCreator {
    renderMarker(selection: MarkerParentSelection, color: string): Selection<BaseType, ChartLegendModel, BaseType, unknown>;
    updateColors(selection: MarkerParentSelection, color: string): void;
}

interface MakerCreatorCustomOptions {
    default?: { cssClass: string; }
}

export function getMarkerCreator(options: ChartLegendModel, customOptions?: MakerCreatorCustomOptions): MarkerCreator {
    if (options.markerShape === "bar") return new BarMarkerCreator(options.barViewOptions);
    if (options.markerShape === "line") return new LineMarkerCreator(options.lineViewOptions);
    return new DefaultMarkerCreator(customOptions?.default?.cssClass);
}

class DefaultMarkerCreator implements MarkerCreator {
    constructor(private cssClass = Legend.markerCircle) { }

    renderMarker(selection: MarkerParentSelection, color: string) {
        return selection.append('span').style('background-color', color).classed(this.cssClass, true);
    }

    updateColors(selection: MarkerParentSelection, color: string): void {
        selection.select(`.${this.cssClass}`).style('background-color', color);
    }
}

abstract class SvgMarkerCreator {
    protected renderSvg(selection: MarkerParentSelection) {
        return selection.append('svg')
            .style("display", "inline-block")
            .style("height", '8px')
            .classed(Legend.markerClass, true);
    }
}

class BarMarkerCreator extends SvgMarkerCreator implements MarkerCreator {
    constructor(private options: TwoDimensionalChartLegendBarModel) {
        super();
    }

    renderMarker(selection: MarkerParentSelection, color: string) {
        const svg = this.renderSvg(selection).style("width", this.options.width);
        const bars = svg
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', this.options.width)
            .attr('width', this.options.width)
            .style('fill', color)
            .style('clip-path', getClipPathValue(this.options.borderRadius));

        if (this.options.hatch.on) {
            bars.style('mask', HatchPatternDef.getMaskValue());
        }

        return bars;
    }

    updateColors(selection: MarkerParentSelection, color: string): void {
        selection.select('svg rect').style('fill', color);
    }
}

class LineMarkerCreator extends SvgMarkerCreator implements MarkerCreator {
    constructor(private options: TwoDimensionalChartLegendLineModel) {
        super();
    }

    renderMarker(selection: MarkerParentSelection, color: string) {
        const svg = this.renderSvg(selection).style("width", this.options.length);
        const line = svg
            .append('line')
            .style('stroke', 'red')
            .classed("line", true)
            .attr('x1', 0)
            .attr('x2', this.options.length)
            .attr('y1', 5)
            .attr('y2', 5)
            .style('stroke', color)
            .style('stroke-width', this.options.strokeWidth);

        if (this.options.dashedStyles.on) {
            applyLineDash(line, this.options.dashedStyles.dashSize, this.options.dashedStyles.gapSize);
        }

        return line;
    }

    updateColors(selection: MarkerParentSelection, color: string): void {
        selection.select('svg line').style('stroke', color);
    }
}