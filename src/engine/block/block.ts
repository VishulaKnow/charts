import { select, Selection, BaseType } from "d3-selection";
import { BlockMargin, Size } from "../../model/model";
import { Helper } from "../helper";
import { BlockHelper } from "./blockHelper";

export class Block
{
    private svgCssClasses: string[];
    private wrapperCssClasses: string[];
    private parentElementSelection: Selection<BaseType, any, HTMLElement, any>;
    private wrapper: Selection<BaseType, any, HTMLElement, any>;
    private chartBlockClass = 'chart-block';

    public parentElement: HTMLElement;

    constructor(cssClass: string, parentElement: HTMLElement) {
        this.wrapperCssClasses = Helper.getCssClassesArray(cssClass);
        this.svgCssClasses = Helper.getCssClassesArray(cssClass);
        this.wrapperCssClasses = BlockHelper.getFormattedCssClassesForWrapper(this.wrapperCssClasses);
        this.parentElement = parentElement;
        this.parentElementSelection = select(parentElement);
    }

    public renderSvg(blockSize: Size): void {
        this.getWrapper()
            .append('svg')
            .attr('width', blockSize.width)
            .attr('height', blockSize.height)
            .attr('class', this.svgCssClasses.join(' '));
    }

    public renderWrapper(blockSize: Size): void {
        this.wrapper = this.parentElementSelection
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

    public getSvg(): Selection<BaseType, unknown, HTMLElement, any> {
        return this.getWrapper().select('svg');
    }

    public getWrapper(): Selection<BaseType, unknown, HTMLElement, any> {
        return this.wrapper;
    }

    public getChartBlock(): Selection<SVGGElement, unknown, HTMLElement, any> {
        return this.getSvg()
            .select(`.${this.chartBlockClass}`);
    } 
    
    public renderClipPath(margin: BlockMargin, blockSize: Size): void {
        const attributes = BlockHelper.getChartBlockAttributes(blockSize, margin);
        this.renderDefs()
            .append('clipPath')
            .attr('id', `chart-block-clippath-${this.svgCssClasses.join('-')}`)
            .append('rect')
            .attr('x', attributes.x)
            .attr('y', attributes.y)
            .attr('width', attributes.width)
            .attr('height', attributes.height);
    }

    public renderDefs(): Selection<SVGDefsElement, unknown, HTMLElement, unknown> {
        let defs = this.getSvg()
            .select<SVGDefsElement>('defs');
        if(defs.empty())
            defs = this.getSvg()
                .append<SVGDefsElement>('defs');
    
        return defs;
    }

    public getClipPathId(): string {
        return `#chart-block-clippath-${this.svgCssClasses.join('-')}`;
    }

    public getSvgCssClasses(): string[] {
        return this.svgCssClasses;
    }
}