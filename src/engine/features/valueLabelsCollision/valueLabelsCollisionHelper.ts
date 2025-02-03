import {
    BoundingRect,
    LabelVisibility,
    ValueLabelElementRectInfo
} from "../../../engine/features/valueLabelsCollision/valueLabelsCollision";

export class ValueLabelsCollisionHelper {
    public static calculateValueLabelsVisibility(elements: ValueLabelElementRectInfo[]): Map<number, LabelVisibility> {
        const sortedLabels = elements.sort(
            (label1, label2) => label1.boundingClientRect.x - label2.boundingClientRect.x
        );
        const activeLabels: ValueLabelElementRectInfo[] = [];

        const labelsVisibility = new Map<number, LabelVisibility>();
        elements.forEach((label) => {
            labelsVisibility.set(label.index, { index: label.index, isVisible: true });
        });

        sortedLabels.forEach((currentLabel) => {
            for (let i = activeLabels.length - 1; i >= 0; i--) {
                const activeLabel = activeLabels[i];
                if (
                    activeLabel.boundingClientRect.x + activeLabel.boundingClientRect.width <
                    currentLabel.boundingClientRect.x
                ) {
                    activeLabels.splice(i, 1);
                }
            }

            for (const activeLabel of activeLabels) {
                if (this.isOverlapping(currentLabel.boundingClientRect, activeLabel.boundingClientRect)) {
                    if (currentLabel.boundingClientRect.x > activeLabel.boundingClientRect.x) {
                        labelsVisibility.get(currentLabel.index).isVisible = false;
                        break;
                    } else if (currentLabel.boundingClientRect.x === activeLabel.boundingClientRect.x) {
                        if (currentLabel.boundingClientRect.y > activeLabel.boundingClientRect.y) {
                            labelsVisibility.get(currentLabel.index).isVisible = false;
                            break;
                        } else labelsVisibility.get(activeLabel.index).isVisible = false;
                    } else labelsVisibility.get(activeLabel.index).isVisible = false;
                }
            }

            if (labelsVisibility.get(currentLabel.index).isVisible) {
                activeLabels.push(currentLabel);
            }
        });

        return labelsVisibility;
    }

    private static isOverlapping(rect1: BoundingRect, rect2: BoundingRect): boolean {
        return !(
            rect1.x + rect1.width < rect2.x ||
            rect1.x > rect2.x + rect2.width ||
            rect1.y + rect1.height < rect2.y ||
            rect1.y > rect2.y + rect2.height
        );
    }
}
