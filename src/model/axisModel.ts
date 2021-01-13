import { AxisPosition, ChartOrientation } from "../config/config";
import { BlockMargin, Orient, Size } from "./model";
import { AxisType, CLASSES } from "./modelOptions";

export class AxisModel
{
    static getLabelTextMaxWidth(legendMaxWidth: number, labelTexts: any[]): number {
        const textBlock = document.createElement('span');
        textBlock.classList.add(CLASSES.dataLabel);
        let maxWidth = 0;
        labelTexts.forEach((text: string) => {
            textBlock.textContent = text;
            document.querySelector(`.${CLASSES.mainWrapper}`).append(textBlock);
            if(textBlock.getBoundingClientRect().width > maxWidth) {
                maxWidth = textBlock.getBoundingClientRect().width;
            }
        });
        textBlock.remove();
        return maxWidth > legendMaxWidth ? legendMaxWidth : maxWidth;
    }

    static getAxisLength(chartOrientation: ChartOrientation, margin: BlockMargin, blockSize: Size): number {
        if(chartOrientation === 'horizontal') {
            return blockSize.height - margin.top - margin.bottom;
        } else {
            return blockSize.width - margin.left - margin.right;
        }
    }

    static getLabelHeight(cssClass: string): number {
        const span = document.createElement('span');
        span.classList.add(cssClass);
        document.querySelector(`.${CLASSES.mainWrapper}`).append(span)    
        const size = parseFloat(window.getComputedStyle(span, null).getPropertyValue('font-size'));
        span.remove();
        return size;
    }

    static getAxisOrient(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition): Orient {
        if(chartOrientation === 'vertical') {
            if(axisPosition === 'start')
                return axisType === AxisType.Key ? 'top' : 'left';
            else
                return axisType === AxisType.Key ? 'bottom' : 'right'
        } else {
            if(axisPosition === 'start')
                return axisType === AxisType.Key ? 'left' : 'top';
            else
                return axisType === AxisType.Key ? 'right' : 'bottom'
        }
    }

    static getAxisTranslateX(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition, margin: BlockMargin, blockWidth: number): number {
        const orient = AxisModel.getAxisOrient(axisType, chartOrientation, axisPosition);
        if(orient === 'top' || orient === 'left')
            return margin.left;
        else if(orient === 'bottom') 
            return margin.left;
        else
            return blockWidth - margin.right;
    }
    
    static getAxisTranslateY(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition, margin: BlockMargin, blockHeight: number): number {
        const orient = AxisModel.getAxisOrient(axisType, chartOrientation, axisPosition);
        if(orient === 'top' || orient === 'left')
            return margin.top;
        else if(orient === 'bottom') 
            return blockHeight - margin.bottom;
        else
            return margin.top;
    }
}