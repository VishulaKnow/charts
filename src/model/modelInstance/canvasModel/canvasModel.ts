import { Size } from "../../../config/config";
import { BlockMargin } from "../../model";
import { LegendCanvasModelInstance } from "./legendCanvasModel";
import { TitleCanvasModel } from "./titleCanvas";

type MarginSide = keyof BlockMargin;

export class CanvasModel {
    titleCanvas: TitleCanvasModel;
    legendCanvas: LegendCanvasModelInstance;

    private blockSize: Size;
    private margin: BlockMargin;

    constructor() {
        this.titleCanvas = new TitleCanvasModel();
        this.legendCanvas = new LegendCanvasModelInstance();
    }

    initMargin(margin: BlockMargin) {
        this.margin = margin;
    }

    getMargin() {
        return this.margin;
    }

    getMarginSide(side: MarginSide) {
        return this.margin[side];
    }

    setMarginSide(side: MarginSide, size: number) {
        this.margin[side] = size;
    }

    increaseMarginSide(side: MarginSide, byValue: number) {
        this.margin[side] += byValue;
    }

    descreaseMarginSide(side: MarginSide, byValue: number) {
        this.margin[side] -= byValue;
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