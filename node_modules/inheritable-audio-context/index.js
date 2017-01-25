module.exports = InheritableAudioContext

var AudioContext = (global.AudioContext || global.webkitAudioContext)
var baseContext = new AudioContext()

function InheritableAudioContext(audioContext, copyExtendedAttributes){
  
  if (!(this instanceof InheritableAudioContext)){
    if (audioContext && audioContext instanceof InheritableAudioContext){
      return Object.create(audioContext)
    } else {
      return new InheritableAudioContext(audioContext, copyExtendedAttributes)
    }
  }
  
  this.parentContext = audioContext || baseContext

  if (audioContext && copyExtendedAttributes){
    for (var k in audioContext){
      if (k in audioContext && baseContext[k] == undefined){
        this[k] = audioContext[k]
      }
    }
  }
  
}

function functionProxy(k){
  return function(){
    return this.parentContext[k].apply(this.parentContext, arguments)
  }
}

function proxyProperty(target, k){
  Object.defineProperty(target, k, {
    get: function(){
      return this.parentContext[k]
    }
  })
}

var proto = InheritableAudioContext.prototype = {
  constructor : InheritableAudioContext
}

for (var k in baseContext){
  if (typeof baseContext[k] == 'function'){
    proto[k] = functionProxy(k)
  }
}

proxyProperty(proto, 'currentTime')
proxyProperty(proto, 'sampleRate')
proxyProperty(proto, 'destination')
proxyProperty(proto, 'listener')