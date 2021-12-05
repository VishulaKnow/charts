import { Size } from "../../config/config";
import { BlockMargin } from "../model";

export class CanvasModel {
    private blockSize: Size;
    private margin: BlockMargin;

    initMargin(margin: BlockMargin) {
        this.margin = margin;
    }

    getMargin() {
        return this.margin;
    }

    getMarginSide(side: keyof BlockMargin) {
        return this.margin[side];
    }

    setMarginSide(side: keyof BlockMargin, size: number) {
        this.margin[side] = size;
    }

    roundMargin() {
        this.margin.top = Math.ceil(this.margin.top);
        this.margin.bottom = Math.ceil(this.margin.bottom);
        this.margin.left = Math.ceil(this.margin.left);
        this.margin.right = Math.ceil(this.margin.right);
    }

    initBlockSize(blockSize: Size) {
        this.blockSize = blockSize;
    }

    getBlockSize() {
        return this.blockSize
    }

    getChartBlockWidth() {
        return this.blockSize.width - this.margin.left - this.margin.right;
    }

    getChartBlockHeight() {
        return this.blockSize.height - this.margin.top - this.margin.bottom;
    }
}