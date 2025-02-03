import { Selection } from "d3-selection";

export class HatchPatternDef {
    static getMaskValue() {
        return `url(#${this.hatchMaskUrl})`;
    }

    private static readonly hatchMaskUrl = "hatch-mask";

    private readonly hatchPattern = `
    <pattern id="hatch-pattern" width="4" height="4" patternUnits="userSpaceOnUse"patternTransform="rotate(45)">
        <rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
    </pattern>
    <mask id="${HatchPatternDef.hatchMaskUrl}">
        <rect x="0" y="0" width="100%" height="100%" fill="url(#hatch-pattern)" />
    </mask>`;

    appendToDefsBlock(defsSelection: Selection<SVGDefsElement, unknown, HTMLElement, unknown>) {
        defsSelection.append("g").html(this.hatchPattern);
    }
}
