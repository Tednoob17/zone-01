export const tests = []
const t = (f) => tests.push(f)

// helloWorld is declared and is a function
t(() => typeof helloWorld === 'function')

// helloWorld return strings back
t(() => id() === 'Hello World')

Object.freeze(tests)