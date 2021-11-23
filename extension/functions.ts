export const init = async () => {
    const wasmResponse = await fetch(chrome.runtime.getURL('advanzia-assistant.wasm'));
    const memory = new WebAssembly.Memory({ initial: 10 });
    const { instance } = await WebAssembly.instantiateStreaming(wasmResponse, { env: { memory } });
    console.log({ instance });
    return instance;
};
