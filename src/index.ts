type Listener = (...args: any[]) => any;

class EmitterPro<F extends Listener = Listener> {
  private handler: Record<string, F[]>;
  constructor() {
    this.handler = {};
  }
  eventNames() {
    return Object.keys(this.handler);
  }
  listeners(eventName: string) {
    return this.handler[eventName] || [];
  }
  hasListener(eventName: string, listener: F) {
    return this.handler[eventName].some((item) => {
      return item === listener;
    });
  }
  on(eventName: string, listener: F) {
    if (!this.handler[eventName]) {
      this.handler[eventName] = [listener];
    } else {
      // 不允许添加相同的方法
      if (!this.hasListener(eventName, listener)) {
        this.handler[eventName].push(listener);
      }
    }
    return this;
  }
  off(eventName: string, listener?: F) {
    if (this.handler[eventName]) {
      if (typeof listener === 'function') {
        this.handler[eventName] = this.handler[eventName].filter((item) => item !== listener);
      } else {
        delete this.handler[eventName];
      }
    }
    return this;
  }
  emit(eventName: string, ...args: Parameters<F>) {
    const listeners = this.listeners(eventName);
    if (listeners.length > 0) {
      listeners.forEach((listener) => {
        listener(...args);
      });
      return true;
    }
    return false;
  }
  once(eventName: string, listener: F) {
    const wrap = (...args: Parameters<F>) => {
      listener(...args);
      this.off(eventName, wrap as F);
    };
    return this.on(eventName, wrap as F);
  }
  offAll() {
    this.handler = {};
    return this;
  }
}

export default EmitterPro;
