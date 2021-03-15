import { select, Selection, BaseType } from "d3-selection";
import { Transitions } from "../../designer/designerConfig";
import { BlockMargin, Size } from "../../model/model";
import { Tooltip } from "../features/tolltip/tooltip";
import { Helper } from "../helper";
import { NamesManager } from "../namesManager";
import { Donut } from "../polarNotation/donut/donut";
import { TransitionManager } from "../transitionManager";
import { BlockHelper } from "./blockHelper";

export class Block {
    public parentElement: HTMLElement;
    public id: number;
    public transitionManager: TransitionManager;

    private svgCssClasses: string[];
    private wrapperCssClasses: string[];
    private parentElementSelection: Selection<BaseType, any, HTMLElement, any>;
    private wrapper: Selection<BaseType, any, HTMLElement, any>;
    private chartBlockClass = 'chart-block';
    private chartGroupClass = 'chart-group';

    constructor(cssClass: string, parentElement: HTMLElement, blockId: number, transitions: Transitions = null) {
        this.wrapperCssClasses = Helper.getCssClassesArray(cssClass);
        this.svgCssClasses = Helper.getCssClassesArray(cssClass);
        this.wrapperCssClasses = BlockHelper.getFormattedCssClassesForWrapper(this.wrapperCssClasses);
        this.parentElement = parentElement;
        this.parentElementSelection = select(parentElement);
        this.id = blockId;

        this.transitionManager = new TransitionManager(this, transitions);
    }

    public renderSvg(blockSize: Size): void {
        this.getWrapper()
            .append('svg')
            .attr('width', blockSize.width)
            .attr('height', blockSize.height)
            .attr('class', this.svgCssClasses.join(' ') + ' ' + NamesManager.getClassName('svg-chart'));
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

    public getSvg(): Selection<SVGElement, unknown, HTMLElement, any> {
        return this.getWrapper().select(`svg.${NamesManager.getClassName('svg-chart')}`);
    }

    public getWrapper(): Selection<BaseType, unknown, HTMLElement, any> {
        return this.wrapper;
    }

    public getChartBlock(): Selection<SVGGElement, unknown, HTMLElement, any> {
        return this.getSvg().select(`.${this.chartBlockClass}`);
    }

    public renderClipPath(margin: BlockMargin, blockSize: Size): void {
        const attributes = BlockHelper.getClipPathAttributes(blockSize, margin);
        this.renderDefs()
            .append('clipPath')
            .attr('id', this.getClipPathId())
            .append('rect')
            .attr('x', attributes.x)
            .attr('y', attributes.y)
            .attr('width', attributes.width)
            .attr('height', attributes.height);
    }

    public renderDefs(): Selection<SVGDefsElement, unknown, HTMLElement, unknown> {
        let defs = this.getSvg()
            .select<SVGDefsElement>('defs');
        if (defs.empty())
            defs = this.getSvg()
                .append<SVGDefsElement>('defs');

        return defs;
    }

    public getClipPathId(): string {
        return NamesManager.getId('clip-path', this.id);
    }

    public removeEventListeners(): void {
        const tipBoxes = this.getSvg().selectAll(`.${Tooltip.tipBoxClass}`)
        tipBoxes.on('mousemove', null);
        tipBoxes.on('mouseover', null);
        tipBoxes.on('mouseleave', null);

        const arcItems = Donut.getAllArcGroups(this);
        arcItems.on('mouseover', null);
        arcItems.on('mouseleave', null);
        arcItems.on('mousemove', null);
    }

    public getChartGroup(chartIndex: number): Selection<SVGGElement, any, BaseType, any> {
        let group: Selection<SVGGElement, any, BaseType, any> = this.getChartBlock().select(`.${this.chartGroupClass}-${chartIndex}`);
        if (group.empty()) {
            group = this.getChartBlock()
                .append('g')
                .attr('class', `${this.chartGroupClass}-${chartIndex}`);
        }

        return group;
    }

    public clearWrapper(): void {
        this.getWrapper().selectAll('*').remove();
    }
}