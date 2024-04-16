import Emitter from '../src';

describe('不支持 Object.getOwnPropertySymbols 方法', () => {
  const original_getOwnPropertySymbols = Object.getOwnPropertySymbols;

  it('获取事件名称不返回symbol类型名称，事件正常触发', () => {
    // @ts-expect-error
    delete Object.getOwnPropertySymbols;

    const sym1 = Symbol('a');
    const sym2 = Symbol('a');
    const fn = jest.fn();
    const emitter = new Emitter();
    emitter.on(sym1, fn);
    emitter.on(sym2, fn);

    emitter.emit(sym1);

    const eventNames = emitter.eventNames();

    Object.getOwnPropertySymbols = original_getOwnPropertySymbols;

    expect(eventNames).toEqual([]);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
