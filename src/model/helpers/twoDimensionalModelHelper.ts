import { MdtChartsDataRow, MdtChartsTwoDimensionalChart } from "../../config/config";
import { MarkersOptionsShow } from "../model";

export class TwoDimensionalModelHelper {
    public static shouldMarkerShow(chart: MdtChartsTwoDimensionalChart, dataRows: MdtChartsDataRow[], fieldName: string): MarkersOptionsShow {
        return ({ key }) => {
            if (chart.markers.show || dataRows.length === 1) return true

            const rowIndex = dataRows.findIndex(row => row.brand === key);

            if (rowIndex === -1) return false

            const isFirst = rowIndex === 0;
            const isLast = rowIndex === dataRows.length - 1;

            const previousRow = dataRows[rowIndex - 1];
            const nextRow = dataRows[rowIndex + 1];

            const hasNullNeighborsRows = !isFirst && !isLast &&
                previousRow?.[fieldName] === null && nextRow?.[fieldName] === null

            return (isFirst && nextRow?.[fieldName] === null) || (isLast && previousRow?.[fieldName] === null) || hasNullNeighborsRows;
        }
    }
}