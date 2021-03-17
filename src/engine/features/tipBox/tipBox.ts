import { Selection } from 'd3-selection';
import { Block } from "../../block/block";
import { BlockMargin, Size } from '../../../model/model';

export interface TipBoxAttributes {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class TipBox {
    public static tipBoxClass = 'tipbox';

    public static render(block: Block, margin: BlockMargin, blockSize: Size): Selection<SVGRectElement, unknown, HTMLElement, any> {
        const attributes = this.getAttributes(margin, blockSize);
        return this.renderBlock(block, attributes);
    }

    private static renderBlock(block: Block, attributes: TipBoxAttributes): Selection<SVGRectElement, unknown, HTMLElement, any> {
        let tipBox = block.getSvg()
            .select<SVGRectElement>(`rect.${this.tipBoxClass}`);

        if (tipBox.empty())
            tipBox = block.getSvg()
                .append<SVGRectElement>('rect')
                .attr('class', this.tipBoxClass)
                .attr('x', attributes.x)
                .attr('y', attributes.y)
                .attr('width', attributes.width)
                .attr('height', attributes.height)
                .style('opacity', 0);

        return tipBox;
    }

    private static getAttributes(margin: BlockMargin, blockSize: Size): TipBoxAttributes {
        const pad = 5;
        return {
            x: margin.left - pad,
            y: margin.top - pad,
            width: blockSize.width - margin.left - margin.right + pad * 2,
            height: blockSize.height - margin.top - margin.bottom + pad * 2,
        }
    }
}