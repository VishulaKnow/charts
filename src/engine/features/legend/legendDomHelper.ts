import { Color } from "d3-color";
import { BaseType, select, Selection } from "d3-selection";
import { LegendItemsDirection } from "../../../model/featuresModel/legendModel/legendCanvasModel";
import { LegendBlockModel, LegendPosition, Orient, Size } from "../../../model/model";
import { Block } from "../../block/block";
import { DomHelper } from "../../helpers/domHelper";
import { Helper } from "../../helpers/helper";
import { Legend } from "./legend";
import { LegendCoordinate, LegendHelper } from "./legendHelper";

export class LegendDomHelper {
    public static cropRowLabels(legendBlock: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: Selection<HTMLDivElement, string, BaseType, unknown>): void {
        const maxWidth = legendBlock.node().getBoundingClientRect().width;
        let itemsLeftMargins: number[] = this.getItemsLeftMargins(items);
        let itemsWidth: number[] = this.getItemsWidth(items)
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

    public static cropColumnLabels(legendBlock: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: Selection<HTMLDivElement, string, BaseType, unknown>, itemsDirection: LegendItemsDirection): void {
        const itemsLeftMargins: number[] = this.getItemsLeftMargins(items);
        const maxItemWidth = LegendHelper.getMaxItemWidth(legendBlock.attr('width'), itemsLeftMargins, itemsDirection);

        items.nodes().forEach(node => {
            if (node.getBoundingClientRect().width > maxItemWidth) {
                const text = node.querySelector(`.${Legend.labelClass}`);
                let labelText = text.textContent;
                while (node.getBoundingClientRect().width > maxItemWidth && labelText.length > 3) {
                    labelText = labelText.substr(0, labelText.length - 1);
                    text.textContent = labelText + '...';
                }
            }
        });
    }

    private static getItemsLeftMargins(items: Selection<HTMLDivElement, string, BaseType, unknown>): number[] {
        return items.nodes().map(node => Helper.getPXValueFromString(DomHelper.getCssPropertyValue(node, 'margin-left')))
    }

    private static getItemsWidth(items: Selection<HTMLDivElement, string, BaseType, unknown>): number[] {
        return items.nodes().map(node => node.getBoundingClientRect().width);
    }
}