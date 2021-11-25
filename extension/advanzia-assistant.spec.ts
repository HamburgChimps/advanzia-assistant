import './advanzia-assistant';
import { Script } from './advanzia-assistant';

describe('#ContentScript', () => {
    it('should do something', async () => {
        await new Promise((resolve) => {
            new Script()
                .on('done', () => resolve(void 0))
                .execute();
        });
    });
});