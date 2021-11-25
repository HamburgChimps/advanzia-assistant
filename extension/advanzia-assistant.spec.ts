import './advanzia-assistant';
import { Script } from './advanzia-assistant';

describe('Content Script', () => {
    it('should not do anything if not on transactions page', async () => {
        await new Promise((resolve) => {
            new Script()
                .on('noop', () => resolve(void 0))
                .execute();
        });
    });
});