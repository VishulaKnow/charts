import { DesignerConfig } from "../../../designer/designerConfig";
import { MdtChartsSunburstOptions } from "../../../main";
import { ChartStyleModelService } from "../../chartStyleModel/chartStyleModel";
import { SunburstOptionsModel, SunburstSlice } from "../../model";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { TitleConfigReader } from "../../modelInstance/titleConfigReader";
import { DonutAggregatorService } from "../polar/donut/donutAggregatorService";
import { POLAR_LEGEND_MARKER } from "../polar/modelConstants/polarLegendMarker";
import { SliceModelBuilder } from "./sliceModelBuilder/sliceModelBuilder";

export class SunburstModel {
	private static aggregatorService = new DonutAggregatorService();

	static getOptions(
		options: MdtChartsSunburstOptions,
		designerConfig: DesignerConfig,
		modelInstance: ModelInstance
	): SunburstOptionsModel {
		const titleConfig = TitleConfigReader.create(options.title, modelInstance);

		//TODO: extract to function and remove duplicate with sliceModelBuilder
		const topSliceValues = modelInstance.dataModel.repository
			.getScopedRows()
			.map((record) => record[options.slices[0].data.keyField.name])
			.filter((value, index, self) => self.indexOf(value) === index);

		const chartStyle = ChartStyleModelService.getChartStyle(topSliceValues.length, designerConfig.chartStyle);

		const sliceModelBuilder = new SliceModelBuilder({
			margin: modelInstance.canvasModel.getMargin(),
			blockSize: modelInstance.canvasModel.getBlockSize(),
			scopedDataRows: modelInstance.dataModel.repository.getScopedRows(),
			topSliceColors: chartStyle.elementColors,
			formatter: designerConfig.dataFormat.formatters
		});

		return {
			legend: {
				position: modelInstance.canvasModel.legendCanvas.getPosition(),
				items: topSliceValues.map((value, index) => ({
					marker: POLAR_LEGEND_MARKER,
					markerColor: chartStyle.elementColors[index % chartStyle.elementColors.length],
					textContent: value
				}))
			},
			type: "sunburst",
			title: {
				textContent: titleConfig.getTextContent(),
				fontSize: titleConfig.getFontSize()
			},
			selectable: !!options.selectable,
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
			slices: sliceModelBuilder.build({
				data: options.data,
				slices: options.slices
			})
		};
	}
}
