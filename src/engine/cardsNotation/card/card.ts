import { BaseType, Selection } from "d3-selection";
import { MdtChartsIconElement } from "../../../main";
import { CardsOptionsModel } from "../../../model/model";
import { Block } from "../../block/block";
import { NamesHelper } from "../../helpers/namesHelper";

type CardChildElement<T extends Element = HTMLElement> = Selection<T, unknown, BaseType, unknown>;

interface CardHeaderOptions {
    title: string;
    icon?: MdtChartsIconElement;
}

export class CardChart {
    render(block: Block, options: CardsOptionsModel) {
        const parent = block.html.getBlock();

        const wrapper = this.appendCardWrapper(parent);
        const contentBlock = this.appendContentBlock(wrapper);

        this.appendHeaderBlock(contentBlock, {
            title: options.title,
            icon: options.icon
        });

        if (options.description) this.appendDescriptionBlock(contentBlock, options.description);


    }

    private appendCardWrapper(parent: Selection<HTMLElement, unknown, BaseType, unknown>) {
        return parent.append("div")
            .classed(NamesHelper.getClassName("card-wrapper"), true);
    }

    private appendContentBlock(wrapper: CardChildElement) {
        return wrapper.append("div")
            .classed(NamesHelper.getClassName("card-content"), true);
    }

    private appendHeaderBlock(contentBlock: CardChildElement, options: CardHeaderOptions) {
        const header = contentBlock.append("div")
            .classed(NamesHelper.getClassName("card-header"), true);

        this.appendTitle(header, options.title);
    }

    private appendTitle(headerBlock: CardChildElement, textContent: string) {
        headerBlock.append("h3")
            .classed(NamesHelper.getClassName("card-title"), true)
            .text(textContent)
    }

    private appendDescriptionBlock(contentBlock: CardChildElement, textContent: string) {
        contentBlock.append("p")
            .classed(NamesHelper.getClassName("card-description"), true)
            .text(textContent);
    }
}