import { BaseType, Selection } from "d3-selection";
import { MdtChartsDataSource, MdtChartsIconElement, Size } from "../../../config/config";
import { CardsOptionsModel } from "../../../model/model";
import { Block } from "../../block/block";
import { FontResizer } from "../../helpers/fontResizer/fontResizer";
import { NamesHelper } from "../../helpers/namesHelper";
import { CardChange } from "./cardChange";
import { CardElementsStyler } from "./cardElementsStyler";
import { CardService } from "./cardService";

export type CardChildElement<T extends Element = HTMLElement> = Selection<T, unknown, BaseType, unknown>;

interface CardHeaderOptions {
    title: string;
    icon?: MdtChartsIconElement;
}

interface CanvasOptions {
    cardSize: Size;
}

export type CardValueContent = string | number;

export class CardChart {
    private readonly cardValueCssClass = NamesHelper.getClassName("card-value");
    private readonly cardContentBlockCssClass = NamesHelper.getClassName("card-content");

    private valueContentElement: CardChildElement;
    private cardContentElement: CardChildElement;

    private changeBlock: CardChange;
    private styler = new CardElementsStyler();

    render(block: Block, options: CardsOptionsModel, data: MdtChartsDataSource, canvasOptions: CanvasOptions) {
        const parent = block.html.getBlock();
        const dataRow = data[options.data.dataSource][0];

        const wrapper = this.renderCardWrapper(parent);
        this.renderContentBlock(wrapper);
        this.setContentFontSize(this.cardContentElement, canvasOptions);

        this.renderHeaderBlock(this.cardContentElement, {
            title: options.title,
            icon: options.icon
        });

        if (options.description) this.renderDescriptionBlock(this.cardContentElement, options.description);

        this.renderValueBlock(this.cardContentElement, CardService.getValueContentFromDataSource({ ...options.value, dataSetName: options.data.dataSource }, data));

        if (options.change) {
            this.changeBlock = new CardChange();
            this.changeBlock.render(this.cardContentElement, options.change, dataRow);
        }
    }

    updateData(options: CardsOptionsModel, data: MdtChartsDataSource) {
        const dataRow = data[options.data.dataSource][0];
        this.setValueContent(CardService.getValueContentFromDataSource({ ...options.value, dataSetName: options.data.dataSource }, data));
        this.updateValueBlockStyle();
        this.changeBlock?.update(options.change, dataRow);
    }

    private renderCardWrapper(parent: Selection<HTMLElement, unknown, BaseType, unknown>) {
        return parent.append("div")
            .classed(this.cardContentBlockCssClass, true);
    }

    private renderContentBlock(wrapper: CardChildElement) {
        this.cardContentElement = wrapper.append("div")
            .classed(NamesHelper.getClassName("card-content"), true);
    }

    private setContentFontSize(contentBlock: CardChildElement, canvasOptions: CanvasOptions) {
        const fontSize = Math.floor(Math.min(canvasOptions.cardSize.height, canvasOptions.cardSize.width) / 10);
        contentBlock.style("font-size", `${fontSize}px`);
    }

    private renderHeaderBlock(contentBlock: CardChildElement, options: CardHeaderOptions) {
        const header = contentBlock.append("div")
            .classed(NamesHelper.getClassName("card-header"), true);

        if (options.icon) this.appendIcon(header, options.icon);

        this.appendTitle(header, options.title);
    }

    private appendTitle(headerBlock: CardChildElement, textContent: string) {
        headerBlock.append("h3")
            .classed(NamesHelper.getClassName("card-title"), true)
            .text(textContent)
    }

    private appendIcon(headerBlock: CardChildElement, icon: MdtChartsIconElement) {
        const iconEl = icon();

        headerBlock.append("div")
            .classed(NamesHelper.getClassName("card-icon"), true)
            .node()
            .appendChild(iconEl);
    }

    private renderDescriptionBlock(contentBlock: CardChildElement, textContent: string) {
        const wrapper = contentBlock.append("div")
            .classed(NamesHelper.getClassName("card-description-wrapper"), true);

        wrapper.append("p")
            .classed(NamesHelper.getClassName("card-description"), true)
            .text(textContent);
    }

    private renderValueBlock(contentBlock: CardChildElement, value: CardValueContent) {
        const wrapper = contentBlock.append("div")
            .classed(NamesHelper.getClassName("card-value-wrapper"), true);

        this.valueContentElement = wrapper.append("div")
            .classed(NamesHelper.getClassName("card-value-block"), true)
            .append("span")
            .classed(this.cardValueCssClass, true);

        this.setValueContent(value);

        this.updateValueBlockStyle();
    }

    private updateValueBlockStyle() {
        this.styler.setValueBlockFontSize(this.valueContentElement);

        FontResizer.setSize(this.valueContentElement.node(), {
            elWrapper: this.cardContentElement.node(),
            unit: "em",
            smallestFontSize: 0.5,
            step: 0.1
        });
    }

    private setValueContent(value: CardValueContent) {
        this.valueContentElement.text(value);
    }
}