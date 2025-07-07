import { TwoDimGroupingModel } from "../../../model/model";
import { Block } from "../../block/block";

interface GroupAxisLabelsOptions {
	elementAccessors: {
		getBlock: () => Block;
	};
}

export class GroupAxisLabels {
	constructor(private readonly options: GroupAxisLabelsOptions) {}

	render(model: TwoDimGroupingModel) {
		if (!model.enabled) return;

		model.items.forEach((item, index) => {
			const block = this.options.elementAccessors.getBlock();
			const group = block.getSvg().append("g").attr("class", `group-labels-${index}`);

			group
				.selectAll("text")
				.data(item.domain)
				.enter()
				.append("text")
				.attr("class", "group-label")
				.text((d) => d)
				.attr("x", (d) => item.coordinate.handleX(d))
				.attr("y", (d) => item.coordinate.handleY(d))
				.attr("text-anchor", item.textAnchor)
				.classed("data-label", true);
		});
	}
}
