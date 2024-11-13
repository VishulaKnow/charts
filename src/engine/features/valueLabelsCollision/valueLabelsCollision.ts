import { select, Selection } from "d3-selection";
import { ValueLabelsCollisionHelper } from "../../../engine/features/valueLabelsCollision/valueLabelsCollisionHelper";
import { TwoDimensionalValueLabels, ValueLabelsChartBlock, ValueLabelsChartBlockSide } from "../../../model/model";
import { ChartOrientation, MdtChartsDataRow } from "../../../config/config";

type CoordinateAxis = 'x' | 'y';
export type ValueLabelOnCanvasIndex = number;

export interface BoundingRect {
    x: number,
    y: number,
    width: number,
    height: number
}

export interface ValueLabelElementRectInfo {
    index: ValueLabelOnCanvasIndex
    boundingClientRect: BoundingRect
}

export interface ValueLabelElement extends ValueLabelElementRectInfo {
    svgElement: SVGTextElement
}

export interface LabelVisibility {
    index: ValueLabelOnCanvasIndex
    isVisible: boolean
}

export class ValueLabelsCollision {
    public static resolveValueLabelsCollisions(newValueLabels: Selection<SVGTextElement, MdtChartsDataRow, SVGGElement, unknown>, valueLabelsSettings: TwoDimensionalValueLabels): void {
        const valueLabelElementsRectInfo = this.getValueLabelElementsRectInfo(newValueLabels);

        this.shiftValueLabelsCollision(valueLabelElementsRectInfo, valueLabelsSettings.collision.chartBlock);

        if (valueLabelsSettings.collision.otherValueLables.mode === 'hide')
            this.toggleValueLabelElementsVisibility(valueLabelElementsRectInfo);
    }

    private static getValueLabelElementsRectInfo(valueLabels: Selection<SVGTextElement, unknown, SVGGElement, unknown>): ValueLabelElement[] {
        let ValueLabelElementsReactInfo: ValueLabelElement[] = [];

        valueLabels.each(function (_, index) {
            const { height, width } = this.getBBox();
            const x = +this.getAttribute("x");
            const y = +this.getAttribute("y");

            ValueLabelElementsReactInfo.push({
                index,
                svgElement: this,
                boundingClientRect: { x, y, width, height }
            });
        });

        return ValueLabelElementsReactInfo;
    }

    private static shiftValueLabelsCollision(valueLabelElementsRectInfo: ValueLabelElement[], chartBlock: ValueLabelsChartBlock) {
        valueLabelElementsRectInfo.forEach(element => {
            this.handleCollisionShift(chartBlock, element);
        });
    }

    private static handleCollisionShift(chartBlock: ValueLabelsChartBlock, element: ValueLabelElement): void {
        const sides = Object.keys(chartBlock) as (keyof ValueLabelsChartBlock)[];

        sides.forEach(side => {
            const blockSide = chartBlock[side];
            const axisCoordinate = side === 'left' || side === 'right' ? 'x' : 'y';

            if (blockSide.hasCollision?.(element.boundingClientRect)) {
                blockSide.shiftCoordinate(element.boundingClientRect);
                this.changeLabelElementCoordinateByAxis(element, axisCoordinate);
            }
        });
    }

    private static toggleValueLabelElementsVisibility(elements: ValueLabelElement[]): void {
        const labelsVisibility = ValueLabelsCollisionHelper.calculateValueLabelsVisibility(elements);

        labelsVisibility.forEach(label => {
            const labelInfo = elements.find(element => element.index === label.index);

            if (labelInfo && !label.isVisible)
                select(labelInfo.svgElement).style('display', 'none');
        });
    }

    private static changeLabelElementCoordinateByAxis(element: ValueLabelElement, axis: CoordinateAxis): void {
        select(element.svgElement)
            .attr(axis, element.boundingClientRect[axis]);
    }
}