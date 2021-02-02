import { Color, text } from "d3";
import { ChartNotation, LegendPosition } from "../../../config/config";
import { LegendItemsDirection } from "../../../model/legendModel/legendCanvasModel";
import { DataRow, DataSource, IntervalChartModel, IntervalOptionsModel, LegendBlockModel, Orient, PolarChartModel, PolarOptionsModel, Size, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";

interface LegendCoordinate {
    x: number;
    y: number;
    height: number;
    width: number;
}

export class Legend
{
    public static render(block: Block, data: DataSource, options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel, legendBlockModel: LegendBlockModel, blockSize: Size): void {
        if(options.legend.position !== 'off') {
            const legendItemsContent = this.getLegendItemsContent(options, data);
            const chartElementsColor = this.getMarksColor(options);
            const legendItemsDirection = this.getLegendItemsDirection(options.type, options.legend.position); 

            this.renderLegendBlock(block, 
                legendItemsContent,
                options.legend.position,
                legendBlockModel,
                chartElementsColor,
                blockSize,
                legendItemsDirection);
        }
    }
    
    private static renderLegendBlock(block: Block, items: string[], legendPosition: Orient, legendBlockModel: LegendBlockModel, colorPalette: Color[], blockSize: Size, itemsDirection: LegendItemsDirection): void {
        const legendBlock = block.getSvg()
            .append('foreignObject')
                .attr('class', 'legend-object');
        
        const legendCoordinate = this.getLegendCoordinateByPosition(legendPosition, legendBlockModel, blockSize);
        this.fillLegendCoordinate(legendBlock, legendCoordinate);  
            
        this.renderLegendContent(legendBlock,
            items,
            colorPalette,
            itemsDirection,
            legendPosition);
    }

    private static getLegendItemsContent(options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel, data: DataSource): string[] {
        if(options.type === '2d') {
            let texts: string[] = [];
            options.charts.forEach(chart => {
                texts = texts.concat(chart.data.valueField.map(field => field.title));
            });            
            return texts;
        } else if(options.type === 'polar') {
            return options.charts.map(chart => data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField.name]))[0];
        } else if(options.type === 'interval') {
            return options.charts.map(chart => chart.title);
        }
    }

    private static getMarksColor(options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel): Color[] {
        if(options.type === '2d') {
            let colors: Color[] = [];
            options.charts.forEach(chart => {
                colors = colors.concat(chart.style.elementColors);
            });
            return colors;
        } else if(options.type === 'polar') {
            return options.charts.map(chart => chart.style.elementColors)[0];
        } else if(options.type === 'interval') {
            return options.charts.map(chart => chart.style.elementColors[0]);
        }
    }

    private static getLegendCoordinateByPosition(legendPosition: Orient, legendBlockModel: LegendBlockModel, blockSize: Size): LegendCoordinate {
        const legendModel = legendBlockModel[legendPosition];
        const coordinate: LegendCoordinate = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
        
        if(legendPosition === 'left' || legendPosition === 'right') {
            coordinate.y = legendModel.margin.top;
            coordinate.width = legendModel.size;
            coordinate.height = blockSize.height - legendModel.margin.top - legendModel.margin.bottom;
        } else if(legendPosition === 'bottom' || legendPosition === 'top') {
            coordinate.x = legendModel.margin.left;
            coordinate.width = blockSize.width - legendModel.margin.left - legendModel.margin.right;
            coordinate.height = legendModel.size;
        }

        if(legendPosition === 'left') 
            coordinate.x = legendModel.margin.left;
        else if(legendPosition === 'right')
            coordinate.x = blockSize.width - legendModel.size - legendModel.margin.right;
        else if(legendPosition === 'top')
            coordinate.y = legendModel.margin.top;
        else if(legendPosition === 'bottom')
            coordinate.y = blockSize.height - legendModel.size - legendModel.margin.bottom;
        
        return coordinate;
    }
    
    private static fillLegendCoordinate(legendBlock: d3.Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, coordinate: LegendCoordinate): void {
        legendBlock
            .attr('x', coordinate.x)
            .attr('y', coordinate.y)
            .attr('width', coordinate.width)
            .attr('height', coordinate.height);
    }
    
    private static renderLegendContent(legendBlock: d3.Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: string[], colorPalette: Color[], itemsDirection: LegendItemsDirection, position: LegendPosition): void {
        const wrapper = legendBlock.append('xhtml:div')
            .attr('class', 'legend-block');

        wrapper
            .style('height', '100%')
            .style('display', 'flex');
    
        if(itemsDirection === 'column') {
            wrapper.style('flex-direction', 'column');
        }
        
        const itemWrappers = wrapper
            .selectAll('.legend-item')
            .data(items)
            .enter()
            .append('div')
                .attr('class', this.getItemClasses(itemsDirection, position));
    
        itemWrappers
            .append('span')
            .attr('class', 'legend-circle')
            .style('background-color', (d, i) => colorPalette[i % colorPalette.length].toString());
    
        itemWrappers
            .data(items)
            .append('span')
            .attr('class', 'legend-label')
            .text(d => d.toString());

        if(itemsDirection === 'row')
            this.cropLegendLabels(legendBlock, itemWrappers);
    }

    private static cropLegendLabels(legendBlock: d3.Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: d3.Selection<HTMLDivElement, string, d3.BaseType, unknown>): void {
        const margins = items.nodes().map(node => Helper.getPXpropertyValue(Helper.getPropertyValue(node, 'margin-left')));
        const sumOfMargins = Helper.getSumOfNumbers(margins);
        const maxItemWidth = (parseFloat(legendBlock.attr('width')) - sumOfMargins) / items.size();

        items.nodes().forEach(node => {
            if(node.getBoundingClientRect().width > maxItemWidth) {
                const text = node.querySelector('.legend-label');
                let labelText = text.textContent;
                while(node.getBoundingClientRect().width > maxItemWidth && labelText.length > 3) {
                    labelText = labelText.substr(0, labelText.length - 1);
                    text.textContent = labelText + '...';
                }
            }
        });
    }

    private static getItemClasses(itemsDirection: LegendItemsDirection, position: LegendPosition): string {
        let cssClasses = this.getLegendItemClassByDirection(itemsDirection);
        if(itemsDirection === 'column')
            cssClasses += ` ${this.getLegendItemsMarginClass(position)}`;
        return cssClasses;
    }

    private static getLegendItemClassByDirection(itemsDirection: LegendItemsDirection): string {
        return itemsDirection === 'column' ? 'legend-item-row' : 'legend-item-inline';
    }

    private static getLegendItemsMarginClass(legendPosition: LegendPosition): string {
        return legendPosition === 'right' ? 'mt-15' : 'mt-10';
    }

    private static getLegendItemsDirection(chartNotation: ChartNotation, legendPosition: LegendPosition): LegendItemsDirection {
        if(legendPosition === 'right' || legendPosition === 'left')
            return 'column';
        else
            return chartNotation === 'polar' ? 'column' : 'row';
    }
}