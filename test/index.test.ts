import Emitter from '../src';

describe('emitter-pro', () => {
  it('should be defined', () => {
    expect(Emitter).toBeDefined();
  });

  it('注册、触发、取消', () => {
    const emitter = new Emitter();
    const fn = jest.fn();
    emitter.on('test', fn);

    expect(fn).toHaveBeenCalledTimes(0);

    emitter.emit('test');
    expect(fn).toHaveBeenCalledTimes(1);

    emitter.emit('test');
    expect(fn).toHaveBeenCalledTimes(2);

    emitter.off('test', fn);
    emitter.emit('test');
    expect(fn).toHaveBeenCalledTimes(2);

    emitter.once('test', fn);
    emitter.off('test', fn);
    emitter.emit('test');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('区分on和once注册的方法', () => {
    const on_fn = jest.fn();
    const once_fn = jest.fn();
    const emitter = new Emitter();
    emitter.on('test', on_fn);
    emitter.once('test', once_fn);

    emitter.emit('test');
    expect(on_fn).toHaveBeenCalledTimes(1);
    expect(once_fn).toHaveBeenCalledTimes(1);

    emitter.emit('test');
    expect(on_fn).toHaveBeenCalledTimes(2);
    expect(once_fn).toHaveBeenCalledTimes(1);
  });

  it('如果on和once注册的是同一个函数，内部能准确注销对应的once的函数，不影响添加顺序', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const emitter = new Emitter();

    emitter.on('test', fn1);
    emitter.on('test', fn1);
    emitter.on('test', fn2);
    emitter.once('test', fn1);
    emitter.on('test', fn1);
    emitter.once('test', fn2);

    expect(emitter.rawListeners('test')).toEqual([fn1, fn1, fn2, fn1, fn1, fn2]);

    emitter.emit('test');
    expect(emitter.rawListeners('test')).toEqual([fn1, fn1, fn2, fn1]);
  });

  it('判断是否存在监听方法', () => {
    const emitter = new Emitter();
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    emitter.on('test', fn1);
    emitter.once('test', fn2);

    expect(emitter.hasListener('test', fn1)).toBe(true);
    expect(emitter.hasListener('test', fn2)).toBe(true);

    emitter.emit('test');

    expect(emitter.hasListener('test', fn1)).toBe(true);
    expect(emitter.hasListener('test', fn2)).toBe(false);
  });

  it('允许多次添加相同的方法', () => {
    const emitter = new Emitter();
    const fn = jest.fn();
    emitter.on('test', fn);
    emitter.on('test', fn);
    emitter.on('test', fn);
    expect(emitter.hasListener('test', fn)).toEqual(true);
    expect(emitter.hasListener('test', jest.fn())).toEqual(false);
    expect(emitter.listeners('test').length).toEqual(3);

    emitter.emit('test');
    expect(fn).toHaveBeenCalledTimes(3);

    emitter.off('test', fn);
    emitter.emit('test');
    expect(fn).toHaveBeenCalledTimes(5);
  });

  it('事件名称使用symbol类型', () => {
    const sym1 = Symbol('a');
    const sym2 = Symbol('a');
    const fn = jest.fn();
    const emitter = new Emitter();
    emitter.on(sym1, fn);
    emitter.on(sym2, fn);

    expect(emitter.eventNames()).toEqual([sym1, sym2]);
  });

  it('链式调用和取消监听', () => {
    const emitter = new Emitter();
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const fn3 = jest.fn();

    emitter.on('test', fn1).on('test', fn2);
    emitter.on('bar', fn1).on('bar', fn2).on('bar', fn3);

    emitter.emit('test');
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);

    emitter.emit('bar');
    expect(fn1).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(2);
    expect(fn3).toHaveBeenCalledTimes(1);

    emitter.off('test', fn1).emit('test');
    expect(fn1).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(3);

    emitter.off('bar').emit('bar');
    expect(fn1).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(3);
    expect(fn3).toHaveBeenCalledTimes(1);
  });

  it('eventNames listeners and offAll', () => {
    const emitter = new Emitter();
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const fn3 = jest.fn();

    emitter.on('test', fn1).on('test', fn2);
    emitter.on('bar', fn1).on('bar', fn2).on('bar', fn3);

    expect(emitter.eventNames()).toEqual(['test', 'bar']);
    expect(emitter.listeners('test')).toEqual([fn1, fn2]);
    expect(emitter.listeners('bar')).toEqual([fn1, fn2, fn3]);

    emitter.off('test', fn1);
    expect(emitter.listeners('test')).toEqual([fn2]);

    emitter.off('test');
    expect(emitter.eventNames()).toEqual(['bar']);
    expect(emitter.listeners('test')).toEqual([]);

    emitter.offAll();
    expect(emitter.eventNames()).toEqual([]);
    expect(emitter.listeners('bar')).toEqual([]);

    // 取消不存在的 eventName 不报错
    emitter.off('test');
    expect(emitter.eventNames()).toEqual([]);
  });

  it('emit with arguments and once', () => {
    const emitter = new Emitter();
    let sum = 0,
      square = 0;
    const fn1 = jest.fn((a, b) => {
      sum = a + b;
    });
    const fn2 = jest.fn((a, b) => {
      square = a * b;
    });
    emitter.on('test', fn1).once('test', fn2);
    emitter.emit('test', 2, 5);

    expect(sum).toEqual(7);
    expect(square).toEqual(10);

    emitter.emit('test', 5, 5);
    expect(sum).toEqual(10);
    expect(square).toEqual(10); // once

    emitter.emit('test', 10, 10);
    expect(sum).toEqual(20);
    expect(square).toEqual(10); // once
  });

  it('自定义执行上下文', () => {
    let count = 0;
    const obj1 = {
      o: 1
    };
    const obj2 = {
      o: 2
    };
    const obj3 = {
      o: 3
    };
    function fn() {
      // @ts-expect-error
      count += this.o;
    }

    const emitter = new Emitter();
    emitter.on('addOne', fn, obj1);
    emitter.on('addTwo', fn, obj2);
    emitter.once('addThree', fn, obj3);

    emitter.emit('addOne');
    expect(count).toBe(1);

    emitter.emit('addTwo');
    expect(count).toBe(3);

    emitter.emit('addThree');
    expect(count).toBe(6);

    emitter.emit('addTwo');
    expect(count).toBe(8);

    emitter.emit('addThree');
    expect(count).toBe(8);
  });

  it('once 的 listeners 和 rawListeners', () => {
    const fn = jest.fn();
    const emitter = new Emitter();
    emitter.once('test', fn);

    const listeners = emitter.listeners('test');
    expect(listeners[0]).not.toBe(fn);

    const rawListeners = emitter.rawListeners('test');
    expect(rawListeners[0]).toBe(fn);

    emitter.off('test', fn);
    expect(emitter.listeners('test').length).toEqual(0);
    expect(emitter.rawListeners('test').length).toEqual(0);
    expect(emitter.hasListener('test', fn)).toBe(false);
    expect(emitter.eventNames().length).toBe(1);

    emitter.offAll();
    expect(emitter.listeners('test').length).toEqual(0);
    expect(emitter.rawListeners('test').length).toEqual(0);
    expect(emitter.hasListener('test', fn)).toBe(false);
    expect(emitter.eventNames().length).toBe(0);
  });

  it('prependListener & prependOnceListener', () => {
    const emitter = new Emitter();
    const on_fn = jest.fn();
    const once_fn = jest.fn();
    const prepend_fn = jest.fn();
    const prepend_once_fn = jest.fn();

    emitter.on('test', on_fn);
    emitter.once('test', once_fn);
    emitter.prependListener('test', prepend_fn);
    emitter.prependOnceListener('test', prepend_once_fn);

    expect(emitter.rawListeners('test')).toEqual([prepend_once_fn, prepend_fn, on_fn, once_fn]);

    emitter.emit('test');
    expect(emitter.rawListeners('test')).toEqual([prepend_fn, on_fn]);
  });
});
