import { Selection, BaseType } from "d3-selection";
import { Size } from "../../config/config";
import { NamesHelper } from "../helpers/namesHelper";

type SvgBlockParent = Selection<BaseType, unknown, HTMLElement, any>;

interface BlockSvgOptions {
    svgCssClasses: string[]
}

export class BlockSvg {
    private parent: SvgBlockParent;
    private svgCssClasses: string[];
    private readonly chartBlockClass = 'chart-block';

    constructor(options: BlockSvgOptions) {
        this.svgCssClasses = options.svgCssClasses;
    }

    initParent(parent: SvgBlockParent) {
        this.parent = parent;
    }

    render(blockSize: Size) {
        this.parent
            .append('svg')
            .attr('width', blockSize.width)
            .attr('height', blockSize.height)
            .attr('class', this.svgCssClasses.join(' ') + ' ' + NamesHelper.getClassName('svg-chart'));
    }

    getBlock(): Selection<SVGElement, unknown, HTMLElement, any> {
        return this.parent.select(`svg.${NamesHelper.getClassName('svg-chart')}`);
    }

    renderChartsBlock() {
        this.getBlock()
            .append('g')
            .attr('class', this.chartBlockClass);
    }

    getChartBlock() {
        return this.getBlock().select(`.${this.chartBlockClass}`);
    }
}