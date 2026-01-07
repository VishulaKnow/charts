import { DataOptions, MdtChartsConfig, MdtChartsDataSource } from "../../config/config";
import { DesignerConfig } from "../../designer/designerConfig";
import { CanvasModel } from "./canvasModel/canvasModel";
import { ChartBlockVersion } from "./chartBlockVersion/chartBlockVersion";
import { getConfigReader } from "./configReader/configReaderFactory";
import { DataModelInstance } from "./dataModel/dataModel";

export class ModelInstance {
	static create(
		config: MdtChartsConfig,
		data: MdtChartsDataSource,
		designerConfig: DesignerConfig,
		chartBlockVersion: number
	) {
		const modelInstance = new ModelInstance(chartBlockVersion);
		this.initInitialParams(modelInstance, config, data, designerConfig);
		return modelInstance;
	}

	private static initInitialParams(
		modelInstance: ModelInstance,
		config: MdtChartsConfig,
		data: MdtChartsDataSource,
		designerConfig: DesignerConfig
	) {
		const configReader = getConfigReader(config, designerConfig);

		modelInstance.canvasModel.initBlockSize(config.canvas.size);

		modelInstance.dataModel.repository.initOptions(
			config.options.data as DataOptions,
			configReader.getValueFields()
		);
		modelInstance.dataModel.repository.initRawFullSource(data);
	}

	canvasModel: CanvasModel;
	dataModel: DataModelInstance;
	version: ChartBlockVersion;

	constructor(chartVersionNumber: number) {
		this.canvasModel = new CanvasModel();
		this.dataModel = new DataModelInstance();
		this.version = new ChartBlockVersion(chartVersionNumber);
	}
}
