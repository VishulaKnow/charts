import { BaseType, Selection } from "d3-selection";
import { MdtChartsDataSource, Size } from "../../../config/config";
import { IntervalOptionsModel, LegendBlockModel, Model, Orient, PolarOptionsModel, TwoDimensionalOptionsModel } from "../../../model/model";
import { Block } from "../../block/block";
import { ColorReader } from "../../colorReader/colorReader";
import { SelectionCondition } from "../../helpers/domHelper";
import { LegendDomHelper } from "./legendDomHelper";
import { LegendEventsManager } from "./legendEventsManager";
import { LegendCoordinate, LegendHelper } from "./legendHelper";

export interface LegendContentRenderingOptions {
    wrapperClasses: string[];
    shouldCropLabels: boolean;
    itemsOptions: {
        wrapperClasses: string[];
        markerClass: string;
        labelClass: string;
    }
}

export class Legend {
    public static readonly objectClass = 'legend-object';
    public static readonly labelClass = 'legend-label';
    public static readonly itemClass = 'legend-item';
    public static readonly markerClass = 'legend-circle';
    public static readonly legendBlockClass = 'legend-block';

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
        if (options.type === "polar" && ColorReader.isNeedReadFromData(options.charts[0])) return;

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
        const colors = LegendHelper.getMarksColor(options, data[options.data.dataSource]);
        const renderingOptions = LegendHelper.getContentRenderingOptions(options.type, options.legend.position);

        const itemBlocks = this.renderContent(legendObject, items, colors, renderingOptions);
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

    private static renderContent(foreignObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: string[], colorPalette: string[], options: LegendContentRenderingOptions): Selection<HTMLDivElement, string, BaseType, unknown> {
        const wrapper = foreignObject.append('xhtml:div');
        wrapper.classed(options.wrapperClasses.join(" "), true);

        const itemWrappers = wrapper
            .selectAll(`.${this.itemClass}`)
            .data(items)
            .enter()
            .append('div');
        itemWrappers.classed(options.itemsOptions.wrapperClasses.join(" "), true);

        itemWrappers
            .append('span')
            .classed(options.itemsOptions.markerClass, true);
        LegendDomHelper.setItemsColors(itemWrappers, colorPalette);

        itemWrappers
            .append('span')
            .attr('class', options.itemsOptions.labelClass)
            .text(d => d);

        if (options.shouldCropLabels)
            LegendDomHelper.cropRowLabels(foreignObject, itemWrappers);

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