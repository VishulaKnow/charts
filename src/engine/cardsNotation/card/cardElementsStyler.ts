import { CardChildElement } from "./card";

export class CardElementsStyler {
    private readonly cardValueFontSize = "2em";

    setValueBlockFontSize(valueBlock: CardChildElement) {
        this.setFontSize(valueBlock, this.cardValueFontSize);
    }

    private setFontSize(cardElement: CardChildElement, value: string) {
        cardElement.style("font-size", value);
    }
}