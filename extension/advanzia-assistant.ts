export interface Deps {
    readonly fetch: typeof fetch;
    readonly wasm: typeof WebAssembly;
    readonly chrome: typeof chrome;
};

export const init = async (deps: Deps) => {
    const wasmResponse = await deps.fetch(deps.chrome.runtime.getURL('advanzia-assistant.wasm'));
    const memory = new deps.wasm.Memory({ initial: 10 });
    const { instance } = await deps.wasm.instantiateStreaming(wasmResponse, { env: { memory } });
    console.log({ instance });
    return instance;
};
