import { Selection } from 'd3-selection'
import { Size, TitleBlockModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";

interface TitleAttributes {
    x: number;
    y: number;
    height: number;
    width: number;
    dominantBaseline: string;
}

export class Title {
    public static render(block: Block, text: string, titleBlockModel: TitleBlockModel, blockSize: Size): void {
        const titleBlock = block.getSvg()
            .append('text')
            .attr('class', 'chart-title');

        const titleCoordinate = this.getTitleAttributes(blockSize, titleBlockModel);

        this.fillTitleBlockAttributes(titleBlock, titleCoordinate, text);
    }

    private static fillTitleBlockAttributes(titleBlock: Selection<SVGTextElement, unknown, HTMLElement, any>, attributes: TitleAttributes, text: string) {
        titleBlock
            .attr('x', attributes.x)
            .attr('y', attributes.y)
            .attr('width', attributes.width)
            .attr('height', attributes.height)
            .attr('dominant-baseline', attributes.dominantBaseline)
            .text(text);

        Helper.cropSvgLabels(titleBlock, attributes.width);
    }

    private static getTitleAttributes(blockSize: Size, titleBlockModel: TitleBlockModel): TitleAttributes {
        const coordinate: TitleAttributes = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            dominantBaseline: "hanging"
        };

        coordinate.x = titleBlockModel.margin.left;
        coordinate.y = titleBlockModel.margin.top;
        coordinate.width = blockSize.width - titleBlockModel.margin.left - titleBlockModel.margin.right;
        coordinate.height = titleBlockModel.size;

        return coordinate;
    }
}