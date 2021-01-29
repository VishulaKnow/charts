import * as d3 from "d3";
import { BlockMargin, Size } from "../../model/model";
import { Helper } from "../helper";
import { BlockHelper } from "./blockHelper";

export class Block
{
    private svgCssClasses: string[];
    private wrapperCssClasses: string[];
    private parentElement: d3.Selection<d3.BaseType, any, HTMLElement, any>;
    private wrapper: d3.Selection<d3.BaseType, any, HTMLElement, any>;

    private chartBlockClass = 'chart-block';

    public parentElementSelector: string;

    constructor(cssClass: string, parentElementSelector: string) {
        this.wrapperCssClasses = Helper.getCssClassesArray(cssClass);
        this.svgCssClasses = Helper.getCssClassesArray(cssClass);
        this.wrapperCssClasses = BlockHelper.getFormattedCssClassesForWrapper(this.wrapperCssClasses);
        this.parentElement = d3.select(parentElementSelector);
        this.parentElementSelector = parentElementSelector;
    }

    public renderSvg(blockSize: Size): void {
        this.getWrapper()
            .append('svg')
            .attr('width', blockSize.width)
            .attr('height', blockSize.height)
            .attr('class', this.svgCssClasses.join(' '));
    }

    public renderWrapper(blockSize: Size): void {
        this.wrapper = this.parentElement
            .append('div')
            .attr('class', this.wrapperCssClasses.join(' '))
            .style('width', blockSize.width + 'px')
            .style('height', blockSize.height + 'px')
            .style('position', 'relative');
    }

    public renderChartBlock(): void {
        this.getSvg()
            .append('g')
            .attr('class', this.chartBlockClass);
    }

    public getSvg(): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        return this.getWrapper().select('svg');
    }

    public getWrapper(): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        return this.wrapper;
    }

    public getChartBlock(): d3.Selection<SVGGElement, unknown, HTMLElement, any> {
        return this.getSvg()
            .select(`.${this.chartBlockClass}`);
    } 
    
    public renderClipPath(margin: BlockMargin, blockSize: Size): void {
        const attributes = BlockHelper.getChartBlockAttributes(blockSize, margin);
        this.getSvg()
            .append('defs')
            .append('clipPath')
            .attr('id', `chart-block-clippath-${this.svgCssClasses.join('-')}`)
            .append('rect')
            .attr('x', attributes.x)
            .attr('y', attributes.y)
            .attr('width', attributes.width)
            .attr('height', attributes.height);
    }

    public getClipPathId(): string {
        return `#chart-block-clippath-${this.svgCssClasses.join('-')}`;
    }

    public getSvgCssClasses(): string[] {
        return this.svgCssClasses;
    }
}