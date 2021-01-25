import { AxisPosition, ChartOrientation } from "../config/config";
import { BlockMargin, Orient, Size } from "./model";
import { AxisType, CLASSES } from "./modelOptions";

interface LabelSize {
    width: number;
    height: number
}

export class AxisModel
{
    public static getLabelSize(labelMaxWidth: number, labelTexts: any[]): LabelSize {
        const labelSize = {
            width: 0,
            height: 0
        }
        const textBlock = document.createElement('span');
        textBlock.style.position = 'absolute';
        textBlock.classList.add(CLASSES.dataLabel);
        let maxLabel = '';
        let maxWidth = 0;
        labelTexts.forEach((text: string) => {
            if(text.length > maxLabel.length)
                maxLabel = text;
        });
        textBlock.textContent = maxLabel;
        document.body.append(textBlock);
        maxWidth = textBlock.getBoundingClientRect().width;
        labelSize.height = textBlock.getBoundingClientRect().height;
        labelSize.width = maxWidth > labelMaxWidth ? labelMaxWidth : maxWidth;
        textBlock.remove();
        return labelSize;
    }

    public static getAxisLength(chartOrientation: ChartOrientation, margin: BlockMargin, blockSize: Size): number {
        if(chartOrientation === 'horizontal') {
            return blockSize.height - margin.top - margin.bottom;
        } else {
            return blockSize.width - margin.left - margin.right;
        }
    }

    public static getAxisOrient(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition): Orient {
        if(chartOrientation === 'vertical') {
            if(axisPosition === 'start')
                return axisType === AxisType.Key ? 'top' : 'left';
            return axisType === AxisType.Key ? 'bottom' : 'right'
        } else {
            if(axisPosition === 'start')
                return axisType === AxisType.Key ? 'left' : 'top';
            return axisType === AxisType.Key ? 'right' : 'bottom'
        }
    }

    public static getAxisTranslateX(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition, margin: BlockMargin, blockWidth: number): number {
        const orient = AxisModel.getAxisOrient(axisType, chartOrientation, axisPosition);
        if(orient === 'top' || orient === 'left')
            return margin.left;
        else if(orient === 'bottom') 
            return margin.left;
        return blockWidth - margin.right;
    }
    
    public static getAxisTranslateY(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition, margin: BlockMargin, blockHeight: number): number {
        const orient = AxisModel.getAxisOrient(axisType, chartOrientation, axisPosition);
        if(orient === 'top' || orient === 'left')
            return margin.top;
        else if(orient === 'bottom') 
            return blockHeight - margin.bottom;
        return margin.top;
    }
}