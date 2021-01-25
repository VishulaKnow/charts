import { Color } from "d3";
import { DataRow, DataSource, IntervalChartModel, IntervalOptionsModel, LegendBlockModel, Orient, PolarChartModel, PolarOptionsModel, Size, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "../../../model/model";
import { Block } from "../../block/block";

interface LegendCoordinate {
    x: number;
    y: number;
    height: number;
    width: number;
}

export class Legend
{
    public static render(block: Block, data: DataSource, options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel, legendBlockModel: LegendBlockModel, blockSize: Size): void {
        const positions: Orient[] = ['left', 'right', 'top', 'bottom'];
        positions.forEach(position => {
            const charts = this.getChartsWithLegend(options, position);
            if(charts.length !== 0) {
                const legendItemsContent = this.getLegendItemsContent(options, charts, data);
                const chartElementsColor = this.getChartElementsColor(options, charts);
                
                this.renderLegendBlock(block, 
                    legendItemsContent,
                    position,
                    legendBlockModel,
                    chartElementsColor,
                    blockSize);
            }
        });
    }
    
    private static renderLegendBlock(block: Block, items: string[], legendPosition: Orient, legendBlockModel: LegendBlockModel, colorPalette: Color[], blockSize: Size): void {
        const legendBlock = block.getSvg()
            .append('foreignObject')
                .attr('class', 'legend')
                // .style('outline', '1px solid red');

        const legendCoordinate = this.getLegendCoordinateByPosition(legendPosition, legendBlockModel, blockSize) 
        this.fillLegendCoordinate(legendBlock, legendCoordinate);  
            
        this.fillLegend(legendBlock,
            items,
            legendPosition,
            colorPalette);
    }

    private static getChartsWithLegend(options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel, legendPosition: Orient): Array<TwoDimensionalChartModel | PolarChartModel | IntervalChartModel> {
        return (options.charts as Array<TwoDimensionalChartModel | IntervalChartModel | PolarChartModel>).filter((chart: TwoDimensionalChartModel | IntervalChartModel | PolarChartModel) => chart.legend.position === legendPosition);
    }

    private static getLegendItemsContent(options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel, charts: Array<TwoDimensionalChartModel | IntervalChartModel | PolarChartModel>, data: DataSource): string[] {
        if(options.type === '2d' || options.type === 'interval') {
            return (charts as Array<TwoDimensionalChartModel | IntervalChartModel>).map((chart: TwoDimensionalChartModel | IntervalChartModel) => chart.title)
        } else {
            return (charts as PolarChartModel[]).map(chart => data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField.name]))[0]
        }
    }

    private static getChartElementsColor(options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel, charts: Array<TwoDimensionalChartModel | IntervalChartModel | PolarChartModel>): Color[] {
        if(options.type === '2d' || options.type === 'interval') {
            return (charts as Array<TwoDimensionalChartModel | IntervalChartModel>).map((chart: TwoDimensionalChartModel | IntervalChartModel) => chart.elementColors[0])
        } else {
            return (charts as PolarChartModel[]).map(chart => chart.elementColors)[0]
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
            coordinate.height = blockSize.height - legendModel.margin.top - legendModel.margin.bottom
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
        
        return coordinate
    }
    
    private static fillLegendCoordinate(legendBlock: d3.Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, coordinate: LegendCoordinate): void {
        legendBlock
            .attr('x', coordinate.x)
            .attr('y', coordinate.y)
            .attr('width', coordinate.width)
            .attr('height', coordinate.height);
    }
    
    private static fillLegend(legendBlock: d3.Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: string[], legendPosition: string, colorPalette: Color[]): void {
        const wrapper = legendBlock.append('xhtml:div');
        wrapper 
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'flex');
    
        if(legendPosition === 'left' || legendPosition === 'right')
            wrapper.style('flex-direction', 'column');
        else
            wrapper.style('flex-wrap', 'wrap');
        
        const itemWrappers = wrapper
            .selectAll('.legend-item')
            .data(items)
            .enter()
            .append('div')
                .attr('class', 'legend-item');
    
        itemWrappers
            .append('span')
            .attr('class', 'legend-circle')
            .style('background-color', (d, i) => colorPalette[i % colorPalette.length].toString());
    
        itemWrappers
            .data(items)
            .append('span')
            .attr('class', 'legend-label')
            .text(d => d.toString());
    }
}