import { ChartOrientation } from "../../../config/config";
import { Block } from "../../block/block";
import { AlertBlockPositionAttrs, RecordOverflowAlertCore, RecordOverflowAlertOptions, RecordOverflowAlertText } from "../../features/recordOverflowAlert/recordOverflowAlertCore";

interface TwoDimRecordOverflowAlertOptions {
    hidedRecordsAmount: number;
    chartOrientation: ChartOrientation;
}

class TwoDimRecordOverflowAlertClass {
    render(block: Block, options: TwoDimRecordOverflowAlertOptions) {
        RecordOverflowAlertCore.render(block, this.buildCoreOptions(options));
    }

    update(block: Block, options: TwoDimRecordOverflowAlertOptions) {
        RecordOverflowAlertCore.update(block, this.buildCoreOptions(options));
    }

    private buildCoreOptions(options: TwoDimRecordOverflowAlertOptions): RecordOverflowAlertOptions {
        return {
            hidedRecordsAmount: options.hidedRecordsAmount,
            text: this.getText(options.chartOrientation),
            positionAttrs: this.getPositionAttrs()
        }
    }

    private getText(chartOrientation: ChartOrientation): RecordOverflowAlertText {
        const isHorizontal = chartOrientation === 'horizontal';
        return {
            one: isHorizontal ? 'строка' : 'столбец',
            twoToFour: isHorizontal ? 'строки' : 'столбца',
            tenToTwenty: isHorizontal ? 'строк' : 'столбцов',
            other: isHorizontal ? 'строк' : 'столбцов'
        }
    }

    private getPositionAttrs(): AlertBlockPositionAttrs {
        return {
            right: '0px',
            top: '0px'
        }
    }
}

export const TwoDimRecordOverflowAlert = new TwoDimRecordOverflowAlertClass();