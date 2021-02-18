import { Config } from "./config/config";
import { DesignerConfig } from "./designer/designerConfig";
import Engine from "./engine/engine";
import { DataSource, Model, Size } from "./model/model";
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

        this.model = assembleModel(this.config, this.data, this.designerConfig);
        this.engine = new Engine();
    }

    public render(parentElement: HTMLElement): void {
        this.engine.render(this.model, getPreparedData(this.model, this.data, this.config), parentElement);
    }

    public destroy(): void {
        this.engine.destroy();
    }

    public updateData(data: DataSource): void {
        this.model = assembleModel(this.config, data, this.designerConfig);
        this.data = data;
        this.engine.updateData(this.model, getPreparedData(this.model, this.data, this.config));
    }

    public updateSize(newSize: Size): void {
        if(newSize.height)
            this.config.canvas.size.height = newSize.height;
        if(newSize.width)
            this.config.canvas.size.width = newSize.width;

        this.model = assembleModel(this.config, this.data, this.designerConfig);
        this.engine.updateFullBlock(this.model, getPreparedData(this.model, this.data, this.config));
    }
}