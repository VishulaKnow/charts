import { ValueLabelElementRectInfo } from "../../engine/features/valueLabelsCollision/valueLabelsCollision";
import { ValueLabelsCollisionHelper } from "../../engine/features/valueLabelsCollision/valueLabelsCollisionHelper";

describe('calculateValueLabelsVisibility', () => {
    let valueLabels: ValueLabelElementRectInfo[];

    beforeEach(() => {
        valueLabels = [
            {
                index: 1,
                boundingClientRect: { x: 340, y: 650, width: 30, height: 14 },
            },
            {
                index: 2,
                boundingClientRect: { x: 500, y: 640, width: 30, height: 14 },
            },
            {
                index: 3,
                boundingClientRect: { x: 660, y: 590, width: 36, height: 14 },
            },
            {
                index: 4,
                boundingClientRect: { x: 670, y: 650, width: 30, height: 14 },
            }
        ];
    });

    test('should return true, because all value labels visible', () => {
        const labelsVisibility = ValueLabelsCollisionHelper.calculateValueLabelsVisibility(valueLabels);
        const isAllLabelsVisible = Array.from(labelsVisibility.values()).every(label => label.isVisible);

        expect(isAllLabelsVisible).toBeTruthy();
    });

    test('should return false, because new value label below label with index 1', () => {
        const newValueLabel = {
            index: 5,
            boundingClientRect: { x: 340, y: 660, width: 40, height: 14 },
        };
        valueLabels.push(newValueLabel);

        const labelsVisibility = ValueLabelsCollisionHelper.calculateValueLabelsVisibility(valueLabels);

        expect(labelsVisibility.get(5).isVisible).toBeFalsy();
    });

    test('should return false, because new label to the right of the label with index 1', () => {
        const newValueLabel = {
            index: 5,
            boundingClientRect: { x: 350, y: 660, width: 40, height: 14 },
        };
        valueLabels.push(newValueLabel);

        const labelsVisibility = ValueLabelsCollisionHelper.calculateValueLabelsVisibility(valueLabels);

        expect(labelsVisibility.get(5).isVisible).toBeFalsy();
    });
});