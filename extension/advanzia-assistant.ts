export interface ContentScriptDeps {
    readonly chrome: typeof chrome;
    readonly console: typeof console;
    readonly document: Document,
    readonly fetch: typeof fetch;
    readonly location: typeof window.location;
    readonly MutationObserver: typeof MutationObserver;
    readonly wasm: typeof WebAssembly;
};

export interface ContentScript {
    init(): void;
    execute(): void;
};


export enum ContentScriptStatus {
    Initializing = "Initializing",
    Ready = "Ready",
    Done = "Done",
    Err = "Error"
};

export interface WasmExports extends WebAssembly.Exports {
    add_one: (num: number) => number,
};

export interface ContentScriptEvents {
    readonly instantiateWasm: Event;
    readonly ready: Event;
    readonly done: Event;
    readonly error: ErrorEvent;
}


export class Script extends EventTarget implements ContentScript, EventListenerObject {
    private deps: ContentScriptDeps;
    private memory: WebAssembly.Memory;
    private wasmExports?: WasmExports;

    private events: ContentScriptEvents;

    status: ContentScriptStatus;

    errors: Error[];

    constructor(deps: ContentScriptDeps) {
        super();
        this.deps = deps;
        this.status = ContentScriptStatus.Initializing;
        this.memory = new this.deps.wasm.Memory({ initial: 10 });
        this.events = {
            instantiateWasm: new Event('instantiatedWasm'),
            ready: new Event('ready'),
            done: new Event('done'),
            error: new ErrorEvent('error')
        };

        this.errors = [];

        this.registerEventListeners();

        if (this.deps.location.pathname.indexOf('retail-app') === -1) {
            this.dispatchEvent(this.events.done);
            return;
        }

        this.dispatchEvent(this.events.instantiateWasm);
    }

    private registerEventListeners() {
        Object.values(this.events).forEach(e => this.registerEventListener(e.type));
    }

    private registerEventListener(name: string) {
        this.addEventListener(name, this);
    }

    handleEvent(e: Event | ErrorEvent) {
        switch (e.type) {
            case this.events.instantiateWasm.type:
                this.init();
                break;
            case this.events.ready.type:
                this.status = ContentScriptStatus.Ready;
                break;
            case this.events.done.type:
                this.status = ContentScriptStatus.Done;
                break;
            case this.events.error.type:
                this.status = ContentScriptStatus.Err;
                break;
        }
    }

    on(eventName: string, handler: EventListenerOrEventListenerObject) {
        this.addEventListener(eventName, handler);
        return this;
    }

    async init() {
        const wasmResponse = await this.deps.fetch(this.deps.chrome.runtime.getURL('advanzia-assistant.wasm'));
        const wasm = await this.deps.wasm.instantiateStreaming(wasmResponse, { env: { memory: this.memory } });
        this.wasmExports = wasm.instance.exports as WasmExports;

        await this.pageReasonablyLoaded();

        this.dispatchEvent(this.events.ready);
    }

    async execute() {
        if (this.status !== ContentScriptStatus.Ready) {
            this.error(new Error(`Script cannot be executed. Script needs to have ready status but status is ${this.status}`));
        }

        this.dispatchEvent(this.events.done);
    }

    private error(e: Error) {
        this.errors.push(e);
        this.dispatchEvent(this.events.error);
    }

    private pageReasonablyLoaded(): Promise<void> {
        const signalSelector = '.card';
        return new Promise((resolve) => {
            const el = this.deps.document.querySelector(signalSelector);
            if (el) {
                resolve();
                return;
            }
            new this.deps.MutationObserver((_mutationsList, observer) => {
                if (this.deps.document.querySelector(signalSelector)) {
                    resolve();
                    observer.disconnect();
                }
            })
                .observe(this.deps.document.documentElement, {
                    childList: true,
                    subtree: true
                });
        });
    }
};
