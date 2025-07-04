import { TwoDimGroupingModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Scale } from "../scale/scale";

interface GroupAxisLabelsOptions {
	elementAccessors: {
		getBlock: () => Block;
	};
}

export class GroupAxisLabels {
	constructor(private readonly options: GroupAxisLabelsOptions) {}

	render(model: TwoDimGroupingModel) {
		console.log(model);
		if (!model.enabled) return;

		model.items.forEach((item, index) => {
			const block = this.options.elementAccessors.getBlock();
			const group = block.getSvg().append("g").attr("class", `group-labels-${index}`);
			const scale = Scale.getScaleBandNew(item.scale);

			group
				.selectAll("text")
				.data(item.scale.domain)
				.enter()
				.append("text")
				.attr("class", "group-label")
				.text((d) => d)
				.attr("x", (d) => item.coordinate.handleCoordinate({ x: scale(d), y: 0 }).x)
				.attr("y", (d) => item.coordinate.handleCoordinate({ x: 0, y: 0 }).y)
				.classed("data-label", true);
		});
	}
}
