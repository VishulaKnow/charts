import { Block } from "../../block/block";
import { Selection } from "d3-selection";

export interface RecordOverflowAlertOptions {
    hidedRecordsAmount: number;
    text: RecordOverflowAlertText;
    positionAttrs: AlertBlockPositionAttrs;
}

export interface RecordOverflowAlertText {
    one: string;
    twoToFour: string;
    tenToTwenty: string;
    other: string;
}

export interface AlertBlockPositionAttrs {
    top?: string;
    bottom?: string;
    right?: string;
    left?: string;
}

class RecordOverflowAlertCoreClass {
    private readonly blockClass = "record-overflow-alert";

    public render(block: Block, options: RecordOverflowAlertOptions): void {
        const alertBlock = block
            .getWrapper()
            .append("div")
            .attr("class", this.blockClass)
            .text(this.getAlertText(options));

        this.setAlertPosition(alertBlock, options.positionAttrs);
    }

    public update(block: Block, options: RecordOverflowAlertOptions): void {
        let alertBlock = block.getWrapper().select(`div.${this.blockClass}`);

        if (alertBlock.empty()) {
            if (options.hidedRecordsAmount === 0) return;
            else this.render(block, options);
        } else {
            if (options.hidedRecordsAmount === 0) alertBlock.remove();
            else alertBlock.text(this.getAlertText(options));
        }
    }

    private getAlertText(options: RecordOverflowAlertOptions) {
        return `+ ${options.hidedRecordsAmount} ${this.getWordTextEndingByAmount(
            options.hidedRecordsAmount,
            options.text
        )}`;
    }

    private getWordTextEndingByAmount(hidedRecordsAmount: number, text: RecordOverflowAlertText): string {
        const lastDigit = hidedRecordsAmount % 10;
        if (hidedRecordsAmount >= 10 && hidedRecordsAmount <= 20) return text.tenToTwenty;
        if (lastDigit === 1) return text.one;
        if (lastDigit >= 2 && lastDigit <= 4) return text.twoToFour;
        return text.other;
    }

    private setAlertPosition(
        alertBlock: Selection<HTMLDivElement, unknown, HTMLElement, any>,
        attrs: AlertBlockPositionAttrs
    ): void {
        alertBlock
            .style("position", "absolute")
            .style("left", attrs.left)
            .style("right", attrs.right)
            .style("top", attrs.top)
            .style("bottom", attrs.bottom);
    }
}

export const RecordOverflowAlertCore = new RecordOverflowAlertCoreClass();
