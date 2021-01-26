import * as d3 from "d3";
import { ChartOrientation } from "../../../config/config";
import { Block } from "../../block/block";

export class RecordOverflowAlert
{
    public static render(block: Block, hidedRecordsAmount: number, chartOrientation: ChartOrientation = null): void {
        const alertBlock = block.getWrapper()
            .append('div')
            .attr('class', 'record-overflow-alert')
            .text(this.getAlertText(hidedRecordsAmount, chartOrientation));

        this.setAlertStyle(alertBlock);
    }

    private static setAlertStyle(alertBlock: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>): void {
        alertBlock
            .style('position', 'absolute')
            .style('right', '17px')
            .style('top', '1rem');
    }

    private static getAlertText(hidedRecordsAmount: number, chartOrientation: ChartOrientation): string {
        return `+ ${hidedRecordsAmount} ${this.getWordTextEndingByAmount(hidedRecordsAmount, chartOrientation)}`;
    }

    private static getWordTextEndingByAmount(hidedRecordsAmount: number, chartOrientation: ChartOrientation): string {
        const digit = hidedRecordsAmount % 10;
        if(chartOrientation === 'vertical') {
            if(hidedRecordsAmount >= 10 && hidedRecordsAmount <= 20)
                return 'столбцов'; 
            if(digit === 1)
                return 'столбец';
            if(digit >= 2 && digit <= 4)
                return 'столбца';
            return 'столбцов';
        }
        else if (chartOrientation === 'horizontal') {
            if(hidedRecordsAmount >= 10 && hidedRecordsAmount <= 20)
                return 'строк'; 
            if(digit === 1)
                return 'строка';
            if(digit >= 2 && digit <= 4)
                return 'строки';
            return 'строк';
        } else {
            if(hidedRecordsAmount >= 10 && hidedRecordsAmount <= 20)
                return 'элементов'; 
            if(digit === 1)
                return 'элемент';
            if(digit >= 2 && digit <= 4)
                return 'элемента';
            return 'элементов';
        }
    }
}