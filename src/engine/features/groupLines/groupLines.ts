import { GroupingSplitLineAttributes } from "../../../model/model";
import { Block } from "../../block/block";

interface GroupLinesOptions {
	elementAccessors: {
		getBlock: () => Block;
	};
}

export class GroupLines {
	constructor(private readonly options: GroupLinesOptions) {}

	render(edgeLines: GroupingSplitLineAttributes[]) {
		this.renderEdgeLines(edgeLines);
	}

	update(edgeLines: GroupingSplitLineAttributes[]) {
		this.updateEdgeLines(edgeLines);
	}

	private renderEdgeLines(edgeLines: GroupingSplitLineAttributes[]) {
		const block = this.options.elementAccessors.getBlock();

		const group = block.getSvg().append("g").attr("class", "group-lines");

		const lines = group.selectAll("line").data(edgeLines);
		lines
			.enter()
			.append("line")
			.attr("x1", (d) => d.x1)
			.attr("y1", (d) => d.y1)
			.attr("x2", (d) => d.x2)
			.attr("y2", (d) => d.y2);
	}

	private updateEdgeLines(edgeLines: GroupingSplitLineAttributes[]) {
		const block = this.options.elementAccessors.getBlock();
		const group = block.getSvg().select("g.group-lines");
		const lines = group.selectAll("line").data(edgeLines);

		const animationName = "group-lines-animation";
		lines
			.interrupt(animationName)
			.transition(animationName)
			.duration(block.transitionManager.durations.chartUpdate)
			.attr("x1", (d) => d.x1)
			.attr("y1", (d) => d.y1)
			.attr("x2", (d) => d.x2)
			.attr("y2", (d) => d.y2);
	}
}
