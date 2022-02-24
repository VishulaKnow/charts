import { MdtChartsDataRow, MdtChartsIconElement } from "../../../config/config";
import { CardsChangeModel } from "../../../model/model";
import { NamesHelper } from "../../helpers/namesHelper";
import { CardChildElement, CardValueContent } from "./card";
import { CardService } from "./cardService";

export class CardChange {
    private wrapper: CardChildElement;
    private iconBlock: CardChildElement;
    private valueContentBlock: CardChildElement;
    private contentBlock: CardChildElement;

    render(contentBlock: CardChildElement, options: CardsChangeModel, dataRow: MdtChartsDataRow) {
        this.wrapper = this.renderWrapper(contentBlock);
        this.setColor(this.wrapper, options);

        this.renderContentBlock(this.wrapper);
        this.renderContentItems(this.contentBlock, options, dataRow);
    }

    update(options: CardsChangeModel, dataRow: MdtChartsDataRow) {
        this.setColor(this.wrapper, options);
        this.setValueContent(CardService.getValueContentFromRow(options.value, dataRow), options.valuePrefix);

        if (options.icon) {
            if (this.iconBlock) {
                this.iconBlock.html("");
                this.renderIconEl(options.icon);
            } else {
                this.renderIcon(this.contentBlock, options.icon);
            }
        }
    }

    private renderWrapper(contentBlock: CardChildElement) {
        return contentBlock.append("div")
            .classed(NamesHelper.getClassName("card-change-wrapper"), true);
    }

    private setColor(wrapper: CardChildElement, options: CardsChangeModel) {
        wrapper.style("color", options.color);
    }

    private renderContentBlock(wrapper: CardChildElement) {
        this.contentBlock = wrapper.append("div")
            .classed(NamesHelper.getClassName("card-change-content"), true);
    }

    private renderContentItems(contentBlock: CardChildElement, options: CardsChangeModel, dataRow: MdtChartsDataRow) {
        if (options.icon) this.renderIcon(this.renderContentItem(contentBlock), options.icon);

        this.renderValue(this.renderContentItem(contentBlock), CardService.getValueContentFromRow(options.value, dataRow), options.valuePrefix);

        if (options.description) this.renderDescription(this.renderContentItem(contentBlock, NamesHelper.getClassName("card-change-description-item")), options.description);
    }

    private renderContentItem(contentBlock: CardChildElement, cssClass?: string) {
        const item = contentBlock.append("div")
            .classed(NamesHelper.getClassName("card-change-content-item"), true)

        if (cssClass) item.classed(cssClass, true);

        return item;
    }

    private renderIcon(parentBlock: CardChildElement, icon: MdtChartsIconElement) {
        this.iconBlock = parentBlock.append("div")
            .classed(NamesHelper.getClassName("card-change-icon"), true);
        this.renderIconEl(icon);
    }

    private renderIconEl(icon: MdtChartsIconElement) {
        const iconEl = icon();

        this.iconBlock
            .node()
            .appendChild(iconEl);
    }

    private renderValue(parentBlock: CardChildElement, value: CardValueContent, prefix: string) {
        this.valueContentBlock = parentBlock.append("div")
            .classed(NamesHelper.getClassName("card-change-value"), true)
            .append("span");

        this.setValueContent(value, prefix);
    }

    private renderDescription(parentBlock: CardChildElement, textContent: CardValueContent) {
        return parentBlock.append("div")
            .classed(NamesHelper.getClassName("card-change-description-wrapper"), true)
            .append("span")
            .classed(NamesHelper.getClassName("card-change-description"), true)
            .text(textContent)
            .attr("title", textContent);
    }

    private setValueContent(textContent: CardValueContent, prefix: string) {
        this.valueContentBlock.text(prefix + textContent);
    }
}