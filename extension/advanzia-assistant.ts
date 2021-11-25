export interface ContentScriptDeps {
    readonly console: typeof console;
    readonly fetch: typeof fetch;
    readonly wasm: typeof WebAssembly;
    readonly chrome: typeof chrome;
};

export interface ContentScript {
    init(): Promise<WebAssembly.WebAssemblyInstantiatedSource>;
    execute(): Promise<ContentScriptStatus>;
};

export enum ContentScriptStatus {
    Initializing,
    Ready,
    Done,
    Err
};

export class Script implements ContentScript {
    private deps: ContentScriptDeps;
    private memory: WebAssembly.Memory;
    private interface: WebAssembly.Exports | undefined;
    private addOne: Function;

    status: ContentScriptStatus;
    ready: Promise<boolean>;

    constructor(deps: ContentScriptDeps) {
        this.deps = deps;
        this.status = ContentScriptStatus.Initializing;
        this.memory = new this.deps.wasm.Memory({ initial: 10 });
        this.addOne = () => { };
        this.ready = this
            .init()
            .then(instantiatedWasm => {
                this.status = ContentScriptStatus.Ready;
                this.interface = instantiatedWasm.instance.exports;
                this.addOne = this.interface.add_one as Function;
                return true;
            })
            .catch(e => {
                this.status = ContentScriptStatus.Err;
                throw e;
            });
    }

    async init() {
        const wasmResponse = await this.deps.fetch(this.deps.chrome.runtime.getURL('advanzia-assistant.wasm'));

        return this.deps.wasm.instantiateStreaming(wasmResponse, { env: { memory: this.memory } });
    }

    async execute() {
        if (this.status !== ContentScriptStatus.Ready) {
            this.deps.console.error(`Script cannot be executed. Script needs to have ready status but status is ${this.status}`);
            return this.status;
        }

        await this.placeDummyElementAtTopOfPage();

        return this.status;
    }

    async placeDummyElementAtTopOfPage(): Promise<void> {
        return new Promise((resolve, reject) => {
            const i = setInterval(() => {
                const el = document.querySelector('.ad-card-body');
                if (!el) {
                    return;
                }

                clearInterval(i);

                const dummyDiv = document.createElement('div');
                dummyDiv.classList.add('card', 'ad-card-body');
                dummyDiv.innerHTML = `${this.addOne(1)}`;
                document.querySelector('.ad-account__container')?.prepend(dummyDiv);

                this.status = ContentScriptStatus.Ready;

                resolve();
            }, 100);
        });
    }
};
