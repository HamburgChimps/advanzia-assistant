import test from 'ava';

import { wiringTest } from './advanzia-assistant';

test('wiring works', t => {
    t.is(wiringTest(), 0);
});