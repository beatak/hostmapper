#!/usr/local/bin/node

var HostMapper = {
  COUNTUP: 1,
  FILEINPUT: 2
};
exports.HostMapper = HostMapper;

// process to receive the arguments
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

// String exntend
String.slice = function(str, index) {
  return Array.prototype.slice.call('' + str, index).join('');
};

// ===============================================


// load file
// ===============================================
var fs = require('fs');
var data = fs.readFileSync(
  '$HOME/Repository/hostmapper/examples/takashi.json',
  'utf8'
);
console.log(data);
var obj = eval(data);
console.log(obj.description);


// templating
// ===============================================
var buf = [];
var m = obj.maps,hm;
for (var i in m) {
  if (typeof m[i] === 'string') {
    buf[buf.length] = m[i];
    buf[buf.length] = '\t';
    buf[buf.length] = i;
  }
  else {
    hm = m[i];
    if (i.indexOf('*') > -1) {
      switch(hm.rule) {
        case HostMapper.COUNTUP:
          buf[buf.length] = hm.ip;
          buf[buf.length] = '\t';
        	if (hm.includeNone) {
            buf[buf.length] = i.replace('*', '');
            buf[buf.length] = ' ';
          }
        	for (var _i = hm.min, _len = hm.max; _i < _len; ++_i) {
            buf[buf.length] = i.replace('*', _i);
            buf[buf.length] = ' ';
          }
        break;
 
       case HostMapper.FILEINPUT:
          buf[buf.length] = hm.ip;
          buf[buf.length] = '\t';
        	if (hm.includeNone) {
            buf[buf.length] = i.replace('*', '');
            buf[buf.length] = ' ';
          }
        	var names = fs.readFileSync(
            hm.file,
            'utf8'
          );
        	var arr_names = names.split('\n');
        	arr_names.forEach(
            function(val, index, array) {
              buf[buf.length] = i.replace('*', val);
              buf[buf.length] = ' ';
            }
          );
        break;
      }
    }
    else {
      buf[buf.length] = hm.ip;
      buf[buf.length] = '\t';
      buf[buf.length] = i;
    }
  }
  buf[buf.length] = '\n';
}


/// WRITE a root's file
// ===============================================
// make a temporary file
var epo = String.slice( (new Date()).valueOf(), -6);
var filename = ['/var/tmp/', epo].join('');
console.log('write file');
console.log(fs.writeFileSync(filename, buf.join('')));

// set the correct permission
console.log('chmod');
console.log( fs.chmodSync(filename, '755'));

// move it
console.log('move');
var cp = require('child_process');
var newfile = '/var/tmp/root-' + epo;
cp.exec(
  'sudo mv ' + filename + ' ' + newfile + ' && sudo chown root ' + newfile,
  function (error, stdout, stderr) {
    console.log('cp.exec()');
    if (error !== null) {
      console.log('error on cp.exec()');
      console.log(error);
    }
    console.log('done');
  }
);
