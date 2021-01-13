import * as d3 from "d3";
import { Size } from "../../model/model";

export class SvgBlock
{
    static render(cssClass: string, blockSize: Size): void {
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

    static getSvg(): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        return d3.select('.main-wrapper .wrapper').select('svg');
    }
}