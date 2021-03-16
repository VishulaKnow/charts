import { Color } from "d3-color";
import { Selection, BaseType, select } from 'd3-selection'
import { transition } from "d3-transition";
import { LegendItemsDirection } from "../../../model/featuresModel/legendModel/legendCanvasModel";
import { DataSource, IntervalOptionsModel, LegendBlockModel, LegendPosition, Orient, PolarOptionsModel, Size, TwoDimensionalOptionsModel } from "../../../model/model";
import { Block } from "../../block/block";
import { LegendHelper } from "./legendHelper";

interface LegendCoordinate {
    x: number;
    y: number;
    height: number;
    width: number;
}

export class Legend {
    public static legendBlockClass = 'legend-block';
    private static legendObjectClass = 'legend-object';
    private static legendLabelClass = 'legend-label'

    public static render(block: Block, data: DataSource, options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel, legendBlockModel: LegendBlockModel, blockSize: Size): void {
        if (options.legend.position !== 'off') {
            const legendItemsContent = LegendHelper.getLegendItemsContent(options, data);
            const chartElementsColor = LegendHelper.getMarksColor(options);
            const legendItemsDirection = LegendHelper.getLegendItemsDirection(options.type, options.legend.position);

            this.renderLegendObject(block,
                legendItemsContent,
                options.legend.position,
                legendBlockModel,
                chartElementsColor,
                blockSize,
                legendItemsDirection);
        }
    }

    public static update(block: Block, data: DataSource, options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel): void {
        if (options.legend.position !== 'off') {
            const legendObject = block.getSvg()
                .select<SVGForeignObjectElement>(`foreignObject.${this.legendObjectClass}`);

            const legendItemsContent = LegendHelper.getLegendItemsContent(options, data);
            const chartElementsColor = LegendHelper.getMarksColor(options);
            const legendItemsDirection = LegendHelper.getLegendItemsDirection(options.type, options.legend.position);

            legendObject.select(`.${this.legendBlockClass}`)
            .style('opacity', 1)
            .interrupt()
            .transition()
            .duration(block.transitionManager.durations.chartUpdate / 2)
            .style('opacity', 0)
            .remove();

            this.renderLegendContent(block, legendObject, legendItemsContent, chartElementsColor, legendItemsDirection, options.legend.position);
        }
    }

    private static renderLegendObject(block: Block, items: string[], legendPosition: Orient, legendBlockModel: LegendBlockModel, colorPalette: Color[], blockSize: Size, itemsDirection: LegendItemsDirection): void {
        const legendBlock = block.getSvg()
            .append('foreignObject')
            .attr('class', this.legendObjectClass);

        const legendCoordinate = this.getLegendCoordinateByPosition(legendPosition, legendBlockModel, blockSize);
        this.fillLegendCoordinate(legendBlock, legendCoordinate);

        this.renderLegendContent(block, legendBlock,
            items,
            colorPalette,
            itemsDirection,
            legendPosition);
    }

    private static getLegendCoordinateByPosition(legendPosition: Orient, legendBlockModel: LegendBlockModel, blockSize: Size): LegendCoordinate {
        const legendModel = legendBlockModel[legendPosition];
        const coordinate: LegendCoordinate = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }

        if (legendPosition === 'left' || legendPosition === 'right') {
            coordinate.y = legendModel.margin.top + legendModel.pad;
            coordinate.width = legendModel.size;
            coordinate.height = blockSize.height - legendModel.margin.top - legendModel.margin.bottom;
        } else if (legendPosition === 'bottom' || legendPosition === 'top') {
            coordinate.x = legendModel.margin.left;
            coordinate.width = blockSize.width - legendModel.margin.left - legendModel.margin.right;
            coordinate.height = legendModel.size;
        }

        if (legendPosition === 'left')
            coordinate.x = legendModel.margin.left;
        else if (legendPosition === 'right')
            coordinate.x = blockSize.width - legendModel.size - legendModel.margin.right;
        else if (legendPosition === 'top')
            coordinate.y = legendModel.margin.top + legendModel.pad;
        else if (legendPosition === 'bottom')
            coordinate.y = blockSize.height - legendModel.size - legendModel.margin.bottom;

