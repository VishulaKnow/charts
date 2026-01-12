import { DesignerConfig } from "../../../designer/designerConfig";
import { MdtChartsSunburstOptions } from "../../../main";
import { SunburstOptionsModel } from "../../model";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { TitleConfigReader } from "../../modelInstance/titleConfigReader";
import { DonutAggregatorService } from "../polar/donut/donutAggregatorService";

export class SunburstModel {
	private static aggregatorService = new DonutAggregatorService();

	static getOptions(
		options: MdtChartsSunburstOptions,
		designerConfig: DesignerConfig,
		modelInstance: ModelInstance
	): SunburstOptionsModel {
		const titleConfig = TitleConfigReader.create(options.title, modelInstance);

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
			slices: []
		};
	}
}
