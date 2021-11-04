import { AxisScale } from "d3-axis";
import { ChartOrientation } from "../../../config/config";
import { BlockMargin, Orient } from "../../../model/model";
import { Scale } from "../scale/scale";
import { ARROW_DEFAULT_POSITION, TooltipLineAttributes, TOOLTIP_ARROW_PADDING_X, TOOLTIP_ARROW_PADDING_Y } from "./tooltipDomHelper";
import { Size } from "../../../config/config";
import { TooltipCoordinate } from "./newTooltip/newTooltip";
import { TooltipPreCoordinate, TooltipService } from "./newTooltip/newTooltipService";

export class TooltipHelper {
    private static convexsize = 5;

    public static getHorizontalPad(coordinateX: number, tooltipBlockWidth: number, blockSize: Size, translateX: number): number {
        let pad = 0;
        if (tooltipBlockWidth + coordinateX - TOOLTIP_ARROW_PADDING_X + translateX > blockSize.width)
            pad = tooltipBlockWidth + coordinateX - TOOLTIP_ARROW_PADDING_X + translateX - blockSize.width;

        return pad;
    }

    public static getVerticalPad(coordinateY: number, tooltipBlockHeight: number, translateY: number): number {
        let pad = 0;
        if (coordinateY - TOOLTIP_ARROW_PADDING_Y - tooltipBlockHeight + translateY < -tooltipBlockHeight - TOOLTIP_ARROW_PADDING_Y)
            pad = coordinateY;

        return pad; // return zero or sub zero
    }

    public static getTooltipArrowPadding(tooltipBlockWidth: number, horizontalPad: number): number {
        return horizontalPad > tooltipBlockWidth
            ? tooltipBlockWidth - ARROW_DEFAULT_POSITION - 20 * Math.sqrt(2)
            : horizontalPad; // If tooltip arrow has coordinate outside svg, it take X position in end of tooltip block
    }

    public static getCoordinateByPointer(pointer: [number, number]): TooltipCoordinate {
        const coordinate: TooltipCoordinate = {
            left: null,
            top: null,
            right: null,
            bottom: null
        }

        coordinate.left = pointer[0] + 'px';
        coordinate.top = pointer[1] + 'px';

        return coordinate;
    }

    public static getTooltipFixedCoordinate(scaleKey: AxisScale<any>, margin: BlockMargin, keyValue: string, blockBoundingRect: DOMRect, tooltipBoundingRect: DOMRect, keyAxisOrient: Orient, winWidth: number, winHeight: number): TooltipCoordinate {
        const coordinate: TooltipPreCoordinate = {
            top: null,
            left: null
        }
        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            coordinate.left = Scale.getScaledValue(scaleKey, keyValue) + margin.left - tooltipBoundingRect.width / 2;
            if (keyAxisOrient === 'bottom')
                coordinate.top = margin.top - 5 - tooltipBoundingRect.height;
            else
                coordinate.top = blockBoundingRect.height - margin.bottom;
        }
        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            coordinate.top = Scale.getScaledValue(scaleKey, keyValue) + margin.top - tooltipBoundingRect.height / 2;
            if (keyAxisOrient === 'left')
                coordinate.left = blockBoundingRect.width - margin.right;
            else
                coordinate.left = margin.left - tooltipBoundingRect.width;
        }

        return this.recalcToolTipCoordinateByViewPort(blockBoundingRect, tooltipBoundingRect, coordinate, winWidth, winHeight);
    }

    public static getTooltipCursorCoordinate(pointer: [number, number], blockBoundingRect: DOMRect, tooltipBoundingRect: DOMRect): TooltipCoordinate {
        const pad = 10;
        const coordinate: TooltipPreCoordinate = {
            top: pointer[1] + pad,
            left: pointer[0] + pad
        }

        return this.recalcToolTipCoordinateByViewPort(blockBoundingRect, tooltipBoundingRect, coordinate, window.innerWidth, window.innerHeight)
    }

    public static getTooltipLineAttributes(scaleKey: AxisScale<any>, margin: BlockMargin, key: string, chartOrientation: ChartOrientation, blockSize: Size): TooltipLineAttributes {
        const attributes: TooltipLineAttributes = {
            x1: 0, x2: 0, y1: 0, y2: 0
        }

        if (chartOrientation === 'vertical') {
            attributes.x1 = Math.ceil(Scale.getScaledValue(scaleKey, key) + margin.left) - 0.5;
            attributes.x2 = Math.ceil(Scale.getScaledValue(scaleKey, key) + margin.left) - 0.5;
            attributes.y1 = margin.top - this.convexsize;
            attributes.y2 = blockSize.height - margin.bottom + this.convexsize * 2;
        } else {
            attributes.x1 = margin.left - this.convexsize;
            attributes.x2 = blockSize.width - margin.right + this.convexsize * 2;
            attributes.y1 = Scale.getScaledValue(scaleKey, key) + margin.top;
            attributes.y2 = Scale.getScaledValue(scaleKey, key) + margin.top;
        }

        return attributes;
    }

    public static recalcToolTipCoordinateByViewPort(blockBounding: DOMRect, tooltipBounding: DOMRect, preCoordinate: TooltipPreCoordinate, winWidth: number, winHeight: number): TooltipCoordinate {
        const res = TooltipService.getTooltipByWindow(tooltipBounding, preCoordinate, {
            width: winWidth,
            height: winHeight
        }, blockBounding);
        return {
            left: res.left + 'px',
            top: res.top + 'px',
            right: null,
            bottom: null
        }
    }
}