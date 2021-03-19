import { AxisScale } from "d3-axis";
import { BlockMargin, Orient, Size } from "../../../model/model";
import { Block } from "../../block/block";
import { DomHelper } from "../../helpers/domHelper";
import { ARROW_DEFAULT_POSITION, CONVEXSIZE, TooltipCoordinate, TooltipDomHelper, TOOLTIP_ARROW_PADDING_X, TOOLTIP_ARROW_PADDING_Y } from "./tooltipDomHelper";

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

    public static recalcToolTipCoordinateByViewPort(block: Block,  tooltipBlockElement: HTMLElement, keyAxisOrient: Orient, coordinate: TooltipCoordinate): TooltipCoordinate {
        const windowWidth: number = window.innerWidth; 
        const tooltipWidth=  tooltipBlockElement.getBoundingClientRect().width 
        const blockPadLeft = block.getSvg().node().getBoundingClientRect().left 
        const blockPadRight = block.getSvg().node().getBoundingClientRect().right - block.getSvg().node().getBoundingClientRect().width
        const tooltipPositionAtBlock = DomHelper.getPXValueFromString(coordinate.left) 
        const tooltipPositionAtWindow = blockPadLeft + tooltipPositionAtBlock 
        const tooltipRight = tooltipPositionAtWindow + tooltipWidth 
        if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top'){
            // проверка слева
            if (tooltipPositionAtBlock < 0 && -1 * tooltipPositionAtBlock > blockPadLeft)
            coordinate.left = -blockPadLeft  + 'px';
            // проверка справа
            if (tooltipRight > windowWidth)
                coordinate.left = windowWidth - blockPadLeft - tooltipWidth + 'px';
        }
        if(keyAxisOrient === 'right'){ // если ось ключей справа, то тултип слева
            if(tooltipWidth - CONVEXSIZE * 3> blockPadLeft) // Если ширина тултипа - свдиг влево для сопряжения > Расстояния от левого края блока до левого края видимой области 
            coordinate.left = -blockPadLeft  + 'px'; // позиция от края видимой области слева
            else
            coordinate.left = -tooltipWidth + CONVEXSIZE * 3 + 'px'; // позиция сопряженная с линией тултипа
        }
        if(keyAxisOrient === 'left'){ // если ось ключей слева, то тултип справа
            if(tooltipWidth - CONVEXSIZE * 3> blockPadRight) // Если ширина тултипа - свдиг влево для сопряжения > Расстояния от правого края блока до правого края видимой области 
            coordinate.right = -blockPadLeft  + 'px'; // позиция от края видимой области справа
            else
            coordinate.right = -tooltipWidth + CONVEXSIZE * 3 + 'px'; // позиция сопряженная с линией тултипа 
        }             
        return coordinate;
    }
    
    private static recalcToolTipCoordinateByBlock( blockSize: Size, tooltipBlockElement: HTMLElement, keyAxisOrient: Orient, coordinate: TooltipCoordinate): TooltipCoordinate {
        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            if (DomHelper.getPXValueFromString(coordinate.left) < 0)
                coordinate.left = 0 + 'px';
            if (DomHelper.getPXValueFromString(coordinate.left) + tooltipBlockElement.getBoundingClientRect().width > blockSize.width) {
                coordinate.left = null;
                coordinate.right = 0 + 'px';
            }
            if (keyAxisOrient === 'top') {
                coordinate.top = null;
                coordinate.bottom = 0 + 'px';
            }
        } else {
            if (DomHelper.getPXValueFromString(coordinate.top) < 0)
                coordinate.top = 0 + 'px';

            if (DomHelper.getPXValueFromString(coordinate.top) + tooltipBlockElement.getBoundingClientRect().height > blockSize.height) {
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

    public static getTooltipArrowPadding(tooltipBlockWidth: number, horizontalPad: number): number {
        return horizontalPad > tooltipBlockWidth
            ? tooltipBlockWidth - ARROW_DEFAULT_POSITION - 20 * Math.sqrt(2)
            : horizontalPad; // If tooltip arrow has coordinate outside svg, it take X position in end of tooltip block
    }
    
}