import { resizeFont } from "./fontResizerService";

export interface ResizingOptions {
    elWrapper: HTMLElement;
    unit: "px" | "em";
    smallestFontSize: number;
    step?: number;
}

export const FontResizer = new class {
    setSize(el: HTMLElement, options: ResizingOptions) {
        const wrappedEl = new ResizedElement(el);

        resizeFont(wrappedEl, {
            ...options,
            elWrapper: new ResizedElement(options.elWrapper)
        });
    }
}

export class ResizedElement {
    constructor(private el: HTMLElement) { }

    setStyle(style: string, value: string) {
        this.el.style[style as any] = value;
    }

    getSizeStyleInNum(style: string) {
        return parseFloat(this.el.style[style as any]);
    }

    getWidth() {
        return this.el.getBoundingClientRect().width;
    }
}