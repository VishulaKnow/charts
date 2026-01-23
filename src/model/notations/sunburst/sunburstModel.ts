import { DesignerConfig } from "../../../designer/designerConfig";
import { MdtChartsSunburstOptions } from "../../../main";
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
		const sliceModelBuilder = new SliceModelBuilder({
			margin: modelInstance.canvasModel.getMargin(),
			blockSize: modelInstance.canvasModel.getBlockSize(),
			scopedDataRows: modelInstance.dataModel.repository.getScopedRows()
		});

		const valuesForLegend = modelInstance.dataModel.repository
			.getScopedRows()
			.map((record) => record[options.slices[0].data.keyField.name])
			.filter((value, index, self) => self.indexOf(value) === index);

		return {
			legend: {
				position: modelInstance.canvasModel.legendCanvas.getPosition(),
				items: valuesForLegend.map((value) => ({
					marker: POLAR_LEGEND_MARKER,
					markerColor: "rgb(32, 157, 227)",
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
						})
					}
				: undefined,
			slices: sliceModelBuilder.build({
				data: options.data,
				slices: options.slices
			})
		};
	}
}
