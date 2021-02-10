import { Config } from "./config/config";
import { DesignerConfig } from "./designer/designerConfig";
import Engine from "./engine/engine";
import { DataSource, Model } from "./model/model";
import { assembleModel, getPreparedData } from "./model/modelOptions";

export class Chart
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

        this.model = assembleModel(config, data, designerConfig);
        this.engine = new Engine();
    }

    public render(): void {
        this.engine.render(this.model, getPreparedData(this.model, this.data, this.config), '.main-wrapper');
    }
}