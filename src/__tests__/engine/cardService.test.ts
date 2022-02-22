import { CardServiceClass } from "../../engine/cardsNotation/card/cardService";
import { ValueFormatter } from "../../engine/valueFormatter";

describe('CardService', () => {
    describe('getValueContent', () => {
        const service = new CardServiceClass();

        test('should return value from option and data set', () => {
            ValueFormatter.formatField = jest.fn();
            const formatFieldMock = ValueFormatter.formatField as jest.Mock;

            formatFieldMock.mockReturnValueOnce("100,00");

            const res = service.getValueContentFromDataSource({
                field: "valueField",
                dataType: "money",
                dataSetName: "dataSet"
            },
                { dataSet: [{ valueField: 100 }] });

            expect(formatFieldMock).toHaveBeenCalled();
            expect(formatFieldMock.mock.calls[0][0]).toBe("money");
            expect(formatFieldMock.mock.calls[0][1]).toBe(100);
            expect(res).toBe("100,00");
        });
    });
});