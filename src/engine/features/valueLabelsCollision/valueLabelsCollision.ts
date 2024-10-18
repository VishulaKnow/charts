import { select, Selection } from "d3-selection";
import { ValueLabelsCollisionHelper } from "../../../engine/features/valueLabelsCollision/valueLabelsCollisionHelper";

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
    public static getValueLabelElementsRectInfo(valueLabels: Selection<SVGTextElement, unknown, SVGGElement, unknown>): ValueLabelElement[] {
        let ValueLabelElementsReactInfo: ValueLabelElement[] = [];

        valueLabels.each(function (_, index) {
            const { x, y, height, width } = this.getBoundingClientRect();

            ValueLabelElementsReactInfo.push({
                index,
                svgElement: this,
                boundingClientRect: { x, y, width, height }
            });
        });

        return ValueLabelElementsReactInfo;
    }

    public static toggleValueLabelElementsVisibility(elements: ValueLabelElement[]): void {
        const labelsVisibility = ValueLabelsCollisionHelper.calculateValueLabelsVisibility(elements);

        labelsVisibility.forEach(label => {
            const labelInfo = elements.find(element => element.index === label.index);

            if (labelInfo && !label.isVisible)
                select(labelInfo.svgElement).style('display', 'none');
        });
    }
}