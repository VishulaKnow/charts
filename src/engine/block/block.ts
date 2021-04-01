import { select, Selection, BaseType } from "d3-selection";
import { Transitions } from "../../designer/designerConfig";
import { BlockMargin } from "../../model/model";
import { Scales } from "../features/scale/scale";
import { TipBox } from "../features/tipBox/tipBox";
import { Helper } from "../helpers/helper";
import { NamesManager } from "../namesManager";
import { FilterEventManager } from "../filterManager/filterEventManager";
import { Donut } from "../polarNotation/donut/donut";
import { TransitionManager } from "../transitionManager";
import { BlockHelper } from "./blockHelper";
import { Size } from "../../config/config";

export class Block {
    public parentElement: HTMLElement;
    public id: number;
    public transitionManager: TransitionManager;
    public scales: Scales;
    public filterEventManager: FilterEventManager;

    private svgCssClasses: string[];
    private wrapperCssClasses: string[];
    private parentElementSelection: Selection<BaseType, any, HTMLElement, any>;
    private wrapper: Selection<BaseType, any, HTMLElement, any>;
    private readonly chartBlockClass = 'chart-block';
    private readonly chartGroupClass = 'chart-group';

    constructor(cssClass: string, parentElement: HTMLElement, blockId: number, filterEventManager: FilterEventManager, transitions: Transitions = null) {
        this.wrapperCssClasses = Helper.getCssClassesArray(cssClass);
        this.svgCssClasses = Helper.getCssClassesArray(cssClass);
        this.wrapperCssClasses = BlockHelper.getFormattedCssClassesForWrapper(this.wrapperCssClasses);
        this.parentElement = parentElement;
        this.parentElementSelection = select(parentElement);
        this.id = blockId;

        this.transitionManager = new TransitionManager(this, transitions);
        this.filterEventManager = filterEventManager;
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

    public destroy(): void {
        this.transitionManager.interruptTransitions();
        this.removeMouseEvents();
        this.getWrapper().remove();
    }

    public getSvg(): Selection<SVGElement, unknown, HTMLElement, any> {
        return this.getWrapper().select(`svg.${NamesManager.getClassName('svg-chart')}`);
    }

    public getWrapper(): Selection<BaseType, unknown, HTMLElement, any> {
        return this.wrapper;
    }

    public renderChartsBlock(): void {
        this.getSvg()
            .append('g')
            .attr('class', this.chartBlockClass);
    }

    public getChartBlock(): Selection<SVGGElement, unknown, HTMLElement, any> {
        return this.getSvg().select(`.${this.chartBlockClass}`);
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

    public renderChartClipPath(margin: BlockMargin, blockSize: Size): void {
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

    public updateChartClipPath(margin: BlockMargin, blockSize: Size): void {
        const attributes = BlockHelper.getClipPathAttributes(blockSize, margin);
        this.renderDefs()
            .select('clipPath')
            .select('rect')
            .attr('x', attributes.x)
            .attr('y', attributes.y)
            .attr('width', attributes.width)
            .attr('height', attributes.height);
    }

    public getClipPathId(): string {
        return NamesManager.getId('clip-path', this.id);
    }

    public renderDefs(): Selection<SVGDefsElement, unknown, HTMLElement, unknown> {
        let defs = this.getSvg()
            .select<SVGDefsElement>('defs');
        if (defs.empty())
            defs = this.getSvg().append<SVGDefsElement>('defs');

        return defs;
    }

    public removeMouseEvents(): void {
        const tipBoxes = this.getSvg().selectAll(`.${TipBox.tipBoxClass}`)
        tipBoxes.on('mousemove', null);
        tipBoxes.on('mouseover', null);
        tipBoxes.on('mouseleave', null);
        tipBoxes.on('click', null);

        const arcItems = Donut.getAllArcGroups(this);
        arcItems.on('mouseover', null);
        arcItems.on('mouseleave', null);
        arcItems.on('mousemove', null);
        arcItems.on('click', null);
    }

    public clearWrapper(): void {
        this.getWrapper().selectAll('*').remove();
    }
}