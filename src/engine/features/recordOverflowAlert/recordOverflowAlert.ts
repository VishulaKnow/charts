import { Selection } from 'd3-selection'
import { ChartOrientation } from "../../../config/config";
import { Block } from "../../block/block";
import { Helper } from "../../helper";

interface AlertBlockPositionAttrs {
    top: string;
    bottom: string;
    right: string;
    left: string;
}
type AlertBlockPosition = 'top' | 'bottom' | 'right' | 'left';

export class RecordOverflowAlert
{
    public static render(block: Block, hidedRecordsAmount: number, position: AlertBlockPosition, chartOrientation: ChartOrientation = null): void {
        const alertBlock = block.getWrapper()
            .append('div')
            .attr('class', 'record-overflow-alert')
            .text(this.getAlertText(hidedRecordsAmount, chartOrientation));

        const attrs = this.getBlockPositionAttrs(position, block);

        this.setAlertPosition(alertBlock, attrs);
    }

    private static setAlertPosition(alertBlock: Selection<HTMLDivElement, unknown, HTMLElement, any>, attrs: AlertBlockPositionAttrs): void {
        alertBlock
            .style('position', 'absolute')
            .style('left', attrs.left)
            .style('right', attrs.right)
            .style('top', attrs.top)
            .style('bottom', attrs.bottom);
    }

    private static getAlertText(hidedRecordsAmount: number, chartOrientation: ChartOrientation): string {
        return `+ ${hidedRecordsAmount} ${this.getWordTextEndingByAmount(hidedRecordsAmount, chartOrientation)}`;
    }

    private static getWordTextEndingByAmount(hidedRecordsAmount: number, chartOrientation: ChartOrientation): string {
        const lastDigit = hidedRecordsAmount % 10;
        if(chartOrientation === 'vertical') {
            if(hidedRecordsAmount >= 10 && hidedRecordsAmount <= 20)
                return 'столбцов'; 
            if(lastDigit === 1)
                return 'столбец';
            if(lastDigit >= 2 && lastDigit <= 4)
                return 'столбца';
            return 'столбцов';
        }
        else if (chartOrientation === 'horizontal') {
            if(hidedRecordsAmount >= 10 && hidedRecordsAmount <= 20)
                return 'строк'; 
            if(lastDigit === 1)
                return 'строка';
            if(lastDigit >= 2 && lastDigit <= 4)
                return 'строки';
            return 'строк';
        } else {
            if(hidedRecordsAmount >= 10 && hidedRecordsAmount <= 20)
                return 'категорий'; 
            if(lastDigit === 1)
                return 'категория';
            if(lastDigit >= 2 && lastDigit <= 4)
                return 'категории';
            return 'категорий';
        }
    }

    private static getBlockPositionAttrs(position: AlertBlockPosition, block: Block): AlertBlockPositionAttrs {
        const attrs: AlertBlockPositionAttrs = {
            bottom: null,
            top: null,
            right: null,
            left: null
        }

        if(position === 'top') {
            attrs.right = '17px';
            attrs.top = '1rem';
        }

        if(position === 'right') {
            attrs.bottom = '20px';
            attrs.left = this.getLeftAttrForRightBlock(block) + 'px';
        }
        
        if(position === 'bottom') {
            attrs.left = '20px';
            attrs.bottom = '20px';
        }

        return attrs;
    }

    private static getLeftAttrForRightBlock(block: Block): number {
        const legendBlock = block.getSvg().select('.legend-object');
        if(legendBlock.empty())
            return null;
        
        return Helper.getSelectionNumericAttr(legendBlock, 'x');
    }
}