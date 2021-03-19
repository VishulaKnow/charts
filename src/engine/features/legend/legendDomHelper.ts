import { Color } from "d3-color";
import { BaseType, select, Selection } from "d3-selection";
import { LegendItemsDirection } from "../../../model/featuresModel/legendModel/legendCanvasModel";
import { LegendBlockModel, LegendPosition, Orient, Size } from "../../../model/model";
import { Block } from "../../block/block";
import { DomHelper } from "../../helpers/domHelper";
import { LegendCoordinate, LegendHelper } from "./legendHelper";

export class legendClasses{
    public static legendObjectClass: string = 'legend-object';
    public static legendBlockClass: string = 'legend-block';
    public static legendLabelClass: string = 'legend-label';
    public static legendItemClass: string = 'legend-item';
    public static RowClassAddition: string = 'row';
    public static inlineClassAddition: string = 'inline';
    public static nowrapClassAddition: string = 'nowrap';
    public static legendCircleClass: string = 'legend-circle'

    public static combineLegendClassWithAddition(className: string, addition: string): string {
        return className + '-' + addition;
    }
}

export class legendDomHelper {
    public static renderLegendObject(block: Block, legendPosition: Orient, legendBlockModel: LegendBlockModel, blockSize: Size ): Selection<SVGForeignObjectElement, unknown, HTMLElement, any> {
        const legendObject = block.getSvg()
            .append('foreignObject')
            .attr('class', legendClasses.legendObjectClass);
 
        const legendCoordinate = LegendHelper.getLegendCoordinateByPosition(legendPosition, legendBlockModel, blockSize);
        this.fillLegendCoordinate(legendObject, legendCoordinate);

        return legendObject;
    }

    public static renderLegendContent(legendObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: string[], colorPalette: Color[], itemsDirection: LegendItemsDirection, position: LegendPosition): void {
        const wrapper = legendObject.append('xhtml:div')
            .attr('class', legendClasses.legendBlockClass);
        wrapper
            .style('height', '100%')
            .style('display', 'flex');

        if (itemsDirection === 'column') {
            wrapper.style('flex-direction', 'column');
            if (position === 'right')
                wrapper.style('justify-content', 'center');
        }

        const itemWrappers = wrapper
            .selectAll(`.${legendClasses.legendItemClass}`)
            .data(items)
            .enter()
            .append('div');

        itemWrappers.each(function (d, i) {
            select(this).attr('class', LegendHelper.getItemClasses(itemsDirection, position, i));
        });

        itemWrappers
            .append('span')
            .attr('class', legendClasses.legendCircleClass)
            .style('background-color', (d, i) => colorPalette[i % colorPalette.length].toString());

        itemWrappers
            .data(items)
            .append('span')
            .attr('class', LegendHelper.getLegendLabelClassByPosition(position))
            .text(d => d.toString());

        if (itemsDirection === 'column' && position === 'bottom')
            this.cropColumnLabels(legendObject, itemWrappers, itemsDirection);
        if (itemsDirection === 'row')
            this.cropRowLabels(legendObject, itemWrappers);
    }
    public static getLegendObject(block: Block): Selection<SVGForeignObjectElement, unknown, HTMLElement, any>{
        return block.getSvg()
                .select<SVGForeignObjectElement>(`foreignObject.${legendClasses.legendObjectClass}`);
    }
    public static removeLegendBlock(legendObject:Selection<SVGForeignObjectElement, unknown, HTMLElement, any>): void{
        legendObject.select(`.${legendClasses.legendBlockClass}`).remove();
    }
    
    private static fillLegendCoordinate(legendBlock: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, coordinate: LegendCoordinate): void {
        legendBlock
            .attr('x', coordinate.x)
            .attr('y', coordinate.y)
            .attr('width', coordinate.width)
            .attr('height', coordinate.height);
    }
    
    private static cropRowLabels(legendBlock: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: Selection<HTMLDivElement, string, BaseType, unknown>): void {
        const maxWidth = legendBlock.node().getBoundingClientRect().width;
        let itemsLeftMargins: number[] = this.getItemsLeftMargins(items);
        let itemsWidth: number[] = this.getItemsWidth(items)
        let sumOfItemsWidth = LegendHelper.getSumOfItemsWidths(itemsWidth, itemsLeftMargins);
        const maxItemWidth = LegendHelper.getMaxItemWidth(legendBlock.attr('width'), itemsLeftMargins, 'row');

        let index = 0;
        let loopFlag = true; // if at least one label has no text, loop ends
        while (sumOfItemsWidth > maxWidth && loopFlag) {
            items.nodes().forEach(node => {
                const textBlock = node.querySelector(`.${legendClasses.legendLabelClass}`);
                if (node.getBoundingClientRect().width > maxItemWidth && textBlock.textContent) {
                    let labelText = index > 0
                        ? textBlock.textContent.substr(0, textBlock.textContent.length - 3)
                        : textBlock.textContent;

                    labelText = labelText.substr(0, labelText.length - 1);
                    textBlock.textContent = labelText + '...';
                    itemsLeftMargins = this.getItemsLeftMargins(items);
                    itemsWidth= this.getItemsWidth(items)
                    sumOfItemsWidth = LegendHelper.getSumOfItemsWidths(itemsWidth, itemsLeftMargins);

                    if (labelText.length === 0) {
                        textBlock.textContent = '';
                        loopFlag = false;
                    }
                }
            });
            index++;
        }
    }

    private static cropColumnLabels(legendBlock: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: Selection<HTMLDivElement, string, BaseType, unknown>, itemsDirection: LegendItemsDirection): void {
        const itemsLeftMargins: number[] = this.getItemsLeftMargins(items);
         const maxItemWidth = LegendHelper.getMaxItemWidth(legendBlock.attr('width'), itemsLeftMargins, itemsDirection);

        items.nodes().forEach(node => {
            if (node.getBoundingClientRect().width > maxItemWidth) {
                const text = node.querySelector(`.${legendClasses.legendLabelClass}`);
                let labelText = text.textContent;
                while (node.getBoundingClientRect().width > maxItemWidth && labelText.length > 3) {
                    labelText = labelText.substr(0, labelText.length - 1);
                    text.textContent = labelText + '...';
                }
            }
        });
    }
    private static getItemsLeftMargins(items: Selection<HTMLDivElement, string, BaseType, unknown>): number[]{
        return items.nodes().map(node => DomHelper.getPXValueFromString(DomHelper.getCssPropertyValue(node, 'margin-left')))
    }
    private static getItemsWidth(items: Selection<HTMLDivElement, string, BaseType, unknown>):number[]{
        return items.nodes().map(node => node.getBoundingClientRect().width);
    }
}