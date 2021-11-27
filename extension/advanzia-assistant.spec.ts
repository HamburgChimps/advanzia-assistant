import * as fs from 'fs';
import * as chromeMock from 'jest-chrome';
import { Response } from 'cross-fetch';
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

    beforeAll(() => Object.assign(global, chromeMock));
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
        global.fetch = async () => new Response(fs.readFileSync('../dist/advanzia-assistant.wasm'));

        const simulateAdvanziaAppDoingStuff = () => setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'card';
            document.body.appendChild(div);
        }, 2000);

        simulateAdvanziaAppDoingStuff();

        await script.execute();

        expect(chrome.runtime.getURL).toBeCalledTimes(1);
        expect(eventsRaised.noop).toBe(false);
        expect(eventsRaised.ready).toBe(true);
        expect(eventsRaised.done).toBe(false);
        expect(eventsRaised.error).toBe(false);
    });
});