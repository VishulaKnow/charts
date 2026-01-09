import { DesignerConfig } from "../../../designer/designerConfig";
import { PolarLikeLegendParamsBuilder } from "../../featuresModel/legendModel/polarLikeLegendParamsBuilder";
import { OtherCommonComponents } from "../../model";
import { SunburstConfigReader } from "../../modelInstance/configReader/sunburstConifgReader/sunburstConifgReader";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { extractLegendValues } from "../../notations/sunburst/sunburstLegendValuesExtractor";

export class SunburstMarginModel {
	private readonly polarLegendParamsBuilder = new PolarLikeLegendParamsBuilder();

	constructor(private readonly designerConfig: DesignerConfig, private configReader: SunburstConfigReader) {}

	recalcMargin(otherComponents: OtherCommonComponents, modelInstance: ModelInstance) {
		const fieldInLegendName = this.configReader.getFieldInLegend();
		const legendValues = extractLegendValues(modelInstance.dataModel.repository.getRawRows(), fieldInLegendName);
		this.polarLegendParamsBuilder.calculateParamsAndSetMargin(
			modelInstance,
			legendValues,
			otherComponents.legendBlock,
			this.designerConfig.canvas.legendBlock
		);
	}
}
