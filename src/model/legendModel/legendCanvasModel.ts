import { LegendPosition } from "../../config/config";
import { CLASSES } from "../modelOptions";
import { LegendModel } from "./legendModel";

export type LegendItemsDirection = 'row' | 'column'

export class LegendCanvasModel
{
    public static getLegendHeight(texts: string[], blockWidth: number, marginLeft: number, marginRight: number, itemsPosition: LegendItemsDirection, legendPosition: LegendPosition): number {
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
            if(itemsPosition === 'column')
                itemWrapper.classList.add(LegendModel.getMarginClass(legendPosition));
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

    public static findElementsAmountByLegendSize(texts: string[], position: LegendPosition, legendBlockWidth: number, legendBlockHeight: number): number {
        const legendWrapper = document.createElement('div');
        legendWrapper.style.display = 'flex';
        legendWrapper.style.flexDirection = 'column';
        legendWrapper.style.position = 'absolute';

        legendWrapper.style.width = legendBlockWidth + 'px';
        document.body.append(legendWrapper);
        let amount = 0;

        for(let i = 0; i < texts.length; i++) {
            const itemWrapper = document.createElement('div');
            const colorBlock = document.createElement('span');
            const textBlock = document.createElement('span');
            itemWrapper.classList.add('legend-item-row');
            
            if(position === 'bottom')
                textBlock.classList.add('legend-label-nowrap', 'mt-10');
            else
                itemWrapper.classList.add('mt-15');

            colorBlock.classList.add(CLASSES.legendColor);
            textBlock.classList.add(CLASSES.legendLabel);
            textBlock.textContent = texts[i];
            itemWrapper.append(colorBlock, textBlock);
            legendWrapper.append(itemWrapper);

            if(legendWrapper.offsetHeight > legendBlockHeight) {
                itemWrapper.remove();
                if(legendBlockHeight - legendWrapper.offsetHeight >= 15 && position !== 'bottom')
                    amount = i;
                else 
                    amount = i - 1;
                break;
            }
            amount++;
        }
        legendWrapper.remove();
        
        return amount < 0 ? 0 : amount;
    }
}