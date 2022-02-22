import { BaseType, Selection } from "d3-selection";
import { MdtChartsDataSource, MdtChartsIconElement, Size } from "../../../config/config";
import { DataType } from "../../../designer/designerConfig";
import { CardsOptionsModel } from "../../../model/model";
import { Block } from "../../block/block";
import { NamesHelper } from "../../helpers/namesHelper";
import { ValueFormatter } from "../../valueFormatter";
import { CardChange } from "./cardChange";

export type CardChildElement<T extends Element = HTMLElement> = Selection<T, unknown, BaseType, unknown>;

interface CardHeaderOptions {
    title: string;
    icon?: MdtChartsIconElement;
}

export interface CardValueOptions {
    value: number;
    valueType: DataType;
}

interface CanvasOptions {
    cardSize: Size;
}

export class CardChart {
    private cardValueCssClass = NamesHelper.getClassName("card-value");
    private cardContentBlockCssClass = NamesHelper.getClassName("card-content");

    render(block: Block, options: CardsOptionsModel, data: MdtChartsDataSource, canvasOptions: CanvasOptions) {
        const parent = block.html.getBlock();
        const dataRow = data[options.data.dataSource][0];

        const wrapper = this.renderCardWrapper(parent);
        const contentBlock = this.renderContentBlock(wrapper);
        this.setContentFontSize(contentBlock, canvasOptions);

        this.renderHeaderBlock(contentBlock, {
            title: options.title,
            icon: options.icon
        });

        if (options.description) this.renderDescriptionBlock(contentBlock, options.description);

        this.renderValueBlock(contentBlock, {
            value: dataRow[options.value.field],
            valueType: options.value.dataType
        });

        if (options.change) {
            const cardChange = new CardChange();
            cardChange.render(contentBlock, options.change, dataRow);
        }
    }

    updateData(block: Block, options: CardsOptionsModel, data: MdtChartsDataSource) {
        const dataRow = data[options.data.dataSource][0];

        const contentBlock = block.html.getBlock().select<HTMLElement>(`.${this.cardContentBlockCssClass}`);

        this.updateValueBlockContent(contentBlock, {
            value: dataRow[options.value.field],
            valueType: options.value.dataType
        })
    }

    private renderCardWrapper(parent: Selection<HTMLElement, unknown, BaseType, unknown>) {
        return parent.append("div")
            .classed(this.cardContentBlockCssClass, true);
    }

    private renderContentBlock(wrapper: CardChildElement) {
        return wrapper.append("div")
            .classed(NamesHelper.getClassName("card-content"), true);
    }

    private setContentFontSize(contentBlock: CardChildElement, canvasOptions: CanvasOptions) {
        const fontSize = Math.floor(Math.min(canvasOptions.cardSize.height, canvasOptions.cardSize.width) / 10);
        contentBlock.style("font-size", `${fontSize}px`);
    }

    private renderHeaderBlock(contentBlock: CardChildElement, options: CardHeaderOptions) {
        const header = contentBlock.append("div")
            .classed(NamesHelper.getClassName("card-header"), true);

        this.appendTitle(header, options.title);

        if (options.icon) this.appendIcon(header, options.icon);
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

    private renderValueBlock(contentBlock: CardChildElement, options: CardValueOptions) {
        const wrapper = contentBlock.append("div")
            .classed(NamesHelper.getClassName("card-value-wrapper"), true);

        wrapper.append("div")
            .classed(NamesHelper.getClassName("card-value-block"), true)
            .append("span")
            .classed(this.cardValueCssClass, true)
            .text(ValueFormatter.formatField(options.valueType, options.value));
    }

    private updateValueBlockContent(contentBlock: CardChildElement, options: CardValueOptions) {
        contentBlock.select(`.${this.cardValueCssClass}`)
            .text(ValueFormatter.formatField(options.valueType, options.value));
    }
}