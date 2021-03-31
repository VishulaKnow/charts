import { BaseType, pointer, Selection } from "d3-selection";
import { Block } from "../../block/block";
import { Donut } from "../../polarNotation/donut/donut";

export class LegendEventsManager {
    /**
     * @param block 
     * @param keyFieldName 
     * @param legendItems айтемы легенды полара, которые привязаны к ключам
     */
    public static setListeners(block: Block, keyFieldName: string, legendItems: Selection<HTMLDivElement, string, BaseType, unknown>, selectable: boolean): void {
        this.setHoverListeners(block, keyFieldName, legendItems);
        if (selectable)
            this.setClickListeners(block, keyFieldName, legendItems);
    }

    private static setHoverListeners(block: Block, keyFieldName: string, legendItems: Selection<HTMLDivElement, string, BaseType, unknown>): void {
        const arcItems = Donut.getAllArcGroups(block);

        legendItems.on('mousemove', function (e, keyValue) {
            arcItems.filter((row) => row.data[keyFieldName] === keyValue)
                .dispatch('mousemove', {
                    bubbles: false,
                    cancelable: true,
                    detail: {
                        pointer: pointer(e, block.getWrapper().node()),
                        ignoreTranslate: true
                    }
                });
        });

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
                .dispatch('click', { bubbles: false, cancelable: true, detail: { multySelect: e.ctrlKey || e.metaKey } });
        });
    }
}