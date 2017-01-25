inheritable-audio-context
===

Wrap an AudioContext to allow inheritance and additional properties.

If you want to do this (for whatever reason):

```js
var context = new AudioContext()
var subContext = Object.create(context)
subContext.someValueOnlyOnSubContext = 'VALUE'
var gain = subContext.createGain() // TypeError: Illegal invocation
```

It throws an error. This module allows you to achieve the same thing but without the error.

## Install

```bash
npm install inheritable-audio-context
```

## Examples

### Extend existing AudioContext

```js
var InheritableAudioContext = require('inheritable-audio-context')
var audioContext = new AudioContext()

var subContext = InheritableAudioContext(audioContext)
var subGain = subContext.createGain()
subGain.connect(audioContext.destination) // can be connected to original audioContext

subContext.extendedProperty = 'VALUE'
audioContext.extendedProperty //= undefined

var subContext2 = Object.create(subContext)

// values inherit down proto chain
subContext.inheritedDownValue = 'VALUE'
subContext2.inheritedDownValue //= 'VALUE'

// but not back up
subContext2.someAdditionalValue = 'VALUE'
subContext.someAdditionalValue //= undefined

// InheritableAudioContext inherits from AudioContext
subContext instanceof AudioContext //= true
subContext instanceof InheritableAudioContext //= true
```

### Standalone

```js
var InheritableAudioContext = require('inheritable-audio-context')
var rootContext = new InheritableAudioContext()

var subContext = Object.create(rootContext)

// values inherit down proto chain
rootContext.valueAtRoot = 1234
subContext.valueAtRoot //= 1234

// but not back up
subContext.someAdditionalValue = 'VALUE'
rootContext.someAdditionalValue //= undefined
```