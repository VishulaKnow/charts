import { ChartOrientation, MdtChartsDataRow, MdtChartsTwoDimensionalChart } from "../../config/config";
import { GradientDef, MarkDotDatumItem, Orient, TwoDimensionalChartModel } from "../model";
import { getGradientId } from "../../model/notations/twoDimensional/styles";

export class TwoDimensionalModelHelper {
    public static shouldMarkerShow(chart: MdtChartsTwoDimensionalChart, dataRows: MdtChartsDataRow[], valueFieldName: string, currentRow: MarkDotDatumItem, keyFieldName: string): boolean {
        if (chart.markers.show || dataRows.length === 1) return true

        const rowIndex = dataRows.findIndex(row => row[keyFieldName] === (currentRow as any)[keyFieldName]);

        if (rowIndex === -1) return false

        const isFirst = rowIndex === 0;
        const isLast = rowIndex === dataRows.length - 1;

        const previousRow = dataRows[rowIndex - 1];
        const nextRow = dataRows[rowIndex + 1];

        const hasNullNeighborsRows = !isFirst && !isLast &&
            previousRow?.[valueFieldName] === null && nextRow?.[valueFieldName] === null

        return (isFirst && nextRow?.[valueFieldName] === null) || (isLast && previousRow?.[valueFieldName] === null) || hasNullNeighborsRows;
    }

    public static getGradientDefs(charts: TwoDimensionalChartModel[], keyAxisOrient: Orient, chartOrient: ChartOrientation): GradientDef[] {
        let gradients: GradientDef[] = [];

        charts.forEach((chart) => {
            if (chart.type === 'area' && chart.areaViewOptions.fill.type === 'gradient') {
                chart.style.elementColors?.forEach((elementColor, subIndex) => {
                    const gradientId = getGradientId(chart.index, subIndex);

                    gradients.push({
                        id: gradientId,
                        position: {
                            x1: 0,
                            y1: 0,
                            x2: chartOrient === 'horizontal' ? 1 : 0,
                            y2: chartOrient === 'horizontal' ? 0 : 1,
                        },
                        items: this.getGradientItems(gradientId, elementColor, keyAxisOrient),
                    });
                })
            }
        });

        return gradients;
    }

    private static getGradientItems(gradientId: string, elementColor: string, keyAxisOrient: Orient) {
        return [0, 1].map(indexItem => ({
            id: gradientId + `-item-${indexItem}`,
            color: elementColor,
            offset: indexItem,
            opacity: this.calculateOpacityItem(indexItem, keyAxisOrient)
        }));
    }

    private static calculateOpacityItem(indexItem: number, orientation: Orient): number {
        const maxOpacity = 0.7;
        const minOpacity = 0;

        if (orientation === 'bottom' || orientation === 'right')
            return indexItem === 0 ? maxOpacity : minOpacity;
        else
            return indexItem === 0 ? minOpacity : maxOpacity;
    };
}