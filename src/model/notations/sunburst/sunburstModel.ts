import { DesignerConfig } from "../../../designer/designerConfig";
import { MdtChartsSunburstOptions } from "../../../main";
import { SunburstOptionsModel, SunburstSlice } from "../../model";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { TitleConfigReader } from "../../modelInstance/titleConfigReader";
import { DonutAggregatorService } from "../polar/donut/donutAggregatorService";
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

		return {
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
