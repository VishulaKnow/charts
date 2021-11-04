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
    getTooltipByWindow(blockBounding: ElBounding, tooltipBounding: Sizable, preCoordinate: TooltipPreCoordinate, windowSize: Sizable) {
        const scrollPad = 18;

        const coordinate: TooltipCoordinate = {
            top: preCoordinate.top + 'px',
            bottom: null,
            left: preCoordinate.left + 'px',
            right: null
        }

        if (preCoordinate.left < 0 && Math.abs(preCoordinate.left) > blockBounding.left)
            coordinate.left = -blockBounding.left + 'px';
        if (blockBounding.left + preCoordinate.left + tooltipBounding.width > windowSize.width - scrollPad)
            coordinate.left = windowSize.width - blockBounding.left - tooltipBounding.width - scrollPad + 'px';

        if (preCoordinate.top + blockBounding.top < 0 && -preCoordinate.top > blockBounding.top)
            coordinate.top = -blockBounding.top + 'px';
        if (blockBounding.top + preCoordinate.top + tooltipBounding.height > windowSize.height)
            coordinate.top = blockBounding.height - tooltipBounding.height - (blockBounding.bottom - windowSize.height) + 'px';

        return coordinate;
    }
}

export const TooltipService = new NewTooltipServiceClass();