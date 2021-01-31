import { CLASSES } from "../modelOptions";
import { LegendModel } from "./legendModel";

export type LegendItemsDirection = 'row' | 'column'

export class LegendCanvasModel
{
    public static getLegendHeight(texts: string[], blockWidth: number, marginLeft: number, marginRight: number, itemsPosition: LegendItemsDirection): number {
        const legendWrapper = document.createElement('div');
        legendWrapper.style.display = 'flex';
        if(itemsPosition === 'column')
            legendWrapper.style.flexDirection = 'column';
        legendWrapper.style.position = 'absolute';
        legendWrapper.style.width = blockWidth - marginLeft - marginRight + 'px';
        texts.forEach(text => {
            const itemWrapper = document.createElement('div');
            const colorBlock = document.createElement('span');
            const textBlock = document.createElement('span');
            itemWrapper.classList.add(LegendModel.getLegendItemClass(itemsPosition));
            colorBlock.classList.add(CLASSES.legendColor);
            textBlock.classList.add(CLASSES.legendLabel);
            textBlock.textContent = text;
            itemWrapper.append(colorBlock, textBlock);
            legendWrapper.append(itemWrapper)
        });
        document.body.append(legendWrapper);
        const height = legendWrapper.offsetHeight;
        legendWrapper.remove();
        return height;
    }
    
    public static getLegendItemWidth(text: string): number {
        const itemWrapper = document.createElement('div');
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
}