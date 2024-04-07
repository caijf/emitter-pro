type Listener = (...args: any[]) => any;

type EventName = string | symbol;
type EventListener<F extends Listener = Listener> = { raw: F; wrap: F; context: object | null };
type Handler<F extends Listener = Listener> = [EventName, EventListener<F>[]];

class EmitterPro<F extends Listener = Listener> {
  private handlers: Handler<F>[];
  constructor() {
    this.handlers = [];
  }

  private _get(eventName: EventName) {
    return this.handlers.find((item) => item[0] === eventName);
  }

  eventNames() {
    return this.handlers.map((item) => item[0]);
  }

  rawListeners(eventName: EventName) {
    const handler = this._get(eventName);
    return handler ? handler[1].map((item) => item.raw) : [];
  }

  listeners(eventName: EventName) {
    const handler = this._get(eventName);
    return handler ? handler[1].map((item) => item.wrap) : [];
  }

  hasListener(eventName: EventName, listener: F) {
    return this.listeners(eventName).some((item) => item === listener);
  }

  private _on(
    eventName: EventName,
    raw: F,
    wrap: F,
    context: EventListener['context'] = null,
    dir = 1
  ) {
    const handler = this._get(eventName);
    const currentListener = { raw, wrap, context };
    const appendMethod = dir === 1 ? 'push' : 'unshift';

    if (!handler) {
      this.handlers[appendMethod]([eventName, [currentListener]]);
    } else {
      handler[1][appendMethod](currentListener);
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
    const handler = this._get(eventName);

    if (handler) {
      if (listener) {
        const index = handler[1].findIndex(
          (item) => item.wrap === listener || item.raw === listener
        );
        if (index !== -1) {
          handler[1].splice(index, 1);
        }
      } else {
        const index = this.handlers.findIndex((item) => item[0] === eventName);
        if (index !== -1) {
          this.handlers.splice(index, 1);
        }
      }
    }
    return this;
  }

  offAll() {
    this.handlers.length = 0;
    return this;
  }

  emit(eventName: EventName, ...args: Parameters<F>) {
    const handler = this._get(eventName);
    if (handler && handler[1].length > 0) {
      handler[1].forEach((listener) => {
        listener.wrap.apply(listener.context, args);
      });
      return true;
    }
    return false;
  }
}

export default EmitterPro;
