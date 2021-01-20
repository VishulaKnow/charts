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

    constructor(cssClass: string, parentElementSelector: string) {
        this.wrapperCssClasses = Helper.getCssClassesArray(cssClass);
        this.svgCssClasses = Helper.getCssClassesArray(cssClass);
        this.wrapperCssClasses = BlockHelper.getFormattedCssClassesForWrapper(this.wrapperCssClasses);
        this.parentElement = d3.select(parentElementSelector);
    }

    public renderSvg(cssClass: string, blockSize: Size): void {
        this.getWrapper()
            .append('svg')
            .attr('width', blockSize.width)
            .attr('height', blockSize.height)
            .attr('class', this.svgCssClasses.join(' '));
    }

    public renderWrapper(blockSize: Size): void {
        this.wrapper = d3.select('.main-wrapper')
            .append('div')
            .attr('class', this.wrapperCssClasses.join(' '))
            .attr('width', blockSize.width)
            .attr('height', blockSize.height)
            .style('position', 'relative');
    }

    public renderChartBlock(blockSize: Size, margin: BlockMargin): void {
        const attributes = BlockHelper.getChartBlockAttributes(blockSize, margin);
        attributes.width = 200;
        this.getSvg()
            .append('g')
            .attr('class', this.chartBlockClass)
            .attr('x', attributes.x)
            .attr('y', attributes.y)
            .attr('width', attributes.width)
            .attr('height', attributes.height)
            .style('overflow-x', 'hidden');
    }

    public getSvg(): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        return this.getWrapper().select('svg');
    }

    public getWrapper(): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        // return this.parentElement.select(Helper.getCssClassesLine(this.wrapperCssClasses));
        return this.wrapper;
    }

    public getChartBlock(): d3.Selection<SVGGElement, unknown, HTMLElement, any> {
        return this.getSvg()
            .select(`.${this.chartBlockClass}`);
    } 
    
    public renderClipPath(margin: BlockMargin, blockSize: Size): void {
        const attributes = BlockHelper.getChartBlockAttributes(blockSize, margin);
        this.getSvg()
            .append('clipPath')
            .attr('id', `chart-block-${this.svgCssClasses.join('-')}`)
            .append('rect')
            .attr('x', attributes.x)
            .attr('y', attributes.y)
            .attr('width', attributes.width)
            .attr('height', attributes.height);
    }

    public getClipPathId(): string {
        return `#chart-block-${this.svgCssClasses.join('-')}`;
    }
}