import { select, Selection, BaseType } from "d3-selection";
import { Transitions } from "../../designer/designerConfig";
import { BlockMargin } from "../../model/model";
import { Scales } from "../features/scale/scale";
import { TipBox } from "../features/tipBox/tipBox";
import { Helper } from "../helpers/helper";
import { NamesHelper } from "../helpers/namesHelper";
import { FilterEventManager } from "../filterManager/filterEventManager";
import { Donut } from "../polarNotation/donut/donut";
import { TransitionManager } from "../transitionManager";
import { BlockHelper } from "./blockHelper";
import { Size } from "../../config/config";
import { BlockSvg } from "./blockSvg";

export class Block {
    public parentElement: HTMLElement;
    public id: number;
    public transitionManager: TransitionManager;
    public scales: Scales;
    public filterEventManager: FilterEventManager;
    public svg: BlockSvg;

    private wrapperCssClasses: string[];
    private parentElementSelection: Selection<BaseType, any, HTMLElement, any>;
    private wrapper: Selection<BaseType, any, HTMLElement, any>;
    private readonly chartBlockClass = 'chart-block';
    private readonly chartGroupClass = 'chart-group';

    constructor(cssClass: string, parentElement: HTMLElement, blockId: number, filterEventManager: FilterEventManager, transitions: Transitions = null) {
        this.svg = new BlockSvg({
            svgCssClasses: Helper.getCssClassesArray(cssClass)
        });

        this.wrapperCssClasses = Helper.getCssClassesArray(cssClass);
        this.wrapperCssClasses = BlockHelper.getFormattedCssClassesForWrapper(this.wrapperCssClasses);
        this.parentElement = parentElement;
        this.parentElementSelection = select(parentElement);
        this.id = blockId;

        this.transitionManager = new TransitionManager(this, transitions);
        this.filterEventManager = filterEventManager;
    }

    public renderWrapper(blockSize: Size): void {
        this.wrapper = this.parentElementSelection
            .append('div')
            .attr('class', this.wrapperCssClasses.join(' '))
            .style('width', blockSize.width + 'px')
            .style('height', blockSize.height + 'px')
            .style('position', 'relative');

        this.svg.initParent(this.wrapper);
    }

    public destroy(): void {
        this.transitionManager.interruptTransitions();
        this.removeMouseEvents();
        this.getWrapper().remove();
    }

    public getSvg(): Selection<SVGElement, unknown, HTMLElement, any> {
        return this.svg.getBlock();
    }

    public getWrapper(): Selection<BaseType, unknown, HTMLElement, any> {
        return this.wrapper;
    }

    public getChartGroup(chartIndex: number): Selection<SVGGElement, any, BaseType, any> {
        let group: Selection<SVGGElement, any, BaseType, any> = this.svg.getChartBlock().select(`.${this.chartGroupClass}-${chartIndex}`);
        if (group.empty()) {
            group = this.svg.getChartBlock()
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
        return NamesHelper.getId('clip-path', this.id);
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