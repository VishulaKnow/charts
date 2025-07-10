import { GroupingSplitLineAttributes } from "../../../model/model";
import { Block } from "../../block/block";
import { Selection } from "d3-selection";

interface GroupLinesOptions {
	elementAccessors: {
		getBlock: () => Block;
	};
}

export class GroupLines {
	private edgeLinesGroup: Selection<SVGGElement, unknown, HTMLElement, any>;
	private splitLinesGroups: Selection<SVGGElement, unknown, HTMLElement, any>[] = [];

	private readonly edgeLinesGroupCssClass = "group-edge-lines";
	private readonly splitLinesGroupCssClass = "group-split-lines";

	constructor(private readonly options: GroupLinesOptions) {}

	render(edgeLines: GroupingSplitLineAttributes[], splitLinesByItems: GroupingSplitLineAttributes[][]) {
		this.renderEdgeLines(edgeLines);
		this.renderSplitLines(splitLinesByItems);
	}

	update(edgeLines: GroupingSplitLineAttributes[]) {
		this.updateEdgeLines(edgeLines);
	}

	private renderEdgeLines(edgeLines: GroupingSplitLineAttributes[]) {
		const block = this.options.elementAccessors.getBlock();

		this.edgeLinesGroup = block.getSvg().append("g").classed(this.edgeLinesGroupCssClass, true);

		this.edgeLinesGroup
			.selectAll("line")
			.data(edgeLines)
			.enter()
			.append("line")
			.attr("x1", (d) => d.x1)
			.attr("y1", (d) => d.y1)
			.attr("x2", (d) => d.x2)
			.attr("y2", (d) => d.y2);
	}

	private renderSplitLines(splitLinesByItems: GroupingSplitLineAttributes[][]) {
		splitLinesByItems.forEach((splitLines) => {
			const group = this.options.elementAccessors
				.getBlock()
				.getSvg()
				.append("g")
				.classed(this.splitLinesGroupCssClass, true);
			this.splitLinesGroups.push(group);

			group
				.selectAll("line")
				.data(splitLines)
				.enter()
				.append("line")
				.attr("x1", (d) => d.x1)
				.attr("y1", (d) => d.y1)
				.attr("x2", (d) => d.x2)
				.attr("y2", (d) => d.y2);
		});
	}

	private updateEdgeLines(edgeLines: GroupingSplitLineAttributes[]) {
		const animationName = "group-lines-animation";
		this.edgeLinesGroup
			.selectAll("line")
			.data(edgeLines)
			.interrupt(animationName)
			.transition(animationName)
			.duration(this.options.elementAccessors.getBlock().transitionManager.durations.chartUpdate)
			.attr("x1", (d) => d.x1)
			.attr("y1", (d) => d.y1)
			.attr("x2", (d) => d.x2)
			.attr("y2", (d) => d.y2);
	}
}
