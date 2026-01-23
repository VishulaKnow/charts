import { DonutChartSizesModel, SunburstSlice, SunburstSliceSegment } from "../../../model";
import { BlockMargin } from "../../../model";
import { MdtChartsDataRow, MdtChartsSunburstOptions, Size } from "../../../../config/config";
import { DonutThicknessCalculator, DonutThicknessService } from "../../polar/donut/donutThicknessService";
import { getDonutLikeOuterRadius, getDonutLikeTranslate } from "../../polar/donut/donutLikeSizesCalculator";
import { MdtChartsDonutThicknessOptions } from "../../../../designer/designerConfig";

interface SliceModelBuilderConfig {
	margin: BlockMargin;
	blockSize: Size;
	scopedDataRows: MdtChartsDataRow[];
}

export class SliceModelBuilder {
	private thicknessService = new DonutThicknessService();

	constructor(private readonly config: SliceModelBuilderConfig) {}

	build(publicConfig: Pick<MdtChartsSunburstOptions, "slices" | "data">): SunburstSlice[] {
		const sizesBySlices = this.getSliceSizes(publicConfig);

		return publicConfig.slices.map<SunburstSlice>((slice, sliceIndex) => {
			const valuesForSliceKeys: Map<string, number> = new Map();
			this.config.scopedDataRows.forEach((row) => {
				const key = row[slice.data.keyField.name];
				if (key != null) {
					valuesForSliceKeys.set(
						key,
						(valuesForSliceKeys.get(key) ?? 0) + row[publicConfig.data.valueField.name]
					);
				}
			});

			return {
				sizes: sizesBySlices[sliceIndex],
				segments: Array.from(valuesForSliceKeys.entries()).map<SunburstSliceSegment>(([key, value]) => {
					return {
						value,
						color: "rgb(32, 157, 227)",
						tooltip: {
							content: {
								type: "rows",
								rows: [
									{
										textContent: {
											caption: key,
											value: value
										}
									}
								]
							}
						}
					};
				})
			};
		});
	}

	private getSliceSizes(publicConfig: Pick<MdtChartsSunburstOptions, "slices">): DonutChartSizesModel[] {
		const defaultThicknessInPercent = Math.max(25, Math.floor(50 / publicConfig.slices.length));
		const defaultThicknessOptions: MdtChartsDonutThicknessOptions = {
			min: `${defaultThicknessInPercent}%`,
			max: `${defaultThicknessInPercent}%`,
			value: `${defaultThicknessInPercent}%`
		};

		const thicknessBySliceIndexes = new Array<number>(publicConfig.slices.length).fill(0);
		publicConfig.slices.forEach((slice, sliceIndex) => {
			thicknessBySliceIndexes[sliceIndex] = DonutThicknessCalculator.getThickness(
				this.thicknessService.buildThicknessOptions(slice.canvas?.thickness ?? defaultThicknessOptions),
				this.config.blockSize,
				this.config.margin
			);
		});

		return publicConfig.slices.map<DonutChartSizesModel>((slice, sliceIndex) => {
			const thicknessOfOuterSlices = thicknessBySliceIndexes
				.slice(sliceIndex + 1)
				.reduce((acc, curr) => acc + curr, 0);
			const outerRadius =
				getDonutLikeOuterRadius(this.config.margin, this.config.blockSize) - thicknessOfOuterSlices;
			return {
				outerRadius,
				innerRadius: outerRadius - thicknessBySliceIndexes[sliceIndex],
				thickness: thicknessBySliceIndexes[sliceIndex],
				translate: getDonutLikeTranslate(this.config.margin, this.config.blockSize)
			};
		});
	}
}
