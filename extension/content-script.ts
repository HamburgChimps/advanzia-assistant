import { Script } from './advanzia-assistant';

const script = new Script();

script
    .on('done', () => console.log('done'))
    .on('ready', () => console.log('ready'))
    .on('error', (e) => console.log({ errors: script.errors, status: script.status }))
    .execute();
