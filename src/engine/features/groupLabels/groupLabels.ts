import { Transition } from "d3-transition";
import {
	GroupingLabelKey,
	TwoDimGroupingItemLabelsModel,
	TwoDimGroupingItemModel,
	TwoDimGroupingModel
} from "../../../model/model";
import { Block } from "../../block/block";
import { Pipeline } from "../../helpers/pipeline/Pipeline";
import { BaseType, Selection } from "d3-selection";

interface GroupAxisLabelsOptions {
	elementAccessors: {
		getBlock: () => Block;
	};
}

export class GroupAxisLabels {
	private readonly renderPipeline = new Pipeline<
		Selection<SVGTextElement, GroupingLabelKey, SVGGElement, unknown>,
		{ item: TwoDimGroupingItemLabelsModel }
	>();

	private groupsForLabels: Selection<SVGGElement, unknown, BaseType, unknown>[] = [];

	constructor(private readonly options: GroupAxisLabelsOptions) {
		this.renderPipeline.push((groupLabels, { item }) => {
			return this.setAttrs(groupLabels.classed("group-label data-label", true), item);
		});
	}

	render(items: TwoDimGroupingItemLabelsModel[]) {
		items.forEach((item, index) => {
			const group = this.options.elementAccessors
				.getBlock()
				.getSvg()
				.append("g")
				.attr(`data-group-labels-index`, index);

			this.groupsForLabels.push(group);

			const labels = group
				.selectAll("text")
				.data(item.domain)
				.enter()
				.append("text")
				.text((d) => d);
			this.renderPipeline.execute(labels, { item });
		});
	}

	update(items: TwoDimGroupingItemLabelsModel[]) {
		items.forEach((item, index) => {
			const group = this.groupsForLabels[index];
			if (!group) return;

			const existedLabels = group
				.selectAll<SVGTextElement, GroupingLabelKey>("text")
				.data(item.domain)
				.text((d) => d);

			existedLabels.exit().remove();

			const newLabels = existedLabels
				.enter()
				.append("text")
				.text((d) => d);
			this.renderPipeline.execute(newLabels, { item });

			const animationName = "group-labels-updating";
			this.setAttrs(
				existedLabels
					.interrupt(animationName)
					.transition(animationName)
					.duration(this.options.elementAccessors.getBlock().transitionManager.durations.chartUpdate),
				item
			);
		});
	}

	private setAttrs<
		S extends
			| Selection<SVGTextElement, GroupingLabelKey, SVGGElement, unknown>
			| Transition<SVGTextElement, GroupingLabelKey, SVGGElement, unknown>
	>(groupLabels: S, item: TwoDimGroupingItemLabelsModel): S {
		return groupLabels
			.attr("x", (d) => item.coordinate.handleX(d))
			.attr("y", (d) => item.coordinate.handleY(d))
			.attr("text-anchor", item.textAnchor)
			.attr("dominant-baseline", item.dominantBaseline) as S;
	}
}
