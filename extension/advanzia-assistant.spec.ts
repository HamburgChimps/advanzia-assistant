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
    beforeEach(resetAllRaised);
    beforeEach(() => {
        script = new Script()
            .on('noop', setRaised('noop'))
            .on('ready', setRaised('ready'))
            .on('done', setRaised('done'))
    });
    beforeEach(jest.resetAllMocks);
    beforeEach(jest.restoreAllMocks);
    describe('when not on transactions page', () => {
        it('should not do anything', async () => {
            await script.execute();

            expect(chrome.runtime.getURL).toBeCalledTimes(0);
            expect(eventsRaised.noop).toBe(true);
            expect(eventsRaised.ready).toBe(false);
            expect(eventsRaised.done).toBe(false);
            expect(eventsRaised.error).toBe(false);
        });
    });

    describe('when on transactions page', () => {
        const simulateAdvanziaAppDoingStuff = () => setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'card';
            document.body.appendChild(div);
        }, 2000);

        beforeEach(() => {
            jest.spyOn(window, "location", "get").mockReturnValue({
                ...window.location,
                ...{ pathname: '/retail-app-de' },
            });
            global.fetch = async () => new Response(fs.readFileSync('../dist/advanzia-assistant.wasm'));
        });

        beforeEach(simulateAdvanziaAppDoingStuff);
        beforeEach(() => script.execute());
        it('should indicate ready status', async () => {
            expect(chrome.runtime.getURL).toBeCalledTimes(1);
            expect(eventsRaised.noop).toBe(false);
            expect(eventsRaised.ready).toBe(true);
            expect(eventsRaised.done).toBe(false);
            expect(eventsRaised.error).toBe(false);
        });

        it('to insert correct dom modifications', async () => {
            expect(document.body).toMatchSnapshot();
        });
    })
});