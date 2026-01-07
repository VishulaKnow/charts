import { MdtChartsConfig } from "../../../config/config";
import { DesignerConfig } from "../../../designer/designerConfig";
import { BaseConfigReader } from "./baseConfigReader";
import { PolarConfigReader } from "./polarConfigReader/polarConfigReader";
import { SunburstConfigReader } from "./sunburstConifgReader/sunburstConifgReader";
import { TwoDimConfigReader } from "./twoDimConfigReader/twoDimConfigReader";

export function getConfigReader(config: MdtChartsConfig, designerConfig: DesignerConfig): BaseConfigReader {
	if (config.options.type === "2d") return new TwoDimConfigReader(config, designerConfig);
	if (config.options.type === "polar") return new PolarConfigReader(config, designerConfig);
	if (config.options.type === "sunburst") return new SunburstConfigReader(config, designerConfig);
	throw new Error(`Config reader for type "${(config.options as any).type}" not exists`);
}
