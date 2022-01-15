import { LegendPosition } from "../../../model/model";
import { Block } from "../../block/block";
import { Legend } from "../../features/legend/legend";
import { AlertBlockPositionAttrs, RecordOverflowAlertCore, RecordOverflowAlertOptions, RecordOverflowAlertText } from "../../features/recordOverflowAlert/recordOverflowAlertCore";
import { DomHelper } from "../../helpers/domHelper";

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
        RecordOverflowAlertCore.render(block, this.buildCoreOptions(block, options));
    }

    update(block: Block, options: PolarRecordOverflowAlertOptions) {
        RecordOverflowAlertCore.update(block, this.buildCoreOptions(block, options));
    }

    private buildCoreOptions(block: Block, options: PolarRecordOverflowAlertOptions): RecordOverflowAlertOptions {
        return {
            hidedRecordsAmount: options.hidedRecordsAmount,
            text: this.text,
            positionAttrs: this.getPositionAttrs(block, options)
        }
    }

    private getPositionAttrs(block: Block, options: PolarRecordOverflowAlertOptions): AlertBlockPositionAttrs {
        const position = options.legendPosition === 'off' ? 'bottom' : options.legendPosition;
        if (position === 'right') {
            return {
                bottom: '20px',
                left: this.getLeftAttrForRightBlock(block) + 'px'
            }
        }

        if (position === 'bottom') {
            return {
                bottom: '20px',
                left: '20px'
            }
        }
    }

    private getLeftAttrForRightBlock(block: Block): number {
        const legendBlock = block.getSvg().select(`.${Legend.objectClass}`);
        if (legendBlock.empty())
            return 17;

        return DomHelper.getSelectionNumericAttr(legendBlock, 'x');
    }
}

export const PolarRecordOverflowAlert = new PolarRecordOverflowAlertClass();