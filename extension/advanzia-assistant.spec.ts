import FetchMock from 'jest-fetch-mock';
import * as ChromeMock from 'jest-chrome';
import { ContentScript, Script } from './advanzia-assistant';

describe('Content Script', () => {
    const eventsRaised: { [key: string]: boolean } = {
        noop: false,
        ready: false,
        done: false,
        error: false,
    };

    const setRaised = (eventName: string) => () => { eventsRaised[eventName] = true };
    const resetRaised = (eventName: string) => { eventsRaised[eventName] = false };
    const resetAllRaised = () => Object.keys(eventsRaised).forEach(resetRaised);

    let script: ContentScript;

    beforeAll(FetchMock.enableMocks);
    beforeAll(() => Object.assign(global, ChromeMock));

    beforeEach(jest.restoreAllMocks);
    beforeEach(resetAllRaised);
    beforeEach(() => {
        script = new Script()
            .on('noop', setRaised('noop'))
            .on('ready', setRaised('ready'))
            .on('done', setRaised('done'))
    })

    it('should not do anything if executed outside of transactions page', async () => {
        await script.execute();


        expect(eventsRaised.noop).toBe(true);
        expect(eventsRaised.ready).toBe(false);
        expect(eventsRaised.done).toBe(false);
        expect(eventsRaised.error).toBe(false);
    });

    it('should indicate ready status if executed on transaction page', async () => {
        jest.spyOn(window, "location", "get").mockReturnValue({
            ...window.location,
            ...{ pathname: '/retail-app-de' },
        });

        await script.execute();

        expect(eventsRaised.noop).toBe(false);
        expect(eventsRaised.ready).toBe(true);
        expect(eventsRaised.done).toBe(false);
        expect(eventsRaised.error).toBe(false);
    });
});