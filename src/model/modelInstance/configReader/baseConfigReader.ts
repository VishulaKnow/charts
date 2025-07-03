import { MdtChartsConfig, MdtChartsField } from "../../../config/config";
import { DesignerConfig } from "../../../designer/designerConfig";
import { PolarConfigReader } from "./polarConfigReader/polarConfigReader";
import { TwoDimConfigReader } from "./twoDimConfigReader.ts/twoDimConfigReader";

export interface BaseConfigReader {
	getValueFields(): MdtChartsField[];
}

export function getConfigReader(config: MdtChartsConfig, designerConfig: DesignerConfig): BaseConfigReader {
	if (config.options.type === "2d") return new TwoDimConfigReader(config, designerConfig);
	if (config.options.type === "polar") return new PolarConfigReader(config);
	throw new Error(`Config reader for type "${(config.options as any).type}" not exists`);
}