        return coordinate;
    }

    private static fillLegendCoordinate(legendBlock: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, coordinate: LegendCoordinate): void {
        legendBlock
            .attr('x', coordinate.x)
            .attr('y', coordinate.y)
            .attr('width', coordinate.width)
            .attr('height', coordinate.height);
    }

    private static renderLegendContent(block: Block, legendObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: string[], colorPalette: Color[], itemsDirection: LegendItemsDirection, position: LegendPosition): void {
        const wrapper = legendObject.append('xhtml:div')
            .attr('class', this.legendBlockClass);

        wrapper
            .style('height', '100%')
            .style('display', 'flex');

        if (itemsDirection === 'column') {
            wrapper.style('flex-direction', 'column');
        }

        if (itemsDirection === 'column' && position === 'right') {
            wrapper.style('justify-content', 'center');
        }

        const itemWrappers = wrapper
            .selectAll('.legend-item')
            .data(items)
            .enter()
            .append('div')
        itemWrappers.each(function (d, i) {
            select(this).attr('class', LegendHelper.getItemClasses(itemsDirection, position, i));
        });

        itemWrappers
            .append('span')
            .attr('class', 'legend-circle')
            .style('background-color', (d, i) => colorPalette[i % colorPalette.length].toString())
            .style('opacity', 0)
            .interrupt()
            .transition()
            .delay(block.transitionManager.durations.chartUpdate / 2)
            .duration(block.transitionManager.durations.chartUpdate / 2)
            .style('opacity', 1)


        itemWrappers
            .data(items)
            .append('span')
            .attr('class', LegendHelper.getLegendLabelClassByPosition(position))
            .interrupt()
            .transition()
            .delay(block.transitionManager.durations.chartUpdate / 2)
            .duration(block.transitionManager.durations.chartUpdate / 2)
            .tween('text', function(d){
                var textLength = d.length;
                return function(t){
                    this.textContent = d.substr(0, Math.round(t * textLength));
                }
            })
            // .text(d => d.toString())
        if (itemsDirection === 'row')
            this.cropRowLabels(legendObject, itemWrappers);
    }

    private static cropRowLabels(legendBlock: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: Selection<HTMLDivElement, string, BaseType, unknown>): void {
        const maxWidth = legendBlock.node().getBoundingClientRect().width;
        let sumOfItemsWidth = LegendHelper.getSumOfItemsWidths(items);
        const maxItemWidth = LegendHelper.getMaxItemWidth(legendBlock, items, 'row');

        let index = 0;
        let loopFlag = true; // if at least one label has no text, loop ends
        while (sumOfItemsWidth > maxWidth && loopFlag) {
            items.nodes().forEach(node => {
                const textBlock = node.querySelector(`.${this.legendLabelClass}`);
                if (node.getBoundingClientRect().width > maxItemWidth && textBlock.textContent) {
                    let labelText = index > 0
                        ? textBlock.textContent.substr(0, textBlock.textContent.length - 3)
                        : textBlock.textContent;

                    labelText = labelText.substr(0, labelText.length - 1);
                    textBlock.textContent = labelText + '...';
                    sumOfItemsWidth = LegendHelper.getSumOfItemsWidths(items);

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
        const maxItemWidth = LegendHelper.getMaxItemWidth(legendBlock, items, itemsDirection);

        items.nodes().forEach(node => {
            if (node.getBoundingClientRect().width > maxItemWidth) {
                console.log(1)
                const text = node.querySelector(`.${this.legendLabelClass}`);
                let labelText = text.textContent;
                while (node.getBoundingClientRect().width > maxItemWidth && labelText.length > 3) {
                    labelText = labelText.substr(0, labelText.length - 1);
                    text.textContent = labelText + '...';
                }
            }
        });
    }
}