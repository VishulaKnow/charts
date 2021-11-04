import { TooltipCoordinate } from "./newTooltip";

export interface TooltipPreCoordinate {
    top: number;
    left: number;
}

interface Sizable {
    width: number;
    height: number;
}

interface ElBounding extends Sizable {
    left: number;
    top: number;
    bottom: number;
}

export class NewTooltipServiceClass {
    getTooltipByWindow(tooltipBounding: Sizable, preCoordinate: TooltipPreCoordinate, windowSize: Sizable, blockBounding?: ElBounding) {
        const scrollPad = 18;

        const coordinate: TooltipPreCoordinate = {
            top: preCoordinate.top,
            left: preCoordinate.left
        }

        if (preCoordinate.left < 0 && Math.abs(preCoordinate.left) > blockBounding.left)
            coordinate.left = -blockBounding.left;
        if (blockBounding.left + preCoordinate.left + tooltipBounding.width > windowSize.width - scrollPad)
            coordinate.left = windowSize.width - blockBounding.left - tooltipBounding.width - scrollPad;

        if (preCoordinate.top + blockBounding.top < 0 && -preCoordinate.top > blockBounding.top)
            coordinate.top = -blockBounding.top;
        if (blockBounding.top + preCoordinate.top + tooltipBounding.height > windowSize.height)
            coordinate.top = blockBounding.height - tooltipBounding.height - (blockBounding.bottom - windowSize.height);

        return coordinate;
    }
}

export const TooltipService = new NewTooltipServiceClass();