import { BaseType, Selection, select } from "d3-selection";
import { MdtChartsDataSource, Size } from "../../../config/config";
import {
	LegendBlockModel,
	LegendItemModel,
	Model,
	Orient,
	PolarOptionsModel,
	TwoDimensionalOptionsModel
} from "../../../model/model";
import { Block } from "../../block/block";
import { ColorReader } from "../../colorReader/colorReader";
import { SelectionCondition } from "../../helpers/domSelectionHelper";
import { LegendDomHelper, LegendItemSelection } from "./legendDomHelper";
import { LegendEventsManager } from "./legendEventsManager";
import { LegendCoordinate, LegendHelper } from "./legendHelper";
import { LegendMarkerCreator } from "./legendMarkerCreator";

export interface LegendContentRenderingOptions {
	wrapperClasses: string[];
	shouldCropLabels: boolean;
	blockModel: LegendBlockModel;
	itemsOptions: {
		wrapperClasses: string[];
		markerClass: string;
		labelClass: string;
	};
}

export class Legend {
	public static get() {
		return new Legend();
	}

	public static readonly objectClass = "legend-object";
	public static readonly labelClass = "legend-label";
	public static readonly label2DClass = "legend-2d-label";
	public static readonly labelPolarClass = "legend-polar-label";
	public static readonly itemClass = "legend-item";
	public static readonly markerClass = "legend-marker";
	public static readonly markerCircle = "legend-circle";
	public static readonly legendBlockClass = "legend-block";

	private readonly markerCreator = new LegendMarkerCreator();

	public render(block: Block, options: TwoDimensionalOptionsModel | PolarOptionsModel, model: Model): void {
		if (options.legend.position !== "off") {
			const legendObject = this.renderObject(
				block,
				options.legend.position,
				model.otherComponents.legendBlock,
				model.blockCanvas.size
			);
			this.setContent(block, options, legendObject, model.otherComponents.legendBlock);
		}
	}

	public update(block: Block, model: Model<TwoDimensionalOptionsModel | PolarOptionsModel>): void {
		if (model.options.legend.position !== "off") {
			const legendObject = this.getObject(block);
			const legendCoordinate = LegendHelper.getLegendCoordinateByPosition(
				model.options.legend.position,
				model.otherComponents.legendBlock,
				model.blockCanvas.size
			);
			this.fillCoordinate(legendObject, legendCoordinate);
			this.removeContent(legendObject);
			this.setContent(block, model.options, legendObject, model.otherComponents.legendBlock);
		}
	}

	public updateColors(block: Block, options: TwoDimensionalOptionsModel | PolarOptionsModel): void {
		if (options.type === "polar" && ColorReader.isNeedReadFromData(options.charts[0])) return;

		const legendObject = this.getObject(block);
		const itemWrappers = legendObject.selectAll<HTMLDivElement, LegendItemModel>(`.${Legend.itemClass}`);

		const markerCreator = this.markerCreator;
		itemWrappers.each(function (d, i) {
			const selection = select<HTMLDivElement, LegendItemModel>(this);
			markerCreator.updateColorForItem(selection, { ...d.marker, color: options.legend.items[i].markerColor });
		});
	}

	public static getItemsByKeys(
		block: Block,
		keys: string[],
		condition: SelectionCondition = SelectionCondition.Include
	): Selection<HTMLDivElement, LegendItemModel, BaseType, unknown> {
		return block
			.getSvg()
			.selectAll<HTMLDivElement, LegendItemModel>(`.${this.itemClass}`)
			.filter((d) => {
				const index = keys.findIndex((k) => k === d.textContent);
				return condition === SelectionCondition.Include ? index !== -1 : index === -1;
			});
	}

	private setContent(
		block: Block,
		options: TwoDimensionalOptionsModel | PolarOptionsModel,
		legendObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>,
		legendBlockModel: LegendBlockModel
	): void {
		const renderingOptions = LegendHelper.getContentRenderingOptions(
			options.type,
			options.legend.position,
			legendBlockModel
		);

		const itemBlocks = this.renderContent(legendObject, options.legend.items, renderingOptions);
		if (options.type === "polar")
			LegendEventsManager.setListeners(block, options.data.keyField.name, itemBlocks, options.selectable);

		if (options.type === "2d") LegendDomHelper.setItemsTitles(itemBlocks);
	}

	private renderObject(
		block: Block,
		legendPosition: Orient,
		legendBlockModel: LegendBlockModel,
		blockSize: Size
	): Selection<SVGForeignObjectElement, unknown, HTMLElement, any> {
		const legendObject = block.getSvg().append("foreignObject").attr("class", Legend.objectClass);

		const legendCoordinate = LegendHelper.getLegendCoordinateByPosition(
			legendPosition,
			legendBlockModel,
			blockSize
		);
		this.fillCoordinate(legendObject, legendCoordinate);

		return legendObject;
	}

	private renderContent(
		foreignObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>,
		items: LegendItemModel[],
		options: LegendContentRenderingOptions
	): LegendItemSelection {
		const wrapper = foreignObject.append("xhtml:div");
		wrapper.classed(options.wrapperClasses.join(" "), true);

		const itemWrappers = wrapper.selectAll(`.${Legend.itemClass}`).data(items).enter().append("div");
		itemWrappers.classed(options.itemsOptions.wrapperClasses.join(" "), true);

		const markerCreator = this.markerCreator;
		itemWrappers.each(function (d, i) {
			const selection = select<HTMLDivElement, LegendItemModel>(this);
			const markers = markerCreator.create(selection, { ...d.marker, color: d.markerColor });
			markers.classed(options.itemsOptions.markerClass, true);
		});

		itemWrappers
			.append("span")
			.attr("class", options.itemsOptions.labelClass)
			.text((d) => d.textContent);

		if (options.shouldCropLabels)
			LegendDomHelper.decreaseRowLabels(foreignObject, itemWrappers, options.blockModel.static);

		return itemWrappers;
	}

	private getObject(block: Block): Selection<SVGForeignObjectElement, unknown, HTMLElement, any> {
		return block.getSvg().select<SVGForeignObjectElement>(`foreignObject.${Legend.objectClass}`);
	}

	private removeContent(legendObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>): void {
		legendObject.select(`.${Legend.legendBlockClass}`).remove();
	}

	private fillCoordinate(
		legendBlock: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>,
		coordinate: LegendCoordinate
	): void {
		legendBlock
			.attr("x", coordinate.x)
			.attr("y", coordinate.y)
			.attr("width", coordinate.width)
			.attr("height", coordinate.height);
	}
}
