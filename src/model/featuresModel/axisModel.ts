import { AxisPosition, ChartOrientation } from "../../config/config";
import { AxisLabelPosition, BlockMargin, Orient, Size } from "../model";
import { ModelHelper } from "../modelHelper";
import { AxisType, CLASSES } from "../modelBuilder";

export interface LabelSize {
    width: number;
    height: number
}

export class AxisModel {
    public static getLabelSize(labelMaxWidth: number, labelTexts: any[]): LabelSize {
        const labelSize = {
            width: 0,
            height: 0
        }
        const textBlock = document.createElement('span');
        textBlock.style.position = 'absolute';
        textBlock.style.whiteSpace = 'nowrap';
        textBlock.classList.add(CLASSES.dataLabel);
        let maxLabel = '';
        let biggestScore = 0;
        let maxWidth = 0;
        labelTexts.forEach((text: string) => {
            if (ModelHelper.getStringScore(text) > biggestScore) {
                maxLabel = text;
                biggestScore = ModelHelper.getStringScore(text);
            }
        });
        textBlock.textContent = maxLabel === '0000' ? maxLabel : maxLabel + 'D';
        document.body.append(textBlock);
        maxWidth = Math.ceil(textBlock.getBoundingClientRect().width);
        labelSize.height = textBlock.getBoundingClientRect().height;
        labelSize.width = maxWidth > labelMaxWidth ? labelMaxWidth : maxWidth;
        textBlock.remove();
        return labelSize;
    }

    public static getAxisLength(chartOrientation: ChartOrientation, margin: BlockMargin, blockSize: Size): number {
        if (chartOrientation === 'horizontal') {
            return blockSize.height - margin.top - margin.bottom;
        } else {
            return blockSize.width - margin.left - margin.right;
        }
    }

    public static getAxisOrient(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition): Orient {
        if (chartOrientation === 'vertical') {
            if (axisPosition === 'start')
                return axisType === AxisType.Key ? 'top' : 'left';
            return axisType === AxisType.Key ? 'bottom' : 'right'
        }
        if (axisPosition === 'start')
            return axisType === AxisType.Key ? 'left' : 'top';
        return axisType === AxisType.Key ? 'right' : 'bottom'
    }

    public static getAxisTranslateX(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition, margin: BlockMargin, blockWidth: number): number {
        const orient = AxisModel.getAxisOrient(axisType, chartOrientation, axisPosition);
        if (orient === 'top' || orient === 'left')
            return margin.left;
        else if (orient === 'bottom')
            return margin.left;
        return blockWidth - margin.right;
    }

    public static getAxisTranslateY(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition, margin: BlockMargin, blockHeight: number): number {
        const orient = AxisModel.getAxisOrient(axisType, chartOrientation, axisPosition);
        if (orient === 'top' || orient === 'left')
            return margin.top;
        else if (orient === 'bottom')
            return blockHeight - margin.bottom;
        return margin.top;
    }

    public static getKeyAxisLabelPosition(margin: BlockMargin, blockSize: Size, scopedDataLength: number): AxisLabelPosition {
        const minBandSize = 50;
        if ((blockSize.width - margin.left - margin.right) / scopedDataLength < minBandSize)
            return 'rotated';

        return 'straight';
    }
}