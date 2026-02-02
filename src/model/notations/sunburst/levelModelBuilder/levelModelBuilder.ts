import { DonutChartSizesModel, SunburstLevel, SunburstLevelSegment } from "../../../model";
import { BlockMargin } from "../../../model";
import { MdtChartsDataRow, MdtChartsSunburstOptions, Size, TooltipTypedRowContent } from "../../../../config/config";
import { DonutThicknessCalculator, DonutThicknessService } from "../../polar/donut/donutThicknessService";
import { getDonutLikeOuterRadius, getDonutLikeTranslate } from "../../polar/donut/donutLikeSizesCalculator";
import { Formatter, MdtChartsDonutThicknessOptions } from "../../../../designer/designerConfig";
import {
	TOOLTIP_HEAD_WRAPPER_CSS_CLASSNAME,
	tooltipPublicRowToModel
} from "../../../featuresModel/tooltipModel/tooltipContentModel";

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
		const topLevelColorFieldName = publicConfig.levels[0].data.colorField?.name;

		const topLevelKeys = this.config.scopedDataRows
			.map((record) => ({
				key: record[topLevelKeyFieldName],
				color: topLevelColorFieldName ? record[topLevelColorFieldName] : undefined
			}))
			.filter((values, index, self) => self.findIndex((v) => v.key === values.key) === index);
		const topLevelColorsByKey = topLevelKeys.reduce<Record<string, string>>((acc, value, index) => {
			acc[value.key] = value.color ?? this.config.topLevelColors[index % this.config.topLevelColors.length];
			return acc;
		}, {});

		return publicConfig.levels.map<SunburstLevel>((level, levelIndex) => {
			const valuesForLevelKeys: Map<
				string,
				{
					value: number;
					color: string;
					parentLevelKey: string | number | undefined;
					attachedDataRows: MdtChartsDataRow[];
				}
			> = new Map();

			this.config.scopedDataRows.forEach((row) => {
				const key = row[level.data.keyField.name];

				if (key == null) return;

				const color = topLevelColorsByKey[row[topLevelKeyFieldName]];
				let parentLevelKey: string | number | undefined = undefined;
				if (levelIndex > 0) {
					parentLevelKey = row[publicConfig.levels[levelIndex - 1].data.keyField.name];
				}

				const newValue = (valuesForLevelKeys.get(key)?.value ?? 0) + row[publicConfig.data.valueField.name];
				const attachedDataRows = valuesForLevelKeys.get(key)?.attachedDataRows ?? [];
				attachedDataRows.push(row);

				valuesForLevelKeys.set(key, { value: newValue, color, parentLevelKey, attachedDataRows });
			});

			return {
				sizes: sizesByLevels[levelIndex],
				segments: Array.from(valuesForLevelKeys.entries()).map<SunburstLevelSegment>(
					([key, { value, color, parentLevelKey, attachedDataRows }]) => {
						let tooltipContentRows: TooltipTypedRowContent[] = [
							{
								type: "plainText",
								textContent: key,
								wrapperElOptions: { cssClassName: TOOLTIP_HEAD_WRAPPER_CSS_CLASSNAME }
							},
							{
								type: "captionValue",
								marker: {
									shape: "circle",
									color
								},
								caption: publicConfig.data.valueField.title,
								value: this.config.formatter(value, {
									type: publicConfig.data.valueField.format
								})
							}
						];

						if (level.tooltip?.overrideContent) {
							tooltipContentRows = level.tooltip.overrideContent({
								autoTooltipRows: tooltipContentRows,
								attachedDataRows
							}).rows;
						}

						return {
							value,
							key,
							levelIndex,
							parentLevelKey,
							attachedDataRows,
							color,
							tooltip: {
								content: {
									type: "rows",
									rows: tooltipPublicRowToModel(tooltipContentRows)
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
