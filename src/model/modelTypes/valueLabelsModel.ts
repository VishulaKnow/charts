export interface PolarSegmentLabelDataItem {
	key: string | number;
	value: number;
	textContent: string;
	rotation: {
		type: "none" | "tangential";
	};
	cssClass?: string;
}

export type PolarLikeChartValueLabelsModel =
	| { on: false }
	| {
			on: true;
			items: PolarSegmentLabelDataItem[];
	  };
