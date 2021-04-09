import { pointer, Selection } from "d3-selection";
import { Block } from "../../block/block";
import { TipBox } from "../tipBox/tipBox";

export class AxisLabelsEventManager {
    public static setHoverEvents(block: Block, axisElement: Selection<SVGGElement, unknown, HTMLElement, any>): void {
        const labels = axisElement.selectAll<SVGTextElement, string>('.tick text');
        labels.on('mousemove', function (e, d) {
            TipBox.get(block).dispatch('mousemove', {
                bubbles: false,
                cancelable: true,
                detail: {
                    keyValue: d,
                    pointer: pointer(e, block.getWrapper().node())
                }
            });
        });

        labels.on('mouseleave', function (e, d) {
            TipBox.get(block).dispatch('mouseleave');
        });
    }
}