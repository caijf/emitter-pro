# emitter-pro

[![npm][npm]][npm-url] ![GitHub](https://img.shields.io/github/license/caijf/emitter-pro.svg)

一个简单的 Javascript 事件管理，支持浏览器端和 node 端。

## 使用

### 安装

```shell
yarn add emitter-pro
```

or

```shell
npm install emitter-pro
```

### 示例

```typescript
import Emitter from 'emitter-pro';

const emitter = new Emitter();

// 注册监听方法
emitter.on('foo', () => console.log('bar'));
emitter.on('foo', () => console.log('baz'));
emitter.on('foo', () => console.log(42));

// 触发方法
emitter.emit('foo');

// 取消监听
emitter.off('foo');
```

## 实例方法

### on(eventName: string, listener: F)

注册监听方法。

返回当前实例。

```typescript
const emitter = new Emitter();

// 注册监听方法
emitter.on('foo', () => console.log('bar'));
emitter.on('foo', () => console.log('baz'));

// 同一个事件名称，不能重复注册同一个方法。
const fn = () => console.log('test');
emitter.on('test', fn);

// 不能注册相同的方法，下面将不生效
emitter.on('test', fn);
```

### emit(eventName: string, ...args: Parameters<F>)

触发方法。

返回当前实例。

```typescript
const emitter = new Emitter();

emitter.on('foo', () => console.log('bar'));
emitter.on('foo', () => console.log('baz'));

emitter.emit('foo');
// bar
// baz

// 支持传入参数
emitter.on('test' (a, b) => console.log(a + b));
emitter.on('test' (a, b) => console.log(a * b));

emitter.emit('test', 2, 5);
// 7
// 10

emitter.emit('test', 5, 5);
// 10
// 25
```

### off(eventName: string, listener?: F)

取消监听方法。如果不传第二个参数，将取消该事件名称的全部监听方法。

返回当前实例。

```typescript
const emitter = new Emitter();

const fn = () => console.log('bar');

emitter.on('foo', fn);
emitter.on('foo', () => console.log('baz'));
emitter.on('foo', () => console.log(42));

emitter.emit('foo');
// bar
// baz
// 42

emitter.off('foo', fn);
emitter.emit('foo');
// bar
// 42

emitter.off('foo'); // 取消 foo 全部监听方法
emitter.emit('foo');
```

### once(eventName: string, listener: F)

仅触发一次的监听方法。使用方法同 `on` 。

返回当前实例。

### offAll()

取消全部事件名称的监听方法。

返回当前实例。

```typescript
const emitter = new Emitter();

const fn = () => console.log('bar');
emitter.on('test', fn);
emitter.on('test', () => console.log('baz'));
emitter.on('test', () => console.log(42));

emitter.on('other', fn);
emitter.on('other', () => console.log('baz'));

emitter.offAll(); // 取消全部监听方法

emitter.emit('test'); // 什么都没发生
emitter.emit('other'); // 什么都没发生
```

### eventNames()

获取全部事件名称。

返回事件名称数组。

```typescript
const emitter = new Emitter();

const fn = () => console.log('bar');
emitter.on('test', fn);
emitter.on('other', fn);

console.log(emitter.eventNames()); // ["test", "other"]
```

### listeners(eventName: string)

获取事件名称的全部监听方法。

返回事监听方法数组。

```typescript
const emitter = new Emitter();

const fn1 = () => console.log('bar');
const fn2 = () => console.log('baz');
emitter.on('test', fn1);
emitter.on('test', fn2);

console.log(emitter.listeners('test')); // [fn1, fn2]
```

[npm]: https://img.shields.io/npm/v/emitter-pro.svg
[npm-url]: https://npmjs.com/package/emitter-pro
