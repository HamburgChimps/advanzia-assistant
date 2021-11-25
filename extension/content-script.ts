import { Script } from './advanzia-assistant';

const script = new Script({
    chrome,
    console,
    document,
    fetch: window.fetch.bind(window),
    location,
    MutationObserver,
    wasm: WebAssembly,
});

script
    .on('ready', () => script.execute())
    .on('done', () => console.log('done'))
    .on('error', (e) => console.log({ errors: script.errors, status: script.status }));
