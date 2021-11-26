import { Script } from './advanzia-assistant';

describe('Content Script', () => {
    it('should not do anything if not on transactions page', async () => {
        const eventsRaised: { [key: string]: boolean } = {
            noop: false,
            ready: false,
            done: false,
            error: false,
        };

        const setRaised = (eventName: string) => () => { eventsRaised[eventName] = true };

        await new Script()
            .on('noop', setRaised('noop'))
            .on('ready', () => setRaised('ready'))
            .on('done', () => setRaised('done'))
            .execute();

        expect(eventsRaised.noop).toBe(true);
        expect(eventsRaised.ready).toBe(false);
        expect(eventsRaised.done).toBe(false);
        expect(eventsRaised.error).toBe(false);
    });
});