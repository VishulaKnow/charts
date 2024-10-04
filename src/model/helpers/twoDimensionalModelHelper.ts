import { MdtChartsDataRow, MdtChartsTwoDimensionalChart } from "../../config/config";
import { MarkDotDatumItem } from "../model";

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
}