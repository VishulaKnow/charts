import * as d3 from "d3";

export class RecordOverflowAlert
{
    public static render(hidedRecordsAmount: number): void {
        const alertBlock = d3.select('.wrapper')
            .append('div')
            .attr('class', 'record-overflow-alert');
        alertBlock
            .append('p')
            .text(this.getAlertText(hidedRecordsAmount));
        const btnClose = alertBlock
            .append('button')
            .attr('class', 'btn-close')
            .html('&times;');

        this.setAlertStyle(alertBlock);
        this.setButtonCloseEvent(btnClose, alertBlock);
    }

    private static setAlertStyle(alertBlock: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>): void {
        alertBlock
            .style('position', 'absolute')
            .style('right', '1rem')
            .style('top', '1rem');
    }

    private static setButtonCloseEvent(button: d3.Selection<HTMLButtonElement, unknown, HTMLElement, any>, alertBlock: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>): void {
        button
            .on('click', function(e) {
                alertBlock.style('display', 'none');
            });
    }

    private static getAlertText(hidedRecordsAmount: number): string {
        return `Ещё ${hidedRecordsAmount} ${this.getWordTextEndingByAmount(hidedRecordsAmount)}`;
    }

    private static getWordTextEndingByAmount(hidedRecordsAmount: number): string {
        const digit = hidedRecordsAmount % 10;
        if(hidedRecordsAmount >= 10 && hidedRecordsAmount <= 20)
            return 'элементов скрыто.'; 
        if(digit === 1)
            return 'элемент скрыт.';
        if(digit >= 2 && digit <= 4)
            return 'элемента скрыто.';
        return 'элементов скрыто.';
    }
}