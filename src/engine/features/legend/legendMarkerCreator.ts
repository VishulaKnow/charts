import { BaseType, Selection } from "d3-selection";
import { ChartLegendEngineModel } from "./legendHelper";
import { TwoDimensionalChartLegendBarModel, TwoDimensionalChartLegendLineModel } from "../../../model/model";
import { LegendItemSelection } from "./legendDomHelper";
import { Legend } from "./legend";
import { HatchPatternDef } from "../../block/defs";
import { applyLineDash } from "../../twoDimensionalNotation/line/lineHelper";

interface MarkerCreationOptions extends ChartLegendEngineModel {
    color: string;
}

export class LegendMarkerCreator {
    create(selection: LegendItemSelection, options: MarkerCreationOptions) {
        const creator = getMarkerCreator(options);
        return creator.renderMarker(selection, options.color);
    }

    updateColorForItem(selection: LegendItemSelection, options: MarkerCreationOptions) {
        const creator = getMarkerCreator(options);
        creator.updateColors(selection, options.color)
    }
}

interface MarkerCreator {
    renderMarker(selection: LegendItemSelection, color: string): Selection<BaseType, ChartLegendEngineModel, BaseType, unknown>;
    updateColors(selection: LegendItemSelection, color: string): void;
}

function getMarkerCreator(options: ChartLegendEngineModel) {
    if (options.markerShape === "bar") return new BarMarkerCreator(options.barViewOptions);
    if (options.markerShape === "line") return new LineMarkerCreator(options.lineViewOptions);
    return new DefaultMarkerCreator();
}

class DefaultMarkerCreator implements MarkerCreator {
    renderMarker(selection: LegendItemSelection, color: string) {
        return selection.append('span').style('background-color', color).classed(Legend.markerCircle, true);
    }

    updateColors(selection: LegendItemSelection, color: string): void {
        selection.select(`.${Legend.markerClass}`).style('background-color', color);
    }
}

abstract class SvgMarkerCreator {
    protected renderSvg(selection: LegendItemSelection) {
        return selection.append('svg')
            .style("display", "inline-block")
            .style("height", '10px')
            .classed(Legend.markerClass, true);
    }
}

class BarMarkerCreator extends SvgMarkerCreator implements MarkerCreator {
    constructor(private options: TwoDimensionalChartLegendBarModel) {
        super();
    }

    renderMarker(selection: LegendItemSelection, color: string) {
        const svg = this.renderSvg(selection).style("width", this.options.width);
        const bars = svg
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', 10)
            .attr('width', this.options.width)
            .style('fill', color);

        if (this.options.hatch.on) {
            bars.style('mask', HatchPatternDef.getMaskValue());
        }

        return bars;
    }

    updateColors(selection: LegendItemSelection, color: string): void {
        selection.select('svg rect').style('fill', color);
    }
}

class LineMarkerCreator extends SvgMarkerCreator implements MarkerCreator {
    constructor(private options: TwoDimensionalChartLegendLineModel) {
        super();
    }

    renderMarker(selection: LegendItemSelection, color: string) {
        const svg = this.renderSvg(selection).style("width", this.options.width);
        const line = svg
            .append('line')
            .style('stroke', 'red')
            .classed("line", true)
            .attr('x1', 0)
            .attr('x2', this.options.width)
            .attr('y1', 5)
            .attr('y2', 5)
            .style('stroke', color);

        if (this.options.dashedStyles.on) {
            applyLineDash(line, this.options.dashedStyles.dashSize, this.options.dashedStyles.gapSize);
        }

        return line;
    }

    updateColors(selection: LegendItemSelection, color: string): void {
        selection.select('svg line').style('stroke', color);
    }
}