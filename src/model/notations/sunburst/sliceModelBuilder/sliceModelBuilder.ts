import { DonutChartSizesModel, SunburstSlice, SunburstSliceSegment } from "../../../model";
import { BlockMargin } from "../../../model";
import { MdtChartsDataRow, MdtChartsSunburstOptions, Size } from "../../../../config/config";
import { DonutThicknessCalculator, DonutThicknessService } from "../../polar/donut/donutThicknessService";
import { getDonutLikeOuterRadius, getDonutLikeTranslate } from "../../polar/donut/donutLikeSizesCalculator";
import { Formatter, MdtChartsDonutThicknessOptions } from "../../../../designer/designerConfig";

interface SliceModelBuilderConfig {
	margin: BlockMargin;
	blockSize: Size;
	scopedDataRows: MdtChartsDataRow[];
	topSliceColors: string[];
	formatter: Formatter;
}

export class SliceModelBuilder {
	private thicknessService = new DonutThicknessService();

	constructor(private readonly config: SliceModelBuilderConfig) {}

	build(publicConfig: Pick<MdtChartsSunburstOptions, "slices" | "data">): SunburstSlice[] {
		const sizesBySlices = this.getSliceSizes(publicConfig);

		const topSliceKeyFieldName = publicConfig.slices[0].data.keyField.name;
		//TODO: extract to function and remove duplicate with sunburstModel
		const topSliceValues = this.config.scopedDataRows
			.map((record) => record[topSliceKeyFieldName])
			.filter((value, index, self) => self.indexOf(value) === index);
		const topSliceColorsByValue = topSliceValues.reduce<Record<string, string>>((acc, value, index) => {
			acc[value] = this.config.topSliceColors[index % this.config.topSliceColors.length];
			return acc;
		}, {});

		return publicConfig.slices.map<SunburstSlice>((slice, sliceIndex) => {
			const valuesForSliceKeys: Map<string, { value: number; color: string }> = new Map();

			this.config.scopedDataRows.forEach((row) => {
				const key = row[slice.data.keyField.name];
				const color = topSliceColorsByValue[row[topSliceKeyFieldName]];
				if (key != null) {
					const newValue = (valuesForSliceKeys.get(key)?.value ?? 0) + row[publicConfig.data.valueField.name];
					valuesForSliceKeys.set(key, { value: newValue, color });
				}
			});

			return {
				sizes: sizesBySlices[sliceIndex],
				segments: Array.from(valuesForSliceKeys.entries()).map<SunburstSliceSegment>(
					([key, { value, color }]) => {
						return {
							value,
							key,
							color,
							tooltip: {
								content: {
									type: "rows",
									rows: [
										{
											textContent: {
												caption: key
											}
										},
										{
											marker: {
												markerShape: "circle",
												color
											},
											textContent: {
												caption: publicConfig.data.valueField.title,
												value: this.config.formatter(value, {
													type: publicConfig.data.valueField.format
												})
											}
										}
									]
								}
							}
						};
					}
				)
			};
		});
	}

	private getSliceSizes(publicConfig: Pick<MdtChartsSunburstOptions, "slices">): DonutChartSizesModel[] {
		const gapBetweenSlicesInPercent = 1;

		const defaultThicknessInPercent = Math.min(
			25,
			Math.floor((50 - gapBetweenSlicesInPercent * (publicConfig.slices.length - 1)) / publicConfig.slices.length)
		);
		const defaultThicknessOptions: MdtChartsDonutThicknessOptions = {
			min: `${defaultThicknessInPercent}%`,
			max: `${defaultThicknessInPercent}%`,
			value: `${defaultThicknessInPercent}%`
		};

		const gapBetweenSlicesInPx = DonutThicknessCalculator.calcPercentValue(
			DonutThicknessCalculator.getChartBlockSize(this.config.blockSize, this.config.margin),
			gapBetweenSlicesInPercent
		);

		const thicknessBySliceIndexes = new Array<number>(publicConfig.slices.length).fill(0);
		publicConfig.slices.forEach((slice, sliceIndex) => {
			thicknessBySliceIndexes[sliceIndex] = DonutThicknessCalculator.getThickness(
				this.thicknessService.buildThicknessOptions(slice.canvas?.thickness ?? defaultThicknessOptions),
				this.config.blockSize,
				this.config.margin
			);
		});

		return publicConfig.slices.map<DonutChartSizesModel>((slice, sliceIndex) => {
			const outerSlices = thicknessBySliceIndexes.slice(sliceIndex + 1);
			const thicknessOfOuterSlices = outerSlices.reduce((acc, curr) => acc + curr, 0);

			const outerRadius =
				getDonutLikeOuterRadius(this.config.margin, this.config.blockSize) -
				thicknessOfOuterSlices -
				gapBetweenSlicesInPx * outerSlices.length;
			return {
				outerRadius,
				innerRadius: outerRadius - thicknessBySliceIndexes[sliceIndex],
				thickness: thicknessBySliceIndexes[sliceIndex],
				translate: getDonutLikeTranslate(this.config.margin, this.config.blockSize)
			};
		});
	}
}
