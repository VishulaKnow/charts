import { AxisScale } from "d3-axis";
import { ChartOrientation } from "../../../config/config";
import { BlockMargin, Orient } from "../../../model/model";
import { Helper } from "../../helpers/helper";
import { Scale } from "../scale/scale";
import { ARROW_DEFAULT_POSITION, TooltipCoordinate, TooltipLineAttributes, TOOLTIP_ARROW_PADDING_X, TOOLTIP_ARROW_PADDING_Y } from "./tooltipDomHelper";
import { Size } from "../../../config/config";

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
        const coordinate: TooltipCoordinate = {
            top: null,
            bottom: null,
            left: null,
            right: null
        }
        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            coordinate.top = margin.top - 5 - tooltipBoundingRect.height + 'px'
            coordinate.left = Scale.getScaledValue(scaleKey, keyValue) + margin.left - tooltipBoundingRect.width / 2 + 'px';
        }
        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            coordinate.top = Scale.getScaledValue(scaleKey, keyValue) + margin.top - tooltipBoundingRect.height / 2 + 'px';
        }
        // Пересчет относительно viewPort'а
        return this.recalcToolTipCoordinateByViewPort(blockBoundingRect, tooltipBoundingRect, keyAxisOrient, coordinate, winWidth, winHeight);
        // Пересчет относительно block'а
        // return TooltipHelper.recalcToolTipCoordinateByBlock( blockSize, tooltipBoundingRect, keyAxisOrient, coordinate);
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

    public static recalcToolTipCoordinateByViewPort(blockBounding: DOMRect, tooltipBounding: DOMRect, keyAxisOrient: Orient, coordinate: TooltipCoordinate, winWidth: number, winHeight: number): TooltipCoordinate {
        const tooltipWidth = tooltipBounding.width;
        const blockPadLeft = blockBounding.left;
        const scrollPad = 20;

        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            const tooltipPositionAtBlock = Helper.getPXValueFromString(coordinate.left);
            const tooltipRight = (blockPadLeft + tooltipPositionAtBlock) + tooltipWidth;
            // проверка слева
            if (tooltipPositionAtBlock < 0 && -tooltipPositionAtBlock > blockPadLeft)
                coordinate.left = -blockPadLeft + 'px';
            // проверка справа
            if (tooltipRight > winWidth)
                coordinate.left = winWidth - blockPadLeft - tooltipWidth - scrollPad + 'px';

            if (keyAxisOrient === 'top') {
                coordinate.bottom = '0px';
                coordinate.top = null;
            }
        }
        if (keyAxisOrient === 'right') { // если ось ключей справа, то тултип слева
            if (tooltipWidth - this.convexsize * 2 > blockPadLeft) // Если ширина тултипа - свдиг влево для сопряжения > Расстояния от левого края блока до левого края видимой области 
                coordinate.left = -blockPadLeft + 'px'; // позиция от края видимой области слева
            else
                coordinate.left = -tooltipWidth + this.convexsize * 3 + 'px'; // позиция сопряженная с линией тултипа
        }
        if (keyAxisOrient === 'left') { // если ось ключей слева, то тултип справа
            const blockPadRight = winWidth - blockBounding.right - scrollPad;
            if (tooltipWidth - this.convexsize * 2 > blockPadRight)
                coordinate.right = -blockPadRight + 'px'; // позиция от края видимой области справа
            else
                coordinate.right = -tooltipWidth + this.convexsize * 3 + 'px'; // позиция сопряженная с линией тултипа 
        }

        return coordinate;
    }

    private static recalcToolTipCoordinateByBlock(blockSize: Size, tooltipBoundingRect: DOMRect, keyAxisOrient: Orient, coordinate: TooltipCoordinate): TooltipCoordinate {
        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
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
        } else {
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
        }

        return coordinate;
    }

}