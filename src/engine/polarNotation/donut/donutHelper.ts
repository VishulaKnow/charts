import { merge } from "d3-array";
import { PieArcDatum, Arc, arc, Pie, pie } from "d3-shape";
import { MdtChartsDataRow, Size, MdtChartsColorField } from "../../../config/config";
import { MdtChartsDonutThicknessUnit } from "../../../main";
import { BlockMargin, DonutChartSettings } from "../../../model/model";
import { Translate } from "./donut";

const MIN_CHART_BLOCK_SIZE_FOR_MAX_THICKNESS = 400;

export class DonutHelper {
    public static getThickness(donutSettings: DonutChartSettings, blockSize: Size, margin: BlockMargin): number {
        const thicknessOpts = donutSettings.thickness;
        const chartBlockSize = this.getChartBlockSize(blockSize, margin);

        if (thicknessOpts.value) return this.getThicknessByUnit(chartBlockSize, thicknessOpts.value, thicknessOpts.unit);

        if (Math.min(chartBlockSize.width, chartBlockSize.height) > MIN_CHART_BLOCK_SIZE_FOR_MAX_THICKNESS)
            return this.getThicknessByUnit(chartBlockSize, thicknessOpts.max, thicknessOpts.unit);
        return this.getThicknessByUnit(chartBlockSize, thicknessOpts.min, thicknessOpts.unit);
    }

    public static getArcCentroid(blockSize: Size, margin: BlockMargin, dataItem: PieArcDatum<MdtChartsDataRow>, donutThickness: number): [number, number] {
        const arc = this.getArcGeneratorObject(blockSize, margin, donutThickness);

        return arc.centroid(dataItem);
    }

    public static getArcGeneratorObject(blockSize: Size, margin: BlockMargin, donutThickness: number): Arc<any, PieArcDatum<MdtChartsDataRow>> {
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

    public static getArcGenerator(outerRadius: number, innerRadius: number): Arc<any, PieArcDatum<MdtChartsDataRow>> {
        return arc<PieArcDatum<MdtChartsDataRow>>()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);
    }

    public static getPieGenerator(valueField: string, padAngle: number): Pie<any, MdtChartsDataRow> {
        return pie<MdtChartsDataRow>()
            .padAngle(padAngle)
            .sort(null)
            .value(d => d[valueField]);
    }

    public static mergeDataWithZeros(firstDataset: MdtChartsDataRow[], secondDataset: MdtChartsDataRow[], keyField: string, colorField: MdtChartsColorField): MdtChartsDataRow[] {
        const secondSet = new Set()
        secondDataset.forEach(dataRow => {
            secondSet.add(dataRow[keyField]);
        });
        const onlyNew = firstDataset
            .filter(d => !secondSet.has(d[keyField]))
            .map((d, index, array) => {
                const data: MdtChartsDataRow = {
                    keyField: array[index][keyField],
                    valueField: 0,
                    [colorField]: array[index][colorField]
                    //TODO: добавить цвет из ColorReader'а
                }
                return data;
            });
        const sortedMerge = merge([secondDataset, onlyNew]);
        return sortedMerge;
    }

    private static getThicknessByUnit(chartBlockSize: Size, valueInPx: number, unit: MdtChartsDonutThicknessUnit) {
        if (unit === "px") return valueInPx;

        const minSideSize = Math.min(chartBlockSize.width, chartBlockSize.height);
        return minSideSize / 2 * (valueInPx / 100);
    }

    private static getChartBlockSize(blockSize: Size, margin: BlockMargin): Size {
        return {
            height: blockSize.height - margin.top - margin.bottom,
            width: blockSize.width - margin.left - margin.right
        }
    }
}