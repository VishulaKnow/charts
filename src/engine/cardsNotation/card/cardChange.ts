import { MdtChartsDataRow, MdtChartsIconElement } from "../../../config/config";
import { CardsChangeModel } from "../../../model/model";
import { NamesHelper } from "../../helpers/namesHelper";
import { ValueFormatter } from "../../valueFormatter";
import { CardChildElement, CardValueOptions } from "./card";

export class CardChange {
    render(contentBlock: CardChildElement, options: CardsChangeModel, dataRow: MdtChartsDataRow) {
        const wrapper = this.renderWrapper(contentBlock);

        this.setColor(wrapper, options);

        const changeContent = this.renderContentBlock(wrapper);

        if (options.icon) this.renderIcon(changeContent, options.icon);

        this.renderValue(changeContent, {
            value: dataRow[options.value.field],
            valueType: options.value.dataType
        });

        if (options.description) this.renderDescription(changeContent, options.description);
    }

    private renderWrapper(contentBlock: CardChildElement) {
        return contentBlock.append("div")
            .classed(NamesHelper.getClassName("card-change-wrapper"), true);
    }

    private setColor(wrapper: CardChildElement, options: CardsChangeModel) {
        wrapper.style("color", options.color);
    }

    private renderContentBlock(wrapper: CardChildElement) {
        return wrapper.append("div")
            .classed(NamesHelper.getClassName("card-change-content"), true);
    }

    private renderIcon(contentBlock: CardChildElement, icon: MdtChartsIconElement) {
        const iconEl = icon();

        contentBlock.append("div")
            .classed(NamesHelper.getClassName("card-change-icon"), true)
            .node()
            .appendChild(iconEl);
    }

    private renderValue(contentBlock: CardChildElement, options: CardValueOptions) {
        contentBlock.append("div")
            .classed(NamesHelper.getClassName("card-change-value"), true)
            .append("span")
            .text(ValueFormatter.formatField(options.valueType, options.value));
    }

    private renderDescription(contentBlock: CardChildElement, textContent: string) {
        contentBlock.append("div")
            .classed(NamesHelper.getClassName("card-change-description-wrapper"), true)
            .append("span")
            .classed(NamesHelper.getClassName("card-change-description"), true)
            .text(textContent);
    }
}