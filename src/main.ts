import { Config } from "./config/config";
import { DesignerConfig } from "./designer/designerConfig";
import Engine from "./engine/engine";
import { DataSource, Model } from "./model/model";
import { assembleModel, getPreparedData } from "./model/modelOptions";

module.exports =  class Chart
{
    private config: Config;
    private designerConfig: DesignerConfig;
    private model: Model;
    private data: DataSource;

    private engine: Engine;

    constructor(config: Config, designerConfig: DesignerConfig, data: DataSource) {
        this.config = config;
        this.designerConfig = designerConfig;
        this.data = data;

        this.model = assembleModel(this.config, this.data, this.designerConfig);
        this.engine = new Engine();
    }

    public render(parentElement: HTMLElement): void {
        this.engine.render(this.model, getPreparedData(this.model, this.data, this.config), parentElement);
    }
}