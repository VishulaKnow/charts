import * as d3 from "d3";
import { ChartOrientation } from "../../../config/config";
import { Block } from "../../block/block";

interface AlertBlockPositionAttrs {
    top: string;
    bottom: string;
    right: string;
}
type AlertBlockPosition = 'top' | 'bottom';

export class RecordOverflowAlert
{
    public static render(block: Block, hidedRecordsAmount: number, position: AlertBlockPosition, chartOrientation: ChartOrientation = null): void {
        const alertBlock = block.getWrapper()
            .append('div')
            .attr('class', 'record-overflow-alert')
            .text(this.getAlertText(hidedRecordsAmount, chartOrientation));

        const attrs = this.getBlockPositionAttrs(position);

        this.setAlertStyle(alertBlock, attrs);
    }

    private static setAlertStyle(alertBlock: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>, attrs: AlertBlockPositionAttrs): void {
        alertBlock
            .style('position', 'absolute')
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

    private static getBlockPositionAttrs(position: AlertBlockPosition): AlertBlockPositionAttrs {
        const attrs: AlertBlockPositionAttrs = {
            bottom: null,
            top: null,
            right: null
        }
        
        attrs.right = '17px';
        if(position === 'bottom')
            attrs.bottom = '28px';
        else
            attrs.top = '1rem';

        return attrs;
    }
}