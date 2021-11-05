export interface TooltipPreCoordinate {
    top: number;
    left: number;
}

export interface Sizable {
    width: number;
    height: number;
}

export interface ElBounding extends Sizable {
    left: number;
    top: number;
    bottom: number;
}

export class NewTooltipServiceClass {
    getTooltipByWindow(tooltipBounding: Sizable, preCoordinate: TooltipPreCoordinate, windowSize: Sizable, parentBounding?: ElBounding) {
        const scrollPad = 18;

        const coordinate: TooltipPreCoordinate = {
            top: preCoordinate.top,
            left: preCoordinate.left
        }
        const blockBounding = parentBounding ?? {
            top: 0,
            left: 0,
            height: windowSize.height,
            width: windowSize.width,
            bottom: windowSize.height
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