import { Selection } from "d3-selection";
import { Block } from "../../block/block";
import { BlockMargin } from "../../../model/model";
import { Size } from "../../../config/config";
import { TipBoxAttributes, TipBoxHelper } from "./tipBoxHelper";

export class TipBox {
    public static readonly tipBoxClass = "tipbox";

    public static renderOrGet(
        block: Block,
        margin: BlockMargin,
        blockSize: Size
    ): Selection<SVGRectElement, unknown, HTMLElement, any> {
        const attributes = TipBoxHelper.getAttributes(margin, blockSize);
        return this.renderBlock(block, attributes);
    }

    public static get(block: Block): Selection<SVGRectElement, unknown, HTMLElement, any> {
        return block.getSvg().select(`.${this.tipBoxClass}`);
    }

    public static clearEvents(block: Block): void {
        block.getSvg().select(`.${this.tipBoxClass}`).on("mousemove", null).on("mouseleave", null).on("click", null);
    }

    private static renderBlock(
        block: Block,
        attributes: TipBoxAttributes
    ): Selection<SVGRectElement, unknown, HTMLElement, any> {
        let tipBox = block.getSvg().select<SVGRectElement>(`rect.${this.tipBoxClass}`);

        if (tipBox.empty())
            tipBox = block
                .getSvg()
                .append<SVGRectElement>("rect")
                .attr("class", this.tipBoxClass)
                .attr("x", attributes.x)
                .attr("y", attributes.y)
                .attr("width", attributes.width)
                .attr("height", attributes.height)
                .style("opacity", 0);

        return tipBox;
    }
}
