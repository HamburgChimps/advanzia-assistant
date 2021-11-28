export interface ContentScript {
  execute(): void;
}

export enum ContentScriptStatus {
  Initializing = 'Initializing',
  Noop = 'Noop',
  Ready = 'Ready',
  Done = 'Done',
  Err = 'Error',
}

export interface WasmExports extends WebAssembly.Exports {
  add_one: (num: number) => number,
}

export interface ContentScriptEvents {
  readonly noop: Event;
  readonly ready: Event;
  readonly done: Event;
  readonly error: ErrorEvent;
}

export class Script extends EventTarget implements ContentScript, EventListenerObject {
  private memory: WebAssembly.Memory;

  private wasmExports?: WasmExports;

  private events: ContentScriptEvents;

  status: ContentScriptStatus;

  errors: Error[];

  constructor() {
    super();
    this.status = ContentScriptStatus.Initializing;
    this.memory = new WebAssembly.Memory({ initial: 10 });
    this.events = {
      noop: new Event('noop'),
      ready: new Event('ready'),
      done: new Event('done'),
      error: new ErrorEvent('error'),
    };

    this.errors = [];

    this.registerEventListeners();
  }

  private registerEventListeners() {
    Object.values(this.events).forEach((e) => this.registerEventListener(e.type));
  }

  private registerEventListener(name: string) {
    this.addEventListener(name, this);
  }

  handleEvent(e: Event | ErrorEvent) {
    switch (e.type) {
      case this.events.ready.type:
        this.status = ContentScriptStatus.Ready;
        break;
      case this.events.noop.type:
        this.status = ContentScriptStatus.Noop;
        break;
      case this.events.done.type:
        this.status = ContentScriptStatus.Done;
        break;
      case this.events.error.type:
        this.status = ContentScriptStatus.Err;
        break;
      default:
        break;
    }
  }

  on(eventName: string, handler: EventListenerOrEventListenerObject) {
    this.addEventListener(eventName, handler);
    return this;
  }

  async execute() {
    if (window.location.host !== 'mein.gebuhrenfrei.com') {
      this.error(new Error('this script can only be run on mein.gebuhrenfrei.com'));
      return;
    }

    if (window.location.pathname.indexOf('retail-app') === -1) {
      this.dispatchEvent(this.events.noop);
      return;
    }

    const wasmPath = chrome.runtime.getURL('advanzia-assistant.wasm');
    const wasmResponse = await fetch(wasmPath);

    const wasmResponseArrayBuffer = await wasmResponse.arrayBuffer();

    const wasmImports = { env: { memory: this.memory } };

    const wasm = await WebAssembly.instantiate(wasmResponseArrayBuffer, wasmImports);
    this.wasmExports = wasm.instance.exports as WasmExports;

    await Script.pageReasonablyLoaded();

    this.dispatchEvent(this.events.ready);
  }

  private error(e: Error) {
    this.errors.push(e);
    this.dispatchEvent(this.events.error);
  }

  private static pageReasonablyLoaded(): Promise<void> {
    const signalSelector = '.card';
    return new Promise((resolve) => {
      const el = document.querySelector(signalSelector);
      if (el) {
        resolve();
        return;
      }
      new MutationObserver((_mutationsList, observer) => {
        if (document.querySelector(signalSelector)) {
          resolve();
          observer.disconnect();
        }
      })
        .observe(document.documentElement, {
          childList: true,
          subtree: true,
        });
    });
  }
}
