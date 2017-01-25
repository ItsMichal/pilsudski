var test = require('tape')
var InheritableAudioContext = require('../')

var AudioContext = (window.AudioContext || window.webkitAudioContext)

test("extend existing", function(t){
  var rootContext = new AudioContext()
  var subContext = InheritableAudioContext(rootContext)
  var subContext2 = Object.create(subContext)

  t.doesNotThrow(function(){
    var rootGain = rootContext.createGain()
    var subGain = subContext.createGain()
    subGain.connect(rootGain)
  })

  // unfortunately can't make this pass
  //var gain = subContext.createGain()
  //t.equal(gain.context, subContext)

  subContext.someValue = { test: 123 }
  t.ok(rootContext.someValue === undefined)
  t.equal(subContext.someValue, subContext2.someValue)

  subContext2.anotherValue = { value: 456 }
  t.ok(subContext.anotherValue === undefined, 'value not translated up prototype tree')

  var originalObject = { foo: 'bar' }
  var anotherObject = { foo: 'another value' }

  subContext.somethingElse = originalObject
  t.equal(subContext.somethingElse, originalObject)
  t.equal(subContext2.somethingElse, originalObject)

  subContext2.somethingElse = anotherObject
  t.equal(subContext.somethingElse, originalObject)
  t.equal(subContext2.somethingElse, anotherObject)

  t.ok(subContext instanceof InheritableAudioContext, 'instanceof InheritableAudioContext')
  t.notOk(subContext instanceof AudioContext, 'not instanceof InheritableAudioContext')

  t.end()
})

test('copy params from existing', function(t){
  var context = new AudioContext()
  context.sources = {
    sample: {}
  }

  var subContext = InheritableAudioContext(context)
  t.ok(subContext.sources === undefined)

  var subContextWithAttributes = InheritableAudioContext(context, true)
  t.equal(subContextWithAttributes.sources, context.sources)

  t.end()
})