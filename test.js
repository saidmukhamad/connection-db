const hash = require("hash.js")

// console.log(sha256.read().toString('mem'));


let test = hash.sha256().update('abc').digest('hex')
let test1 = hash.sha256().update('abc').digest('hex')

let test2 = hash.sha512().update('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad').digest('hex')


console.log(test)
console.log(test1)
console.log(test2)