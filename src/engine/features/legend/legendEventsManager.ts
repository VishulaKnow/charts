import { BaseType, Selection } from "d3-selection";
import { Block } from "../../block/block";
import { Donut } from "../../polarNotation/donut/donut";

export class LegendEventsManager {
    /**
     * 
     * @param block 
     * @param keyFieldName 
     * @param legendItems айтемы легенды полара, которые привязаны к ключам
     */
    public static setListeners(block: Block, keyFieldName: string, legendItems: Selection<HTMLDivElement, string, BaseType, unknown>): void {
        this.setHoverListeners(block, keyFieldName, legendItems);
        this.setClickListeners(block, keyFieldName, legendItems);
    }

    private static setHoverListeners(block: Block, keyFieldName: string, legendItems: Selection<HTMLDivElement, string, BaseType, unknown>): void {
        const arcItems = Donut.getAllArcGroups(block);

        legendItems.on('mouseover', (e, keyValue) => {
            arcItems.filter((row) => row.data[keyFieldName] === keyValue)
                .dispatch('mouseover');
        });

        legendItems.on('mouseleave', (e, keyValue) => {
            arcItems.filter((row) => row.data[keyFieldName] === keyValue)
                .dispatch('mouseleave');
        });
    }

    private static setClickListeners(block: Block, keyFieldName: string, legendItems: Selection<HTMLDivElement, string, BaseType, unknown>): void {
        const arcItems = Donut.getAllArcGroups(block);

        legendItems.on('click', (e: MouseEvent, keyValue) => {
            arcItems.filter((row) => row.data[keyFieldName] === keyValue)
                .dispatch('click', { bubbles: false, cancelable: true, detail: { multySelect: e.ctrlKey } });
        });
    }
}