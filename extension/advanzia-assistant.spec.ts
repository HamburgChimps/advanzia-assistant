import * as fs from 'fs';
import * as chromeMock from 'jest-chrome';
import { Response } from 'cross-fetch';
import { Script } from './advanzia-assistant';

describe('Content Script', () => {
  const eventsRaised: { [key: string]: boolean } = {
    noop: false,
    ready: false,
    done: false,
    error: false,
  };

  const setRaised = (eventName: string) => () => { eventsRaised[eventName] = true; };
  const resetRaised = (eventName: string) => { eventsRaised[eventName] = false; };
  const resetAllRaised = () => Object.keys(eventsRaised).forEach(resetRaised);

  let script: Script;

  beforeAll(() => Object.assign(global, chromeMock));
  beforeEach(resetAllRaised);
  beforeEach(() => {
    script = new Script();
  });
  beforeEach(() => {
    Object.keys(eventsRaised)
      .forEach((eventName) => script.on(eventName, setRaised(eventName)));
  });
  beforeEach(jest.resetAllMocks);
  beforeEach(jest.restoreAllMocks);
  describe('when run on mein.gebuhrenfrei.com somewhere', () => {
    beforeEach(() => {
      jest.spyOn(window, 'location', 'get').mockReturnValue({
        ...window.location,
        ...{ host: 'mein.gebuhrenfrei.com' },
      });
    });
    describe('when not on transactions page', () => {
      it('should not do anything', async () => {
        await script.execute();

        expect(eventsRaised.noop).toBe(true);
      });
    });

    describe('when on transactions page', () => {
      const simulateAdvanziaAppDoingStuff = () => setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'card';
        document.body.appendChild(div);
      }, 2000);

      beforeEach(() => {
        jest.spyOn(window, 'location', 'get').mockReturnValue({
          ...window.location,
          ...{ pathname: '/retail-app-de' },
        });
        global.fetch = async () => new Response(fs.readFileSync('../dist/advanzia-assistant.wasm'));
      });

      beforeEach(simulateAdvanziaAppDoingStuff);
      beforeEach(() => script.execute());
      it('should indicate ready status', async () => {
        expect(eventsRaised.ready).toBe(true);
      });

      it('to insert correct dom modifications', async () => {
        expect(document.body).toMatchSnapshot();
      });
    });
  });

  describe('otherwise', () => {
    it('should raise error event and create script error indicating that the script cannot be run if not on mein.gebuhrenfrei.com', async () => {
      await script.execute();

      expect(eventsRaised.error).toBe(true);
      expect(script.errors.length).toBe(1);
      expect(script.errors[0]).toEqual(new Error('this script can only be run on mein.gebuhrenfrei.com'));
    });
  });
});
