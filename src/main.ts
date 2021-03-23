import { Config, ValueField, AdditionalElements, Size, TwoDimensionalChartData, PolarChartData, Legend, DataOptions, AxisOptions, TwoDimensionalOptions, TwoDimensionalChartType, TwoDimensionalChart, TwoDimensionalAxis, PolarOptions, PolarChartType, PolarChart, NumberDomain, IntervalOptions, IntervalChartType, IntervalChart, IntervalAxis, EmbeddedLabelType, ChartType, ChartOrientation, ChartNotation, ChartBlockCanvas, AxisPosition } from "./config/config";
import { DesignerConfig, Formatter, DonutOptionsCanvas, DataTypeOptions, DataType, ChartStyleConfig, BarOptionsCanvas, AxisLabelCanvas } from "./designer/designerConfig";
import Engine from "./engine/engine";
import { FilterCallback } from "./engine/filterManager/filterEventManager";
import { DataRow, DataSource, Model } from "./model/model";
import { assembleModel, getPreparedData } from "./model/modelBuilder";

class Chart {
    public static chartCounter = 0;

    private config: Config;
    private designerConfig: DesignerConfig;
    private model: Model;
    private data: DataSource;
    private parentElement: HTMLElement;
    private isResizable: boolean;

    private resizeHandler = this.resizeListener.bind(this);

    private engine: Engine;

    /**
     * @param config Объект конфигуратора
     * @param designerConfig Объект конфигуратора дизайнера
     * @param data Данные
     * @param selectedIds Id выделенных записей
     * @param isResizable Флаг подстройки размера блока графика под родительский элемент
     */
    constructor(config: Config, designerConfig: DesignerConfig, data: DataSource, filterCallback: FilterCallback, selectedIds: number[] = [], isResizable: boolean = false) {
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

export {
    Chart,
    Engine,
    Config,
    DataSource,
    DataRow,
    Size,
    Legend,
    FilterCallback,
    DataOptions,
    AdditionalElements,
    TwoDimensionalChartData,
    TwoDimensionalOptions,
    TwoDimensionalChartType,
    TwoDimensionalChart,
    TwoDimensionalAxis,
    ValueField,
    PolarOptions,
    PolarChartData,
    PolarChartType,
    PolarChart,
    NumberDomain,
    IntervalOptions,
    IntervalChartType,
    IntervalChart,
    IntervalAxis,
    EmbeddedLabelType,
    ChartType,
    ChartOrientation,
    ChartNotation,
    ChartBlockCanvas,
    AxisPosition,
    DesignerConfig,
    Formatter,
    DonutOptionsCanvas,
    DataTypeOptions,
    DataType,
    ChartStyleConfig,
    BarOptionsCanvas,
    AxisOptions,
    AxisLabelCanvas
}