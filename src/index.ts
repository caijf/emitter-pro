type Listener = (...args: any[]) => any;

type EventName = string | symbol;
type EventListener<F extends Listener = Listener> = { raw: F; wrap: F; context: object | null };
type Handler<F extends Listener = Listener> = Record<EventName, EventListener<F>[]>;

class EmitterPro<F extends Listener = Listener> {
  private handlers: Handler<F>;
  constructor() {
    this.handlers = {};
  }

  eventNames() {
    const symbols = Object.getOwnPropertySymbols?.(this.handlers) || [];
    const keys = Object.keys(this.handlers) as (string | symbol)[];
    return keys.concat(symbols);
  }

  rawListeners(eventName: EventName) {
    const handler = this.handlers[eventName];
    return handler ? handler.map((item) => item.raw) : [];
  }

  listeners(eventName: EventName) {
    const handler = this.handlers[eventName];
    return handler ? handler.map((item) => item.wrap) : [];
  }

  hasListener(eventName: EventName, listener: F) {
    return this.rawListeners(eventName).some((item) => item === listener);
  }

  private _on(
    eventName: EventName,
    raw: F,
    wrap: F,
    context: EventListener['context'] = null,
    dir = 1
  ) {
    const currentListener = { raw, wrap, context };

    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [currentListener];
    } else {
      const appendMethod = dir === 1 ? 'push' : 'unshift';
      this.handlers[eventName][appendMethod](currentListener);
    }

    return this;
  }

  prependListener(eventName: EventName, listener: F, context?: EventListener['context']) {
    return this._on(eventName, listener, listener, context, 0);
  }

  on(eventName: EventName, listener: F, context?: EventListener['context']) {
    return this._on(eventName, listener, listener, context);
  }

  private _wrapOnce(eventName: EventName, listener: F, context: EventListener['context'] = null) {
    const wrap = ((...args: Parameters<F>) => {
      listener.apply(context, args);
      this.off(eventName, wrap);
    }) as F;
    return wrap;
  }

  once(eventName: EventName, listener: F, context?: EventListener['context']) {
    const wrap = this._wrapOnce(eventName, listener, context);
    return this._on(eventName, listener, wrap, context);
  }

  prependOnceListener(eventName: EventName, listener: F, context?: EventListener['context']) {
    const wrap = this._wrapOnce(eventName, listener, context);
    return this._on(eventName, listener, wrap, context, 0);
  }

  off(eventName: EventName, listener?: F) {
    const handler = this.handlers[eventName];

    if (handler) {
      if (listener) {
        const index = handler.findIndex((item) => item.wrap === listener || item.raw === listener);
        if (index !== -1) {
          handler.splice(index, 1);
        }
      } else {
        delete this.handlers[eventName];
      }
    }
    return this;
  }

  offAll() {
    this.handlers = {};
    return this;
  }

  emit(eventName: EventName, ...args: Parameters<F>) {
    const handler = this.handlers[eventName];
    if (handler && handler.length > 0) {
      handler.forEach((listener) => {
        listener.wrap.apply(listener.context, args);
      });
      return true;
    }
    return false;
  }
}

export default EmitterPro;
