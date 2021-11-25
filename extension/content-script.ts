import { Script } from './advanzia-assistant';

const script = new Script({
    fetch: window.fetch.bind(window),
    chrome,
    wasm: WebAssembly,
    console
});

script
    .ready
    .then(() => script.execute())
    .catch((e) => console.log({ error: e, status: script.status }));
