import { BlockMargin } from "../../../model";

export type MarginSide = keyof BlockMargin;

export interface CanvasMarginModel {
    initMargin(margin: BlockMargin): void;
    getMargin(): BlockMargin;
    getMarginSide(side: MarginSide): number;
    setMarginSide(side: MarginSide, size: number): void;
    increaseMarginSide(side: MarginSide, byValue: number, key?: string): void;
    decreaseMarginSide(side: MarginSide, byValue: number): void;
    roundMargin(): void;
}