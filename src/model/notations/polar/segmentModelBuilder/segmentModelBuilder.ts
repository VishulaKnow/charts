import { MdtChartsDataRow, MdtChartsFieldName } from "../../../../config/config";
import { PolarSegmentModel } from "../../../model";

interface SegmentModelBuilderConfig {
	scopedDataRows: MdtChartsDataRow[];
	keyFieldName: MdtChartsFieldName;
	valueFieldName: MdtChartsFieldName;
	chartPaletteColors: string[];
	colorFieldName?: MdtChartsFieldName;
}

export class SegmentModelBuilder {
	constructor(private readonly config: SegmentModelBuilderConfig) {}

	build(): PolarSegmentModel[] {
		return this.config.scopedDataRows.map<PolarSegmentModel>((row, index) => {
			const paletteColor = this.config.chartPaletteColors[index % this.config.chartPaletteColors.length];
			let color = paletteColor;

			if (this.config.colorFieldName && row[this.config.colorFieldName]) color = row[this.config.colorFieldName];

			return {
				key: row[this.config.keyFieldName],
				value: row[this.config.valueFieldName],
				color,
				attachedDataRow: row
			};
		});
	}
}
