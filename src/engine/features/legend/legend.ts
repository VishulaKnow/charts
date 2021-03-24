import { BaseType, select, Selection } from "d3-selection";
import { Size } from "../../../config/config";
import { LegendItemsDirection } from "../../../model/featuresModel/legendModel/legendCanvasModel";
import { DataSource, IntervalOptionsModel, LegendBlockModel, LegendPosition, Model, Orient, PolarOptionsModel, TwoDimensionalOptionsModel } from "../../../model/model";
import { Block } from "../../block/block";
import { LegendDomHelper } from "./legendDomHelper";
import { LegendEventsManager } from "./legendEventsManager";
import { LegendCoordinate, LegendHelper } from "./legendHelper";
export class Legend {
    public static objectClass = 'legend-object';
    public static labelClass = 'legend-label';
    public static itemClass = 'legend-item';

    private static legendBlockClass = 'legend-block';

    public static render(block: Block, data: DataSource, options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel, model: Model): void {
        if (options.legend.position !== 'off') {
            const legendItemsContent = LegendHelper.getLegendItemsContent(options, data);
            const chartElementsColor = LegendHelper.getMarksColor(options);
            const legendItemsDirection = LegendHelper.getLegendItemsDirection(options.type, options.legend.position);

            const legendObject = this.renderObject(block, options.legend.position, model.otherComponents.legendBlock, model.blockCanvas.size);

            const legendItems = this.renderContent(legendObject, legendItemsContent, chartElementsColor, legendItemsDirection, options.legend.position);
            if (options.type === 'polar') {
                LegendEventsManager.setListeners(block, options.data.keyField.name, legendItems);
            }
        }
    }

    public static update(block: Block, data: DataSource, options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel): void {
        if (options.legend.position !== 'off') {
            const legendItemsContent = LegendHelper.getLegendItemsContent(options, data);
            const chartElementsColor = LegendHelper.getMarksColor(options);
            const legendItemsDirection = LegendHelper.getLegendItemsDirection(options.type, options.legend.position);

            const legendObject = this.getObject(block)

            this.removeContent(legendObject);

            const legendItems = this.renderContent(legendObject, legendItemsContent, chartElementsColor, legendItemsDirection, options.legend.position);
            if (options.type === 'polar') {
                LegendEventsManager.setListeners(block, options.data.keyField.name, legendItems);
            }
        }
    }

    public static renderObject(block: Block, legendPosition: Orient, legendBlockModel: LegendBlockModel, blockSize: Size): Selection<SVGForeignObjectElement, unknown, HTMLElement, any> {
        const legendObject = block.getSvg()
            .append('foreignObject')
            .attr('class', Legend.objectClass);

        const legendCoordinate = LegendHelper.getLegendCoordinateByPosition(legendPosition, legendBlockModel, blockSize);
        this.fillCoordinate(legendObject, legendCoordinate);

        return legendObject;
    }

    public static renderContent(legendObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: string[], colorPalette: string[], itemsDirection: LegendItemsDirection, position: LegendPosition): Selection<HTMLDivElement, string, BaseType, unknown> {
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
            .attr('class', 'legend-circle')
            .style('background-color', (d, i) => colorPalette[i % colorPalette.length]);

        itemWrappers
            .data(items)
            .append('span')
            .attr('class', LegendHelper.getLegendLabelClassByPosition(position))
            .attr('title', d => d)
            .text(d => d);

        if (itemsDirection === 'column' && position === 'bottom')
            LegendDomHelper.cropColumnLabels(legendObject, itemWrappers, itemsDirection);
        if (itemsDirection === 'row')
            LegendDomHelper.cropRowLabels(legendObject, itemWrappers);

        return itemWrappers;
    }

    public static getObject(block: Block): Selection<SVGForeignObjectElement, unknown, HTMLElement, any> {
        return block.getSvg()
            .select<SVGForeignObjectElement>(`foreignObject.${Legend.objectClass}`);
    }

    public static removeContent(legendObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>): void {
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