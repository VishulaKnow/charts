export interface EventEmitterSubscribeController<E> {
	subscribe: <T extends keyof E>(code: T, listener: (args: E[T]) => unknown) => () => void;
	unsubscribe: <T extends keyof E>(code: T, listener: (args: E[T]) => unknown) => void;
}

export class EventEmitter<E = Record<string, Record<string, any>>> {
	private events: {
		[key in keyof E]?: ((args: E[keyof E]) => void | Promise<void>)[];
	} = {};

	subscribe<T extends keyof E>(code: T, listener: (args: E[T]) => void) {
		if (!this.events[code]) this.events[code] = [];
		this.events[code].push(listener);
		return () => this.unsubscribe(code, listener);
	}

	unsubscribe<T extends keyof E>(code: T, listener: (args: E[T]) => void) {
		this.events[code] = this.events[code]?.filter((cur) => cur != listener);
	}

	emit<T extends keyof E>(code: T, args: E[T]) {
		(this.events[code] || []).forEach((callback) => {
			callback(args);
		});
	}

	getSubscribeController() {
		return {
			subscribe: <T extends keyof E>(code: T, listener: (args: E[T]) => void) => this.subscribe(code, listener),
			unsubscribe: <T extends keyof E>(code: T, listener: (args: E[T]) => void) =>
				this.unsubscribe(code, listener)
		};
	}
}
