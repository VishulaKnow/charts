import * as d3 from "d3";
import { BlockMargin, Size } from "../../model/model";
import { BlockHelper } from "./blockHelper";

export class Block
{
    public static render(cssClass: string, blockSize: Size): void {
        const wrapper = d3.select('.main-wrapper')
            .append('div')
            .attr('class', 'wrapper')
            .attr('width', blockSize.width)
            .attr('height', blockSize.height);
    
        wrapper
            .append('svg')
            .attr('width', blockSize.width)
            .attr('height', blockSize.height)
            .attr('class', cssClass);
    }

    public static renderChartBlock(blockSize: Size, margin: BlockMargin): void {
        const attributes = BlockHelper.getChartBlockAttributes(blockSize, margin);
        this.getSvg()
            .append('g')
            .attr('class', 'chart-block')
            .attr('x', attributes.x)
            .attr('y', attributes.y)
            .attr('width', attributes.width)
            .attr('height', attributes.height);
    }

    public static getSvg(): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        return d3.select('.main-wrapper .wrapper').select('svg');
    }

    public static getChartBlock(): d3.Selection<SVGGElement, unknown, HTMLElement, any> {
        return this.getSvg()
            .select('.chart-block');
    } 
    
    public static renderClipPath(margin: BlockMargin, blockSize: Size): void {
        const attributes = BlockHelper.getChartBlockAttributes(blockSize, margin);
        this.getSvg()
            .append('clipPath')
            .attr('id', 'chart-block')
            .append('rect')
            .attr('x', attributes.x)
            .attr('y', attributes.y)
            .attr('width', attributes.width)
            .attr('height', attributes.height);
    }

    public static getClipPathId(): string {
        return '#chart-block';
    }
}