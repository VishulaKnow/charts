import { Color } from "d3";
import { DataRow, DataSource, LegendBlockModel, Orient, PolarOptionsModel, Size, TwoDimensionalOptionsModel } from "../../../model/model";
import { Block } from "../../block/svgBlock";

export class Legend
{
    public static render(data: DataSource, options: TwoDimensionalOptionsModel | PolarOptionsModel, legendsSize: LegendBlockModel, blockSize: Size): void {
        const positions: Orient[] = ['left', 'right', 'top', 'bottom'];
        positions.forEach(position => {
            if(options.type === '2d') {
                const charts = options.charts.filter((chart) => chart.legend.position === position);
                if(charts.length !== 0) {
                    this.renderLegendBlock(charts.map(chart => chart.data.dataSource),
                        position,
                        legendsSize[position].size,
                        charts.map(chart => chart.elementColors[0]),
                        blockSize);
                }
            } else {
                const charts = options.charts.filter((chart) => chart.legend.position === position);
                if(charts.length !== 0) {
                    this.renderLegendBlock(charts.map(chart => data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField.name]))[0], 
                        position, 
                        legendsSize[position].size,
                        charts.map(chart => chart.elementColors)[0],
                        blockSize);
                }
            }
        });
    }
    
    private static renderLegendBlock(items: string[], legendPosition: string, legendSize: number, colorPalette: Color[], blockSize: Size): void {
        const legendBlock = Block.getSvg()
            .append('foreignObject')
                .attr('class', 'legend');
        
        this.fillLegendCoordinateByPosition(legendBlock,
            legendPosition,
            legendSize,
            blockSize);  
            
        this.fillLegend(legendBlock,
            items,
            legendPosition,
            colorPalette);
    }
    
    private static fillLegendCoordinateByPosition(legendBlock: d3.Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, legendPosition: string, legendSize: number, blockSize: Size): void {
        if(legendPosition === 'left') {
            legendBlock
                .attr('y', 0)
                .attr('x', 0)
                .attr('width', legendSize)
                .attr('height', blockSize.height);
        } else if(legendPosition === 'right') {
            legendBlock
                .attr('y', 0)
                .attr('x', Math.ceil(blockSize.width - legendSize))
                .attr('width', Math.ceil(legendSize))
                .attr('height', blockSize.height);
        } else if(legendPosition === 'top') {
            legendBlock
                .attr('y', 0)
                .attr('x', 0)
                .attr('width', blockSize.width)
                .attr('height', legendSize);
        } else if(legendPosition === 'bottom') {
            legendBlock
                .attr('y', blockSize.height - legendSize)
                .attr('x', 0)
                .attr('width', blockSize.width)
                .attr('height', legendSize);
        }
    }
    
    private static fillLegend(legendBlock: d3.Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: string[], legendPosition: string, colorPalette: Color[]): void {
        const wrapper = legendBlock.append('xhtml:div');
        wrapper 
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'flex')
            .style('justify-content', 'center');
    
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