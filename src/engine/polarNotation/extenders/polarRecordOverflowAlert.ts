import { LegendPosition } from "../../../model/model";
import { Block } from "../../block/block";
import { AlertBlockPositionAttrs, RecordOverflowAlertCore, RecordOverflowAlertOptions, RecordOverflowAlertText } from "../../features/recordOverflowAlert/recordOverflowAlertCore";

interface PolarRecordOverflowAlertOptions {
    hidedRecordsAmount: number;
    legendPosition: LegendPosition;
}

class PolarRecordOverflowAlertClass {
    private readonly text: RecordOverflowAlertText = {
        one: 'категория',
        twoToFour: 'категории',
        tenToTwenty: 'категорий',
        other: 'категорий'
    }

    render(block: Block, options: PolarRecordOverflowAlertOptions) {
        RecordOverflowAlertCore.render(block, this.buildCoreOptions(options));
    }

    update(block: Block, options: PolarRecordOverflowAlertOptions) {
        RecordOverflowAlertCore.update(block, this.buildCoreOptions(options));
    }

    private buildCoreOptions(options: PolarRecordOverflowAlertOptions): RecordOverflowAlertOptions {
        return {
            hidedRecordsAmount: options.hidedRecordsAmount,
            text: this.text,
            positionAttrs: this.getPositionAttrs(options)
        }
    }

    private getPositionAttrs(options: PolarRecordOverflowAlertOptions): AlertBlockPositionAttrs {
        const position = options.legendPosition === 'off' ? 'bottom' : options.legendPosition;
        if (position === 'right') {
            return {
                bottom: '0px',
                right: '0px'
            }
        }

        if (position === 'bottom') {
            return {
                bottom: '0',
                left: '20px'
            }
        }
    }
}

export const PolarRecordOverflowAlert = new PolarRecordOverflowAlertClass();