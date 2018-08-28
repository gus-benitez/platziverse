'use strict'

function pipe (source, target) {
  if (!source.emit || !target.emit) {
    // Si la fuente o el target, no tienen el método emit, lanzamos un error
    throw TypeError(`Please pass EventEmitter's as arguments`)
  }

  const emit = source._emit = source.emit

  // Reescribimos la función emit, para que tb distribuya la información al target.
  source.emit = function () {
    // Los argumentos que le estan pasando a la función emit, le aplicamos a source.
    emit.apply(source, arguments)
    target.emit.apply(target, arguments)
    return source
  }
}

module.exports = {
  pipe
}
