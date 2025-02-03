import { Pipeline } from "./Pipeline";

describe("PipelineSync", () => {
	test("middleware should modify result", () => {
		const pipeline = new Pipeline<number>();
		const middleware = (data: number) => ++data;

		pipeline.push(middleware);
		const res = pipeline.execute(1);

		expect(res).toBe(2);
	});

	test("args shouldn't modify if middleware return undefined", () => {
		const pipeline = new Pipeline<number>();
		const middleware = (data: number) => undefined as undefined;

		pipeline.push(middleware);
		const res = pipeline.execute(1);

		expect(res).toBe(1);
	});
});
