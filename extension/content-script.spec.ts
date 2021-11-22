import test from 'ava';

import { wiringTest } from './content-script';

test('wiring works', t => {
    t.is(wiringTest(), 0);
});