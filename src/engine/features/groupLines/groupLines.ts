import { Transition } from "d3-transition";
import { GroupingLabelKey, GroupingSplitLineAttributes } from "../../../model/model";
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

	update(edgeLines: GroupingSplitLineAttributes[], splitLinesByItems: GroupingSplitLineAttributes[][]) {
		this.updateEdgeLines(edgeLines);
		this.updateSplitLines(splitLinesByItems);
	}

	private renderEdgeLines(edgeLines: GroupingSplitLineAttributes[]) {
		const block = this.options.elementAccessors.getBlock();

		this.edgeLinesGroup = block.getSvg().append("g").classed(this.edgeLinesGroupCssClass, true);

		const lines = this.edgeLinesGroup.selectAll("line").data(edgeLines).enter().append("line");

		this.setAttrs(lines);
	}

	private renderSplitLines(splitLinesByItems: GroupingSplitLineAttributes[][]) {
		splitLinesByItems.forEach((splitLines) => {
			const group = this.options.elementAccessors
				.getBlock()
				.getSvg()
				.append("g")
				.classed(this.splitLinesGroupCssClass, true);
			this.splitLinesGroups.push(group);

			const lines = group.selectAll("line").data(splitLines).enter().append("line");

			this.setAttrs(lines);
		});
	}

	private updateEdgeLines(edgeLines: GroupingSplitLineAttributes[]) {
		const animationName = "grouping-edge-lines-animation";
		const lines = this.edgeLinesGroup
			.selectAll<SVGLineElement, GroupingSplitLineAttributes>("line")
			.data(edgeLines)
			.interrupt(animationName)
			.transition(animationName)
			.duration(this.options.elementAccessors.getBlock().transitionManager.durations.chartUpdate);

		this.setAttrs(lines);
	}

	private updateSplitLines(splitLinesByItems: GroupingSplitLineAttributes[][]) {
		splitLinesByItems.forEach((splitLines, index) => {
			const existedLines = this.splitLinesGroups[index]
				.selectAll<SVGLineElement, GroupingSplitLineAttributes>("line")
				.data(splitLines);

			existedLines.exit().remove();

			const newLines = existedLines.enter().append("line");
			this.setAttrs(newLines);

			const animationName = "grouping-split-lines-animation";
			this.setAttrs(
				existedLines
					.interrupt(animationName)
					.transition(animationName)
					.duration(this.options.elementAccessors.getBlock().transitionManager.durations.chartUpdate)
			);
		});
	}

	private setAttrs<
		S extends
			| Selection<SVGLineElement, GroupingSplitLineAttributes, SVGGElement, unknown>
			| Transition<SVGLineElement, GroupingSplitLineAttributes, SVGGElement, unknown>
	>(lines: S): S {
		//TODO: make though render and update pipeline
		return lines
			.attr("x1", (d) => d.x1)
			.attr("y1", (d) => d.y1)
			.attr("x2", (d) => d.x2)
			.attr("y2", (d) => d.y2) as S;
	}
}
