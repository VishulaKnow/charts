import { Selection } from 'd3-selection'
import { Size, TitleBlockModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";

interface titleCoordinate {
    x: number;
    y: number;
    height: number;
    width: number;
}
export class Title {
    public static render(block: Block,  text: string, titleBlockModel: TitleBlockModel, blockSize: Size): void
    {
        this.renderTitleBlock(block, text, titleBlockModel, blockSize);
    }
    private static renderTitleBlock(block: Block, text: string, titleBlockModel: TitleBlockModel, blockSize: Size) {
        const titleBlock = block.getSvg()
            .append('text')
                .attr('class', 'chart-title');
        
        const titleCoordinate = this.getTitleCoordinate(blockSize, titleBlockModel);
        
        this.fillTitleBlockAttributes(titleBlock, titleCoordinate, text);
              
    }
    private static fillTitleBlockAttributes(titleBlock: Selection<SVGTextElement, unknown, HTMLElement, any>, coordinate: titleCoordinate, text: string) {
        titleBlock
        .attr('x', coordinate.x)
        .attr('y', coordinate.y)
        .attr('width', coordinate.width)
        .attr('height', coordinate.height)
        .attr('dominant-baseline', 'hanging')
        .text(text);   
        Helper.cropLabels(titleBlock, coordinate.width);
      
    }
    private static getTitleCoordinate(blockSize: Size, titleBlockModel: TitleBlockModel) : titleCoordinate{
        const coordinate: titleCoordinate = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        coordinate.x = titleBlockModel.margin.left;
        coordinate.y = titleBlockModel.margin.top;
        coordinate.width = blockSize.width - titleBlockModel.margin.left - titleBlockModel.margin.right;
        coordinate.height = titleBlockModel.size
        return coordinate;
    }
}