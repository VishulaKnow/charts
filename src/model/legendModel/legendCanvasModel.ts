import { CLASSES } from "../modelOptions";

export class LegendCanvasModel
{
    public static getLegendHeight(texts: string[], blockWidth: number): number {
        const legendWrapper = document.createElement('div');
        legendWrapper.style.display = 'flex';
        legendWrapper.style.position = 'absolute';
        legendWrapper.style.flexWrap = 'wrap';
        legendWrapper.style.width = blockWidth + 'px';
        texts.forEach(text => {
            const itemWrapper = document.createElement('div');
            const colorBlock = document.createElement('span');
            const textBlock = document.createElement('span');
            itemWrapper.classList.add(CLASSES.legendItem);
            colorBlock.classList.add(CLASSES.legendColor);
            textBlock.classList.add(CLASSES.legendLabel);
            textBlock.textContent = text;
            itemWrapper.append(colorBlock, textBlock);
            legendWrapper.append(itemWrapper)
        });
        document.querySelector(`.${CLASSES.mainWrapper}`).append(legendWrapper);
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
        document.querySelector(`.${CLASSES.mainWrapper}`).append(itemWrapper);
        const sumWidth = itemWrapper.getBoundingClientRect().width 
            + parseFloat(window.getComputedStyle(itemWrapper, null).getPropertyValue('margin-left'))
            + parseFloat(window.getComputedStyle(itemWrapper, null).getPropertyValue('margin-right'));
        itemWrapper.remove();
        return sumWidth;
    }
}