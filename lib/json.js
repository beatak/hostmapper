#!/usr/local/bin/node


var fs = require('fs');

var HostMapper = require('./statics.js');

console.log(HostMapper);

var cont = fs.readFileSync('/Users/takashi/.hostmapper/takashi.json', 'utf8');
console.log(cont);

var obj = JSON.parse(cont);
// var obj = eval(cont);

var txt = JSON.stringify(obj, null, '  ');

console.log(txt);

var obj2 = JSON.parse(txt);

console.log(obj2);
