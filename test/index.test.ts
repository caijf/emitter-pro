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
  });

  it('不允许添加相同的方法', () => {
    const emitter = new Emitter();
    const fn = jest.fn();
    emitter.on('test', fn);
    emitter.on('test', fn);
    emitter.on('test', fn);
    expect(emitter.hasListener('test', fn)).toEqual(true);
    expect(emitter.hasListener('test', jest.fn())).toEqual(false);
    expect(emitter.listeners('test').length).toEqual(1);

    emitter.emit('test');
    expect(fn).toHaveBeenCalledTimes(1);
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
});
