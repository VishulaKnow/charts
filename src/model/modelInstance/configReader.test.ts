import { TwoDimConfigReader } from "./configReader";

describe('TwoDimConfigReader', () => {
    describe('getFieldsBySegments', () => {
        const reader = new TwoDimConfigReader(
            {
                canvas: null,
                options: {
                    charts: [
                        {
                            type: "bar",
                            isSegmented: true,
                            embeddedLabels: null,
                            markers: null,
                            tooltip: null,
                            data: {
                                valueFields: [
                                    { name: "Val1", title: "", format: "" },
                                    { name: "Val2", title: "", format: "" }
                                ]
                            }
                        },
                        {
                            type: "line",
                            isSegmented: false,
                            embeddedLabels: null,
                            markers: null,
                            tooltip: null,
                            data: {
                                valueFields: [
                                    { name: "Val3", title: "", format: "" },
                                    { name: "Val4", title: "", format: "" }
                                ]
                            }
                        }
                    ]
                } as any
            },
            null
        );
        const result = reader.getFieldsBySegments();
        expect(result).toEqual([["Val1", "Val2"], ["Val3"], ["Val4"]]);
    });
});