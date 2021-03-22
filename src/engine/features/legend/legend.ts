
import { select, Selection } from "d3-selection";
import { Size } from "../../../config/config";
import { LegendItemsDirection } from "../../../model/featuresModel/legendModel/legendCanvasModel";
import { DataSource, IntervalOptionsModel, LegendBlockModel, LegendPosition, Model, Orient, PolarOptionsModel, TwoDimensionalOptionsModel } from "../../../model/model";
import { Block } from "../../block/block";
import { LegendDomHelper } from "./legendDomHelper";
import { LegendCoordinate, LegendHelper } from "./legendHelper";
export class Legend {
    public static objectClass = 'legend-object';
    public static labelClass = 'legend-label';

    private static legendBlockClass = 'legend-block';

    public static render(block: Block, data: DataSource, options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel, model: Model): void {
        if (options.legend.position !== 'off') {
            const legendItemsContent = LegendHelper.getLegendItemsContent(options, data);
            const chartElementsColor = LegendHelper.getMarksColor(options);
            const legendItemsDirection = LegendHelper.getLegendItemsDirection(options.type, options.legend.position);

            const legendObject = this.renderLegendObject(block, options.legend.position, model.otherComponents.legendBlock, model.blockCanvas.size);

            this.renderLegendContent(legendObject, legendItemsContent, chartElementsColor, legendItemsDirection, options.legend.position);
        }
    }

    public static update(block: Block, data: DataSource, options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel): void {
        if (options.legend.position !== 'off') {
            const legendItemsContent = LegendHelper.getLegendItemsContent(options, data);
            const chartElementsColor = LegendHelper.getMarksColor(options);
            const legendItemsDirection = LegendHelper.getLegendItemsDirection(options.type, options.legend.position);

            const legendObject = this.getLegendObject(block)

            this.removeLegendBlock(legendObject)

            this.renderLegendContent(legendObject, legendItemsContent, chartElementsColor, legendItemsDirection, options.legend.position);
        }
    }

    public static renderLegendObject(block: Block, legendPosition: Orient, legendBlockModel: LegendBlockModel, blockSize: Size): Selection<SVGForeignObjectElement, unknown, HTMLElement, any> {
        const legendObject = block.getSvg()
            .append('foreignObject')
            .attr('class', Legend.objectClass);

        const legendCoordinate = LegendHelper.getLegendCoordinateByPosition(legendPosition, legendBlockModel, blockSize);
        this.fillLegendCoordinate(legendObject, legendCoordinate);

        return legendObject;
    }

    public static renderLegendContent(legendObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: string[], colorPalette: string[], itemsDirection: LegendItemsDirection, position: LegendPosition): void {
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
            .selectAll(`.legend-item`)
            .data(items)
            .enter()
            .append('div');

        itemWrappers.each(function (d, i) {
            select(this).attr('class', LegendHelper.getItemClasses(itemsDirection, position, i));
        });

        itemWrappers
            .append('span')
            .attr('class', 'legend-circle')
            .style('background-color', (d, i) => colorPalette[i % colorPalette.length]);

        itemWrappers
            .data(items)
            .append('span')
            .attr('class', LegendHelper.getLegendLabelClassByPosition(position))
            .text(d => d.toString());

        if (itemsDirection === 'column' && position === 'bottom')
            LegendDomHelper.cropColumnLabels(legendObject, itemWrappers, itemsDirection);
        if (itemsDirection === 'row')
            LegendDomHelper.cropRowLabels(legendObject, itemWrappers);
    }

    public static getLegendObject(block: Block): Selection<SVGForeignObjectElement, unknown, HTMLElement, any> {
        return block.getSvg()
            .select<SVGForeignObjectElement>(`foreignObject.${Legend.objectClass}`);
    }

    public static removeLegendBlock(legendObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>): void {
        legendObject.select(`.${Legend.legendBlockClass}`).remove();
    }

    private static fillLegendCoordinate(legendBlock: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, coordinate: LegendCoordinate): void {
        legendBlock
            .attr('x', coordinate.x)
            .attr('y', coordinate.y)
            .attr('width', coordinate.width)
            .attr('height', coordinate.height);
    }
}