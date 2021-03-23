import { BaseType, Selection } from "d3-selection";
import { Block } from "../../block/block";
import { Donut } from "../../polarNotation/donut/donut";

export class LegendEventsManager {
    public static setHoverListeners(block: Block, keyFieldName: string, legendItems: Selection<HTMLDivElement, string, BaseType, unknown>): void {
        const arcItems = Donut.getAllArcGroups(block);

        legendItems.on('mouseover', (e, keyValue) => {
            arcItems.filter((row) => row.data[keyFieldName] === keyValue)
                .dispatch('mouseover');
        });

        legendItems.on('mouseleave', (e, keyValue) => {
            arcItems.filter((row) => row.data[keyFieldName] === keyValue)
                .dispatch('mouseleave', { detail: { name: 12 }, bubbles: false, cancelable: true });
        });
    }
}