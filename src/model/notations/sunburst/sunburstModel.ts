import { DesignerConfig } from "../../../designer/designerConfig";
import { MdtChartsSunburstOptions } from "../../../main";
import { ChartStyleModelService } from "../../chartStyleModel/chartStyleModel";
import { LegendItemModel, SunburstOptionsModel, SunburstLevel } from "../../model";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { TitleConfigReader } from "../../modelInstance/titleConfigReader";
import { DonutAggregatorService } from "../polar/donut/donutAggregatorService";
import { POLAR_LEGEND_MARKER } from "../polar/modelConstants/polarLegendMarker";
import { LevelModelBuilder } from "./levelModelBuilder/levelModelBuilder";

export class SunburstModel {
	private static aggregatorService = new DonutAggregatorService();

	static getOptions(
		options: MdtChartsSunburstOptions,
		designerConfig: DesignerConfig,
		modelInstance: ModelInstance
	): SunburstOptionsModel {
		const titleConfig = TitleConfigReader.create(options.title, modelInstance);

		//TODO: extract to function and remove duplicate with levelModelBuilder
		const topLevelValues = modelInstance.dataModel.repository
			.getScopedRows()
			.map((record) => record[options.levels[0].data.keyField.name])
			.filter((value, index, self) => self.indexOf(value) === index);

		const chartStyle = ChartStyleModelService.getChartStyle(topLevelValues.length, designerConfig.chartStyle);

		const levelModelBuilder = new LevelModelBuilder({
			margin: modelInstance.canvasModel.getMargin(),
			blockSize: modelInstance.canvasModel.getBlockSize(),
			scopedDataRows: modelInstance.dataModel.repository.getScopedRows(),
			topLevelColors: chartStyle.elementColors,
			formatter: designerConfig.dataFormat.formatters
		});

		const levels = levelModelBuilder.build({
			data: options.data,
			levels: options.levels
		});

		return {
			type: "sunburst",
			title: {
				textContent: titleConfig.getTextContent(),
				fontSize: titleConfig.getFontSize()
			},
			selectable: !!options.selectable,
			legend: {
				position: modelInstance.canvasModel.legendCanvas.getPosition(),
				items: levels[0].segments.map<LegendItemModel>((segment, index) => ({
					marker: POLAR_LEGEND_MARKER,
					markerColor: segment.color,
					textContent: segment.key.toString(),
					tooltip: {
						content: segment.tooltip.content
					}
				}))
			},
			aggregator: options.aggregator
				? {
						margin: designerConfig.canvas.chartOptions.donut.aggregatorPad,
						content: this.aggregatorService.getContent(options.aggregator, {
							rows: modelInstance.dataModel.repository.getRawRows(),
							valueFieldName: options.data.valueField.name
						}),
						valueFormat: options.data.valueField.format
					}
				: undefined,
			levels
		};
	}
}
