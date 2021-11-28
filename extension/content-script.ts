/* eslint-disable no-console */

import { Script } from './advanzia-assistant';

const script = new Script();

script
  .on('noop', () => console.log('noop'))
  .on('done', () => console.log('done'))
  .on('ready', () => console.log('ready'))
  .on('error', () => console.log({ errors: script.errors, status: script.status }))
  .execute();
