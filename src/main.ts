import { Config, DataSource, Size } from "./config/config";
import { DesignerConfig } from "./designer/designerConfig";
import Engine from "./engine/engine";
import { FilterCallback } from "./engine/filterManager/filterEventManager";
import { Model } from "./model/model";
import { assembleModel, getPreparedData } from "./model/modelBuilder";

export class Chart {
    public static chartCounter = 0;

    private config: Config;
    private designerConfig: DesignerConfig;
    private model: Model;
    private data: DataSource;
    private parentElement: HTMLElement;
    private isResizable: boolean;

    private engine: Engine;

    private resizeHandler = this.resizeListener.bind(this);

    /**
     * @param config Объект конфигуратора
     * @param designerConfig Объект конфигуратора дизайнера
     * @param data Данные
     * @param selectedIds Id выделенных записей
     * @param isResizable Флаг подстройки размера блока графика под родительский элемент
     */
    constructor(config: Config, designerConfig: DesignerConfig, data: DataSource, isResizable: boolean = false, filterCallback: FilterCallback = null, selectedIds: number[] = []) {
        Chart.chartCounter++;
        this.config = config;
        this.designerConfig = designerConfig;
        this.data = data;
        this.isResizable = isResizable;

        this.model = assembleModel(this.config, this.data, this.designerConfig);
        this.engine = new Engine(Chart.chartCounter, filterCallback, selectedIds);
    }

    /**
     * Рендер графика
     * @param parentElement родительский элемент для графика 
     */
    public render(parentElement: HTMLElement): void {
        this.parentElement = parentElement;
        this.engine.render(this.model, getPreparedData(this.model, this.data, this.config), this.parentElement);

        if (this.isResizable)
            this.registerResizeEvent();
    }

    /**
     * Удаление графика со страницы
     */
    public destroy(): void {
        this.engine.destroy();

        if (this.isResizable)
            this.removeResizeEvent();
    }

    /**
     * Обновление графика для новых данных
     * @param data Новые данные
     */
    public updateData(data: DataSource): void {
        this.model = assembleModel(this.config, data, this.designerConfig);
        this.data = data;
        this.engine.updateData(this.model, getPreparedData(this.model, this.data, this.config));
    }

    /**
     * Изменение размера блока с графиком
     * @param newSize Новый размер
     */
    public updateSize(newSize: Size): void {
        if (newSize.height)
            this.config.canvas.size.height = newSize.height;
        if (newSize.width)
            this.config.canvas.size.width = newSize.width;

        this.model = assembleModel(this.config, this.data, this.designerConfig);
        this.engine.updateFullBlock(this.model, getPreparedData(this.model, this.data, this.config));
    }

    /**
     * Обновление цветов графиков на основе новых базовых цветов
     * @param newColors Новые базовые цвета
     */
    public updateColors(newColors: string[]): void {
        this.designerConfig.chartStyle.baseColors = [...newColors];
        this.model = assembleModel(this.config, this.data, this.designerConfig);
        this.engine.updateColors(this.model);
    }

    private registerResizeEvent(): void {
        window.addEventListener('resize', this.resizeHandler);
    }

    private removeResizeEvent(): void {
        window.removeEventListener('resize', this.resizeHandler);
    }

    private resizeListener(): void {
        this.updateSize({
            height: null,
            width: this.parentElement.offsetWidth
        });
    }
}

export * from "./config/config";
export * from "./designer/designerConfig";
export { FilterCallback } from "./engine/filterManager/filterEventManager";