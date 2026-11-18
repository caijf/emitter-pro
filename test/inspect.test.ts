import Emitter from '../src';

describe('不支持 Object.getOwnPropertySymbols 方法', () => {
  const descriptor = Object.getOwnPropertyDescriptor(Object, 'getOwnPropertySymbols')!;

  afterEach(() => {
    Object.defineProperty(Object, 'getOwnPropertySymbols', descriptor);
  });

  it('获取事件名称不返回symbol类型名称，事件正常触发', () => {
    // 模拟低版本环境：方法不存在，触发源码 `Object.getOwnPropertySymbols?.()` 的短路降级分支
    Object.defineProperty(Object, 'getOwnPropertySymbols', {
      value: undefined,
      configurable: true,
      writable: true
    });

    const sym1 = Symbol('a');
    const sym2 = Symbol('a');
    const fn = jest.fn();
    const emitter = new Emitter();
    emitter.on(sym1, fn);
    emitter.on(sym2, fn);

    const emitted = emitter.emit(sym1);
    const eventNames = emitter.eventNames();

    // 断言前恢复：jest 匹配器内部依赖该方法
    Object.defineProperty(Object, 'getOwnPropertySymbols', descriptor);

    expect(emitted).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(eventNames).toEqual([]);
  });
});
