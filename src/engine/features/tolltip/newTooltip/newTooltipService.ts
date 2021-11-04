import { TooltipCoordinate } from "./newTooltip";

export interface TooltipPreCoordinate {
    top: number;
    left: number;
}

export class NewTooltipServiceClass {
    getTooltipByWindow(blockBounding: DOMRect, tooltipBounding: DOMRect, preCoordinate: TooltipPreCoordinate, winWidth: number, winHeight: number) {
        const scrollPad = 18;

        const coordinate: TooltipCoordinate = {
            top: preCoordinate.top + 'px',
            bottom: null,
            left: preCoordinate.left + 'px',
            right: null
        }

        if (preCoordinate.left < 0 && Math.abs(preCoordinate.left) > blockBounding.left)
            coordinate.left = -blockBounding.left + 'px';
        if (blockBounding.left + preCoordinate.left + tooltipBounding.width > winWidth - scrollPad)
            coordinate.left = winWidth - blockBounding.left - tooltipBounding.width - scrollPad + 'px';

        if (preCoordinate.top + blockBounding.top < 0 && -preCoordinate.top > blockBounding.top)
            coordinate.top = -blockBounding.top + 'px';
        if (blockBounding.top + preCoordinate.top + tooltipBounding.height > winHeight)
            coordinate.top = blockBounding.height - tooltipBounding.height - (blockBounding.bottom - winHeight) + 'px';

        return coordinate;
    }
}

export const TooltipService = new NewTooltipServiceClass();