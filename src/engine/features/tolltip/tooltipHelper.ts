import { AxisScale } from "d3-axis";
import { ChartOrientation } from "../../../config/config";
import { BlockMargin, Orient } from "../../../model/model";
import { Helper } from "../../helpers/helper";
import { Scale } from "../scale/scale";
import { ARROW_DEFAULT_POSITION, TooltipCoordinate, TooltipLineAttributes, TOOLTIP_ARROW_PADDING_X, TOOLTIP_ARROW_PADDING_Y } from "./tooltipDomHelper";
import { Size } from "../../../config/config";
export class TooltipHelper {
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

    public static getTooltipFixedCoordinate(scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size, keyValue: string, tooltipBoundingRect: DOMRect, keyAxisOrient: Orient): TooltipCoordinate {
        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            const coordinate: TooltipCoordinate = {
                top: margin.top - 5 - tooltipBoundingRect.height + 'px',
                bottom: null,
                left: Scale.getScaledValue(scaleKey, keyValue) + margin.left - tooltipBoundingRect.width / 2 + 'px',
                right: null
            }

            if (Helper.getPXValueFromString(coordinate.left) < 0)
                coordinate.left = 0 + 'px';

            if (Helper.getPXValueFromString(coordinate.left) + tooltipBoundingRect.width > blockSize.width) {
                coordinate.left = null;
                coordinate.right = 0 + 'px';
            }

            if (keyAxisOrient === 'top') {
                coordinate.top = null;
                coordinate.bottom = 0 + 'px';
            }

            return coordinate;
        } else {
            const coordinate: TooltipCoordinate = {
                top: Scale.getScaledValue(scaleKey, keyValue) + margin.top - tooltipBoundingRect.height / 2 + 'px',
                left: 0 + 'px',
                bottom: null,
                right: null
            }

            if (Helper.getPXValueFromString(coordinate.top) < 0)
                coordinate.top = 0 + 'px';

            if (Helper.getPXValueFromString(coordinate.top) + tooltipBoundingRect.height > blockSize.height) {
                coordinate.top = null;
                coordinate.bottom = 0 + 'px';
            }

            if (keyAxisOrient === 'left') {
                coordinate.left = null;
                coordinate.right = 0 + 'px';
            }

            return coordinate;
        }
    }

    public static getTooltipLineAttributes(scaleKey: AxisScale<any>, margin: BlockMargin, key: string, chartOrientation: ChartOrientation, blockSize: Size): TooltipLineAttributes {
        const convexSize = 5;
        const attributes: TooltipLineAttributes = {
            x1: 0, x2: 0, y1: 0, y2: 0
        }

        if (chartOrientation === 'vertical') {
            attributes.x1 = Math.ceil(Scale.getScaledValue(scaleKey, key) + margin.left) - 0.5;
            attributes.x2 = Math.ceil(Scale.getScaledValue(scaleKey, key) + margin.left) - 0.5;
            attributes.y1 = margin.top - convexSize;
            attributes.y2 = blockSize.height - margin.bottom + convexSize * 2;
        } else {
            attributes.x1 = margin.left - convexSize;
            attributes.x2 = blockSize.width - margin.right + convexSize * 2;
            attributes.y1 = Scale.getScaledValue(scaleKey, key) + margin.top;
            attributes.y2 = Scale.getScaledValue(scaleKey, key) + margin.top;
        }

        return attributes;
    }
}