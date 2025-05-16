import { ChartLegendMarkerModel } from "../../../model";

export const POLAR_LEGEND_MARKER: ChartLegendMarkerModel = {
	markerShape: "default",
	barViewOptions: {
		hatch: { on: false },
		borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
		width: 0
	},
	lineViewOptions: {
		dashedStyles: { on: false, dashSize: 0, gapSize: 0 },
		strokeWidth: 0,
		length: 0
	}
};
