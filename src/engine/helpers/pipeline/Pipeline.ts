type Middleware<D, M> = (args: D, meta?: M) => D | undefined;

export class Pipeline<D = any, M = any> {
    private middlewaresStorage: PipelineMiddlewaresStorage<Middleware<D, M>>;

    constructor(middlewares?: Middleware<D, M>[]) {
        this.middlewaresStorage = new PipelineMiddlewaresStorage(middlewares);
    }

    push(middleware: Middleware<D, M>) {
        return this.middlewaresStorage.push(middleware);
    }

    remove(middleware: Middleware<D, M>) {
        this.middlewaresStorage.remove(middleware);
    }

    execute<CurrentArgs extends D = D>(args: CurrentArgs, meta?: M): CurrentArgs {
        const process = (args: CurrentArgs, middlewares: Middleware<D, M>[]): CurrentArgs => {
            const current = middlewares[0];
            if (!current) {
                return args;
            }
            const replaceArgs = current(args, meta) as CurrentArgs;
            return process(replaceArgs === undefined ? args : replaceArgs, middlewares.slice(1));
        };
        return process(args, this.middlewaresStorage.getList());
    }
}

class PipelineMiddlewaresStorage<M> {
    private middlewares: M[];

    constructor(middlewares?: M[]) {
        this.middlewares = middlewares || [];
    }

    push(middleware: M) {
        this.middlewares.push(middleware);
        return () => this.remove(middleware);
    }

    remove(middleware: M) {
        this.middlewares = this.middlewares.filter((cur) => cur != middleware);
    }

    getList() {
        return this.middlewares;
    }
}
