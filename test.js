const hash = require("hash.js")

// console.log(sha256.read().toString('mem'));


let test = hash.sha256().update('abc').digest('hex')
let test1 = hash.sha256().update('abc').digest('hex')

console.log(test)
console.log(test1)