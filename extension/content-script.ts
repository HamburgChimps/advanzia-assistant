import { init } from './advanzia-assistant';

init({
    fetch: window.fetch.bind(window),
    wasm: WebAssembly,
    chrome
});
