import { EmbeddedLabelsHelper, LABEL_BAR_PADDING } from "../../engine/features/embeddedLabels/embeddedLabelsHelper";
import { BlockMargin, Size } from "../../model/model";

describe('test postion and space', () => {
    const margin: BlockMargin = {
        bottom: 20,
        top: 20,
        left: 20,
        right: 20
    }
    const blockSize: Size = {
        height: 400,
        width: 500
    }

    describe('inside bar space', () => {
        test('should return space inside bar', () => {
            const barSize = 300;
            const result = EmbeddedLabelsHelper.getSpaceSizeForType('inside', barSize, margin, blockSize);
            expect(result).toBe(barSize - LABEL_BAR_PADDING * 2);
        });

        test('should return space inside bar', () => {
            const barSize = 100;
            const result = EmbeddedLabelsHelper.getSpaceSizeForType('inside', barSize, margin, blockSize);
            expect(result).toBe(barSize - LABEL_BAR_PADDING * 2);
        });
    });

    describe('outside bar space', () => {
        test('should return space outside bar', () => {
            const barSize = 300;
            const result = EmbeddedLabelsHelper.getSpaceSizeForType('outside', barSize, margin, blockSize);
            expect(result).toBe(blockSize.width - margin.left - margin.right - barSize - LABEL_BAR_PADDING);
        });
    });

    describe('label position test', () => {
        test('should return outside position because barSize < labelWidth', () => {
            const result = EmbeddedLabelsHelper.getLabelPosition(100, 200, margin, blockSize);
            expect(result).toEqual('outside');
        });

        test('should return inside position because barSize > labelWidth', () => {
            const result = EmbeddedLabelsHelper.getLabelPosition(100, 50, margin, blockSize);
            expect(result).toEqual('inside');
        });

        test('should return outside position because space in bar less than outside bar space, but labelwidth more than both spaces', () => {
            const result = EmbeddedLabelsHelper.getLabelPosition(100, 500, margin, blockSize);
            expect(result).toEqual('outside');
        });

        test('should return inside position because space in bar more than outside bar space, but labelwidth more than both spaces', () => {
            const result = EmbeddedLabelsHelper.getLabelPosition(300, 500, margin, blockSize);
            expect(result).toEqual('inside');
        });
    });
})