import { Block } from "./block/block";
import { ValueFormatter } from "./valueFormatter";
import { ContentManager } from "./contentManager/contentManager";
import { Model, OptionsModel } from "../model/model";
import { ChartClearSelectionOptions, FilterCallback, FilterEventManager } from "./filterManager/filterEventManager";
import { Helper } from "./helpers/helper";
import { MdtChartsDataSource } from "../config/config";

export class Engine {
	public block: Block;
	public data: MdtChartsDataSource;

	private filterEventManager: FilterEventManager;
	private chartId: number;
	private contentManager: ContentManager;

	constructor(id: number, private filterCallback: FilterCallback, private initializeSelected: number[]) {
		this.chartId = id;
	}

	public render(model: Model, data: MdtChartsDataSource, parentElement: HTMLElement): void {
		this.data = data;
		this.setFilterEventManager(model?.options);
		this.block = new Block(
			model.blockCanvas.cssClass,
			parentElement,
			this.chartId,
			this.filterEventManager,
			model.transitions
		);
		this.filterEventManager?.setBlock(this.block);
		this.block.renderWrapper(model.blockCanvas.size);

		if (model.options) {
			this.contentManager = new ContentManager(model);
			ValueFormatter.setFormatFunction(model.dataSettings.format.formatters);
			this.renderCharts(model);
		}
	}

	public updateFullBlock(model: Model, data: MdtChartsDataSource): void {
		this.destroy();
		this.render(model, data, this.block.parentElement);
	}

	public destroy(): void {
		this.block.destroy();
	}

	public updateData(model: Model, newData: MdtChartsDataSource): void {
		if (!newData) {
			this.data = newData;
			this.block.clearWrapper();
		} else {
			if (!this.data) {
				this.data = newData;
				this.updateFullBlock(model, this.data);
			} else if (!Helper.compareData(this.data, newData, model.options.data.dataSource)) {
				for (let source in newData) {
					this.data[source] = newData[source];
				}
				this.contentManager.updateData(this.block, model, newData);
			}
		}
	}

	public clearSelection(model: Model, options?: ChartClearSelectionOptions): void {
		this.contentManager.clearSelection(this, model, options);
	}

	public updateColors(model: Model): void {
		this.contentManager.updateColors(this, model);
	}

	private renderCharts(model: Model): void {
		this.contentManager.render(model, this);
	}

	private setFilterEventManager(options: OptionsModel): void {
		let highlightIds: number[] = [];
		if (this.initializeSelected instanceof Array && this.initializeSelected.length > 0)
			highlightIds = [...this.initializeSelected];
		if (options?.data?.dataSource)
			this.filterEventManager = new FilterEventManager(
				this.filterCallback,
				this.data[options.data.dataSource],
				options.selectable,
				options.data.keyField.name,
				highlightIds
			);
		else
			this.filterEventManager = new FilterEventManager(
				this.filterCallback,
				[],
				options?.selectable,
				options?.data?.keyField?.name,
				highlightIds
			);
	}
}
