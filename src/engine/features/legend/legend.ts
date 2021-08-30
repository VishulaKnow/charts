import { BaseType, select, Selection } from "d3-selection";
import { MdtChartsDataSource, Size } from "../../../config/config";
import { LegendItemsDirection } from "../../../model/featuresModel/legendModel/legendCanvasModel";
import { IntervalOptionsModel, LegendBlockModel, LegendPosition, Model, Orient, PolarOptionsModel, TwoDimensionalOptionsModel } from "../../../model/model";
import { Block } from "../../block/block";
import { SelectionCondition } from "../../helpers/domHelper";
import { LegendDomHelper } from "./legendDomHelper";
import { LegendEventsManager } from "./legendEventsManager";
import { LegendCoordinate, LegendHelper } from "./legendHelper";

export class Legend {
    public static readonly objectClass = 'legend-object';
    public static readonly labelClass = 'legend-label';
    public static readonly itemClass = 'legend-item';
    public static readonly markerClass = 'legend-circle';

    private static readonly legendBlockClass = 'legend-block';

    public static render(block: Block, data: MdtChartsDataSource, options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel, model: Model): void {
        if (options.legend.position !== 'off') {
            const legendObject = this.renderObject(block, options.legend.position, model.otherComponents.legendBlock, model.blockCanvas.size);
            this.setContent(block, data, options, legendObject);
        }
    }

    public static update(block: Block, data: MdtChartsDataSource, model: Model): void {
        if (model.options.legend.position !== 'off') {
            const legendObject = this.getObject(block);
            const legendCoordinate = LegendHelper.getLegendCoordinateByPosition(model.options.legend.position, model.otherComponents.legendBlock, model.blockCanvas.size);
            this.fillCoordinate(legendObject, legendCoordinate);
            this.removeContent(legendObject);
            this.setContent(block, data, model.options, legendObject);
        }
    }

    public static updateColors(block: Block, options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel): void {
        const legendObject = this.getObject(block);
        const colors = LegendHelper.getMarksColor(options);
        const itemWrappers = legendObject
            .selectAll<HTMLDivElement, string>(`.${this.itemClass}`);
        LegendDomHelper.setItemsColors(itemWrappers, colors);
    }

    public static getItemsByKeys(block: Block, keys: string[], condition: SelectionCondition = SelectionCondition.Include): Selection<HTMLDivElement, string, BaseType, unknown> {
        return block
            .getSvg()
            .selectAll<HTMLDivElement, string>(`.${this.itemClass}`)
            .filter(d => {
                const index = keys.findIndex(k => k === d);
                return condition === SelectionCondition.Include ? index !== -1 : index === -1;
            });
    }

    private static setContent(block: Block, data: MdtChartsDataSource, options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel, legendObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>): void {
        const items = LegendHelper.getLegendItemsContent(options, data);
        const colors = LegendHelper.getMarksColor(options);
        const itemsDirection = LegendHelper.getLegendItemsDirection(options.type, options.legend.position);

        const itemBlocks = this.renderContent(legendObject, items, colors, itemsDirection, options.legend.position);
        if (options.type === 'polar') {
            LegendEventsManager.setListeners(block, options.data.keyField.name, itemBlocks, options.selectable);
        } else {
            LegendDomHelper.setItemsTitles(itemBlocks);
        }
    }

    private static renderObject(block: Block, legendPosition: Orient, legendBlockModel: LegendBlockModel, blockSize: Size): Selection<SVGForeignObjectElement, unknown, HTMLElement, any> {
        const legendObject = block.getSvg()
            .append('foreignObject')
            .attr('class', Legend.objectClass);

        const legendCoordinate = LegendHelper.getLegendCoordinateByPosition(legendPosition, legendBlockModel, blockSize);
        this.fillCoordinate(legendObject, legendCoordinate);

        return legendObject;
    }

    private static renderContent(legendObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: string[], colorPalette: string[], itemsDirection: LegendItemsDirection, position: LegendPosition): Selection<HTMLDivElement, string, BaseType, unknown> {
        const wrapper = legendObject.append('xhtml:div')
            .attr('class', Legend.legendBlockClass);
        wrapper
            .style('height', '100%')
            .style('display', 'flex');

        if (itemsDirection === 'column') {
            wrapper.style('flex-direction', 'column');
            if (position === 'right')
                wrapper.style('justify-content', 'center');
        }

        const itemWrappers = wrapper
            .selectAll(`.${this.itemClass}`)
            .data(items)
            .enter()
            .append('div');

        const thisClass = this;
        itemWrappers.each(function (d, i) {
            select(this).attr('class', `${thisClass.itemClass} ${LegendHelper.getItemClasses(itemsDirection, position, i)}`);
        });

        itemWrappers
            .append('span')
            .attr('class', this.markerClass);

        LegendDomHelper.setItemsColors(itemWrappers, colorPalette);

        itemWrappers
            .append('span')
            .attr('class', LegendHelper.getLegendLabelClassByPosition(position))
            .text(d => d);

        if (itemsDirection === 'row')
            LegendDomHelper.cropRowLabels(legendObject, itemWrappers);

        return itemWrappers;
    }

    private static getObject(block: Block): Selection<SVGForeignObjectElement, unknown, HTMLElement, any> {
        return block.getSvg()
            .select<SVGForeignObjectElement>(`foreignObject.${Legend.objectClass}`);
    }

    private static removeContent(legendObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>): void {
        legendObject.select(`.${Legend.legendBlockClass}`).remove();
    }

    private static fillCoordinate(legendBlock: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, coordinate: LegendCoordinate): void {
        legendBlock
            .attr('x', coordinate.x)
            .attr('y', coordinate.y)
            .attr('width', coordinate.width)
            .attr('height', coordinate.height);
    }
}