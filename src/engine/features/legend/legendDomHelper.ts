import { BaseType, Selection } from "d3-selection";
import { DomHelper } from "../../helpers/domHelper";
import { Helper } from "../../helpers/helper";
import { Legend } from "./legend";
import { ChartLegendEngineModel, LegendHelper } from "./legendHelper";

export type LegendItemSelection = Selection<HTMLDivElement, ChartLegendEngineModel, BaseType, unknown>;

export class LegendDomHelper {
    public static setItemsTitles(items: LegendItemSelection): void {
        items.attr('title', d => d.textContent);
    }

    public static cropRowLabels(legendBlock: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: LegendItemSelection): void {
        const maxWidth = legendBlock.node().getBoundingClientRect().width;
        let itemsLeftMargins = this.getItemsLeftMargins(items);
        let itemsWidth = this.getItemsWidth(items)
        let sumOfItemsWidth = LegendHelper.getSumOfItemsWidths(itemsWidth, itemsLeftMargins);
        const maxItemWidth = LegendHelper.getMaxItemWidth(legendBlock.attr('width'), itemsLeftMargins, 'row');

        let index = 0;
        let loopFlag = true; // if at least one label has no text, loop ends
        while (sumOfItemsWidth > maxWidth && loopFlag) {
            items.nodes().forEach(node => {
                const textBlock = node.querySelector(`.${Legend.labelClass}`);
                if (node.getBoundingClientRect().width > maxItemWidth && textBlock.textContent) {
                    let labelText = index > 0
                        ? textBlock.textContent.substr(0, textBlock.textContent.length - 3)
                        : textBlock.textContent;

                    labelText = labelText.substr(0, labelText.length - 1);
                    textBlock.textContent = labelText + '...';
                    itemsLeftMargins = this.getItemsLeftMargins(items);
                    itemsWidth = this.getItemsWidth(items)
                    sumOfItemsWidth = LegendHelper.getSumOfItemsWidths(itemsWidth, itemsLeftMargins);

                    if (labelText.length === 0) {
                        textBlock.textContent = '';
                        loopFlag = false;
                    }
                }
            });
            index++;
        }
    }

    private static getItemsLeftMargins(items: LegendItemSelection): number[] {
        return items.nodes().map(node => Helper.getPXValueFromString(DomHelper.getCssPropertyValue(node, 'margin-left')))
    }

    private static getItemsWidth(items: LegendItemSelection): number[] {
        return items.nodes().map(node => node.getBoundingClientRect().width);
    }
}
