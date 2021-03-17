import { merge } from "d3-array";
import { PieArcDatum, Arc, arc, Pie, pie } from "d3-shape";
import { BlockMargin, DataRow, DonutChartSettings, Size } from "../../../model/model";
import { Translate } from "./donut";

export class DonutHelper {
    public static getThickness(donutSettings: DonutChartSettings, blockSize: Size, margin: BlockMargin): number {
        if (Math.min(blockSize.width - margin.left - margin.right, blockSize.height - margin.bottom - margin.top) > 400)
            return donutSettings.maxThickness;
        return donutSettings.minThickness;
    }

    public static getArcCentroid(blockSize: Size, margin: BlockMargin, dataItem: PieArcDatum<DataRow>, donutThickness: number): [number, number] {
        const arc = this.getArcGeneratorObject(blockSize, margin, donutThickness);

        return arc.centroid(dataItem);
    }

    public static getArcGeneratorObject(blockSize: Size, margin: BlockMargin, donutThickness: number): Arc<any, PieArcDatum<DataRow>> {
        const outerRadius = this.getOuterRadius(margin, blockSize);
        const arc = this.getArcGenerator(outerRadius, outerRadius - donutThickness);

        return arc;
    }

    public static getOuterRadius(margin: BlockMargin, blockSize: Size): number {
        return Math.min(blockSize.width - margin.left - margin.right,
            blockSize.height - margin.top - margin.bottom) / 2;
    }

    public static getInnerRadius(outerRadius: number, thickness: number): number {
        return outerRadius - thickness;
    }

    public static getTranslate(margin: BlockMargin, blockSize: Size): Translate {
        return {
            x: (blockSize.width - margin.left - margin.right) / 2 + margin.left,
            y: (blockSize.height - margin.top - margin.bottom) / 2 + margin.top
        }
    }

    public static getArcGenerator(outerRadius: number, innerRadius: number): Arc<any, PieArcDatum<DataRow>> {
        return arc<PieArcDatum<DataRow>>()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);
    }

    public static getPieGenerator(valueField: string, padAngle: number): Pie<any, DataRow> {
        return pie<DataRow>()
            .padAngle(padAngle)
            .sort(null)
            .value(d => d[valueField]);
    }

    public static mergeDataWithZeros(firstDataset: DataRow[], secondDataset: DataRow[], keyField: string): DataRow[] {
        const secondSet = new Set()
        secondDataset.forEach(dataRow => {
            secondSet.add(dataRow[keyField]);
        });
        const onlyNew = firstDataset
            .filter(d => !secondSet.has(d[keyField]))
            .map((d, index, array) => {
                const data: DataRow = {
                    keyField: array[index][keyField],
                    valueField: 0
                }
                return data;
            });
        const sortedMerge = merge([secondDataset, onlyNew]);
        return sortedMerge;
    }
}