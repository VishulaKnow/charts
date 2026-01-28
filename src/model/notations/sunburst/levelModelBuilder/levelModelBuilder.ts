import { DonutChartSizesModel, SunburstLevel, SunburstLevelSegment } from "../../../model";
import { BlockMargin } from "../../../model";
import { MdtChartsDataRow, MdtChartsSunburstOptions, Size } from "../../../../config/config";
import { DonutThicknessCalculator, DonutThicknessService } from "../../polar/donut/donutThicknessService";
import { getDonutLikeOuterRadius, getDonutLikeTranslate } from "../../polar/donut/donutLikeSizesCalculator";
import { Formatter, MdtChartsDonutThicknessOptions } from "../../../../designer/designerConfig";

interface LevelModelBuilderConfig {
	margin: BlockMargin;
	blockSize: Size;
	scopedDataRows: MdtChartsDataRow[];
	topLevelColors: string[];
	formatter: Formatter;
}

export class LevelModelBuilder {
	private thicknessService = new DonutThicknessService();

	constructor(private readonly config: LevelModelBuilderConfig) {}

	build(publicConfig: Pick<MdtChartsSunburstOptions, "levels" | "data">): SunburstLevel[] {
		const sizesByLevels = this.getLevelSizes(publicConfig);

		const topLevelKeyFieldName = publicConfig.levels[0].data.keyField.name;
		//TODO: extract to function and remove duplicate with sunburstModel
		const topLevelValues = this.config.scopedDataRows
			.map((record) => record[topLevelKeyFieldName])
			.filter((value, index, self) => self.indexOf(value) === index);
		const topLevelColorsByValue = topLevelValues.reduce<Record<string, string>>((acc, value, index) => {
			acc[value] = this.config.topLevelColors[index % this.config.topLevelColors.length];
			return acc;
		}, {});

		return publicConfig.levels.map<SunburstLevel>((level, levelIndex) => {
			const valuesForLevelKeys: Map<string, { value: number; color: string }> = new Map();

			this.config.scopedDataRows.forEach((row) => {
				const key = row[level.data.keyField.name];
				const color = topLevelColorsByValue[row[topLevelKeyFieldName]];
				if (key != null) {
					const newValue = (valuesForLevelKeys.get(key)?.value ?? 0) + row[publicConfig.data.valueField.name];
					valuesForLevelKeys.set(key, { value: newValue, color });
				}
			});

			return {
				sizes: sizesByLevels[levelIndex],
				segments: Array.from(valuesForLevelKeys.entries()).map<SunburstLevelSegment>(
					([key, { value, color }]) => {
						return {
							value,
							key,
							levelIndex,
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

	private getLevelSizes(publicConfig: Pick<MdtChartsSunburstOptions, "levels">): DonutChartSizesModel[] {
		const gapBetweenLevelsInPercent = 1;

		const defaultThicknessInPercent = Math.min(
			25,
			Math.floor((50 - gapBetweenLevelsInPercent * (publicConfig.levels.length - 1)) / publicConfig.levels.length)
		);
		const defaultThicknessOptions: MdtChartsDonutThicknessOptions = {
			min: `${defaultThicknessInPercent}%`,
			max: `${defaultThicknessInPercent}%`,
			value: `${defaultThicknessInPercent}%`
		};

		const gapBetweenLevelsInPx = DonutThicknessCalculator.calcPercentValue(
			DonutThicknessCalculator.getChartBlockSize(this.config.blockSize, this.config.margin),
			gapBetweenLevelsInPercent
		);

		const thicknessByLevelIndexes = new Array<number>(publicConfig.levels.length).fill(0);
		publicConfig.levels.forEach((level, levelIndex) => {
			thicknessByLevelIndexes[levelIndex] = DonutThicknessCalculator.getThickness(
				this.thicknessService.buildThicknessOptions(level.canvas?.thickness ?? defaultThicknessOptions),
				this.config.blockSize,
				this.config.margin
			);
		});

		return publicConfig.levels.map<DonutChartSizesModel>((level, levelIndex) => {
			const outerLevels = thicknessByLevelIndexes.slice(levelIndex + 1);
			const thicknessOfOuterLevels = outerLevels.reduce((acc, curr) => acc + curr, 0);

			const outerRadius =
				getDonutLikeOuterRadius(this.config.margin, this.config.blockSize) -
				thicknessOfOuterLevels -
				gapBetweenLevelsInPx * outerLevels.length;
			return {
				outerRadius,
				innerRadius: outerRadius - thicknessByLevelIndexes[levelIndex],
				thickness: thicknessByLevelIndexes[levelIndex],
				translate: getDonutLikeTranslate(this.config.margin, this.config.blockSize)
			};
		});
	}
}
