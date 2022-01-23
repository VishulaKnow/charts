import { LegendPosition } from "../../model";
import { CLASSES } from "../../modelBuilder";
import { LegendModel } from "./legendModel";

export type LegendItemsDirection = 'row' | 'column'

export class LegendCanvasModel {
    public static getLegendHeight(texts: string[], chartBlockWidth: number, itemsDirection: LegendItemsDirection, legendPosition: LegendPosition): number {
        const legendWrapper = this.getLegendWrapperEl(chartBlockWidth, itemsDirection);
        texts.forEach(text => {
            const itemWrapper = document.createElement('div');
            const colorBlock = document.createElement('span');
            const textBlock = document.createElement('span');

            itemWrapper.classList.add("legend-item");

            if (legendPosition === 'bottom') {
                itemWrapper.classList.add('legend-item-inline');
                textBlock.classList.add('legend-label-nowrap');
            }
            else {
                itemWrapper.classList.add('legend-item-row');
            }

            colorBlock.classList.add(CLASSES.legendColor);
            textBlock.classList.add(CLASSES.legendLabel);
            textBlock.textContent = text;
            itemWrapper.append(colorBlock, textBlock);
            legendWrapper.append(itemWrapper);
        });
        document.body.append(legendWrapper);
        const height = legendWrapper.offsetHeight;
        legendWrapper.remove();
        return height;
    }

    public static getLegendItemWidth(text: string): number {
        const itemWrapper = document.createElement('div');
        itemWrapper.style.opacity = '0';
        const colorBlock = document.createElement('span');
        const textBlock = document.createElement('span');

        itemWrapper.style.display = 'inline-block';
        itemWrapper.classList.add(CLASSES.legendItem);
        colorBlock.classList.add(CLASSES.legendColor);
        textBlock.classList.add(CLASSES.legendLabel);

        textBlock.textContent = text;
        itemWrapper.append(colorBlock, textBlock);

        document.body.append(itemWrapper);

        const sumWidth = itemWrapper.getBoundingClientRect().width
            + parseFloat(window.getComputedStyle(itemWrapper, null).getPropertyValue('margin-left'))
            + parseFloat(window.getComputedStyle(itemWrapper, null).getPropertyValue('margin-right'));

        itemWrapper.remove();
        return sumWidth;
    }

    public static findElementsAmountByLegendSize(texts: string[], position: LegendPosition, legendBlockWidth: number, legendBlockHeight: number): { amount: number; size: { width: number; height: number; } } {
        const legendWrapper = this.getLegendWrapperEl(legendBlockWidth, position === "right" ? "column" : "row");
        document.body.append(legendWrapper);
        let amount = 0;

        for (let i = 0; i < texts.length; i++) {
            const itemWrapper = document.createElement('div');
            const colorBlock = document.createElement('span');
            const textBlock = document.createElement('span');

            itemWrapper.classList.add("legend-item");

            if (position === 'bottom') {
                itemWrapper.classList.add('legend-item-inline');
                textBlock.classList.add('legend-label-nowrap');
            }
            else {
                itemWrapper.classList.add('legend-item-row');
            }

            colorBlock.classList.add(CLASSES.legendColor);
            textBlock.classList.add(CLASSES.legendLabel);
            textBlock.textContent = texts[i];
            itemWrapper.append(colorBlock, textBlock);
            legendWrapper.append(itemWrapper);

            if (legendWrapper.offsetHeight > legendBlockHeight) {
                itemWrapper.remove();
                if (legendBlockHeight - legendWrapper.offsetHeight >= 15 && position !== 'bottom')
                    amount = i;
                else
                    amount = i - 1;
                break;
            }
            amount++;
        }
        const size = {
            width: legendWrapper.offsetWidth,
            height: legendWrapper.offsetHeight
        }
        // debugger;

        legendWrapper.remove();

        return {
            amount: amount < 0 ? 0 : amount,
            size
        }
    }

    private static getLegendWrapperEl(legendBlockWidth: number, itemsDirection: LegendItemsDirection) {
        const legendWrapper = document.createElement('div');
        legendWrapper.style.opacity = '0';
        legendWrapper.style.position = 'absolute';

        legendWrapper.style.display = "flex";
        if (itemsDirection === "column")
            legendWrapper.classList.add("legend-block-column");
        else
            legendWrapper.classList.add("legend-block-row", "legend-wrapper-with-wrap");

        legendWrapper.style.maxWidth = legendBlockWidth + 'px';

        return legendWrapper;
    }
}