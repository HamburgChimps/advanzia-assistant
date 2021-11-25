import { Script } from './advanzia-assistant';

const script = new Script({
    fetch: window.fetch.bind(window),
    location: window.location,
    chrome,
    wasm: WebAssembly,
    console
});

script
    .on('ready', () => script.execute())
    .on('done', () => console.log('done'))
    .on('error', (e) => console.log({ errors: script.errors, status: script.status }));
