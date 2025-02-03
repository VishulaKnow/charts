import { MdtChartsDataRow, MdtChartsDonutAggregator } from "../../config/config";
import { DonutAggregatorContent } from "../../model/model";
import {
	AggregatorServiceDataOptions,
	AGGREGATOR_DEFAULT_TITLE,
	DonutAggregatorService
} from "../../model/notations/polar/donut/donutAggregatorService";

describe("DonutAggregatorService", () => {
	const service = new DonutAggregatorService();

	describe("getContent", () => {
		const getDataOptions = (): AggregatorServiceDataOptions => {
			return {
				rows: [
					{ key: "key1", value: 20 },
					{ key: "key2", value: 22 }
				],
				valueFieldName: "value"
			};
		};

		test("should return values from function if it is set", () => {
			const options: MdtChartsDonutAggregator = {
				content: (model) => {
					return {
						title: "Sum",
						value: model.data.reduce((acc, row) => acc + row.value, 0) + 10
					};
				}
			};

			const res = service.getContent(options, getDataOptions());
			expect(res).toEqual<DonutAggregatorContent>({
				title: "Sum",
				value: 52 // 42 + 10
			});
		});

		test("should set default title if fn result does not have title", () => {
			const options: MdtChartsDonutAggregator = {
				content: (model) => {
					return {
						value: model.data.reduce((acc, row) => acc + row.value, 0)
					};
				}
			};

			const res = service.getContent(options, getDataOptions());
			expect(res).toEqual<DonutAggregatorContent>({
				title: AGGREGATOR_DEFAULT_TITLE,
				value: 42
			});
		});

		test("should return sum of values if result does not have value", () => {
			const options: MdtChartsDonutAggregator = {
				content: (model) => {
					return {
						title: undefined,
						value: undefined
					};
				}
			};

			const res = service.getContent(options, getDataOptions());
			expect(res).toEqual<DonutAggregatorContent>({
				title: AGGREGATOR_DEFAULT_TITLE,
				value: 42
			});
		});

		test("should return sum of values and default title if fn is not set", () => {
			let options: MdtChartsDonutAggregator = null;
			let res = service.getContent(options, getDataOptions());
			expect(res).toEqual<DonutAggregatorContent>({
				title: AGGREGATOR_DEFAULT_TITLE,
				value: 42
			});

			options = { content: null };
			res = service.getContent(options, getDataOptions());
			expect(res).toEqual<DonutAggregatorContent>({
				title: AGGREGATOR_DEFAULT_TITLE,
				value: 42
			});
		});

		test("should return sum of values and custom title if result does not have value but has title", () => {
			const options: MdtChartsDonutAggregator = {
				content: (model) => {
					return {
						title: "Custom title",
						value: undefined
					};
				}
			};

			const res = service.getContent(options, getDataOptions());
			expect(res).toEqual<DonutAggregatorContent>({
				title: "Custom title",
				value: 42
			});
		});

		test("should return default content if fn return falsy value", () => {
			const options: MdtChartsDonutAggregator = {
				content: (model) => null
			};

			const res = service.getContent(options, getDataOptions());
			expect(res).toEqual<DonutAggregatorContent>({
				title: AGGREGATOR_DEFAULT_TITLE,
				value: 42
			});
		});
	});
});
