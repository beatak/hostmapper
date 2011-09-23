#!/usr/local/bin/node

var PREFS_DIR = '.hostmapper',
PREFS_PATH,
$HOME;

var fs = require('fs'),
hostmapper = require('./hostmapper.js'),
path = require('path'),
readline = require('readline'),
proc = require('child_process');

var filenames = [],
tty = null,
prefs = {};

// utility
// ===============================================

var lchomp = function (str) {
  str = '' + str;
  return str.replace(/^[\r]{0,1}\n/, '');
};

var rchomp = function (str) {
  str = '' + str;
  return str.replace(/[\r]{0,1}\n$/, '');
};

String.slice = function (str, index) {
  return Array.prototype.slice.call('' + str, index).join('');
};

String.pad = function (str, digit, padchar, right) {
  str = '' + str;
  digit = parseInt(digit, 10);
  padchar = padchar || '0';
  right = right || false;
  if (isNaN(digit)) {
    throw new Error('you have to pass a number as digit');
  }
  if (padchar.length > 1) {
    throw new Error('padchar must be one character');
  }
  var arr = [str];
  if (str.length < digit) {
    var len = digit - str.length;
    var pad = (new Array(len + 1)).join(padchar);
    if (right) {
      arr[arr.length] = pad;
    }
    else {
      arr.unshift(pad);
    }
  }
  return arr.join('');
};

// ===============================================

// 1) get home directory
proc.exec(
  'cd $HOME && pwd',
  function (err, stdout, stderr) {
    // console.log('onChangeDirHome');
    if (err !== null) {
      console.log('change dirrectory error');
      console.log(err);
      process.exit(1);
    }
    $HOME = rchomp(stdout);
    PREFS_PATH = [$HOME, '/', PREFS_DIR].join('');
    findPrefs();
  }
);

// 2) find the prefreneces
var findPrefs = function () {
  // console.log('findPrefs');
  if (path.existsSync(PREFS_PATH)) {
    loadPrefs();
  }
  else {
    createPrefsDir();
  }
};

// 3a) create preferences directory
var createPrefsDir = function () {
  // console.log('createPrefsDir');
  try {
    // we should get umask and calc this..?
    fs.mkdirSync(PREFS_PATH, '755');
    // FIXME then what?
    console.log('then what?');
    process.exit(0);
  }
  catch (er) {
    console.log('Probably, you do not have a permission to write on your home directory.');
    console.log(er);
    process.exit(1);
  }
};

// 3b) list preferences
var loadPrefs = function () {
  // console.log('loadPrefs');
  proc.exec(
    'ls ' + PREFS_PATH,
    onListPrefsDir
  );
};

// 4) display the prefs
// SUCKY! in JSON, you cannot pass the function nor js object.
var onListPrefsDir = function (err, stdout, stderr) {
  //console.log('onListPrefsDir');
  if (err !== null) {
    console.log('error on ls ' + PREFS_PATH);
    console.log(err);
    process.exit(1);
  }
  // FIXME. new line only on unix??
  var arr = rchomp(stdout).split('\n');
  var rev_json = '.json'.split('').reverse().join('');
  arr.forEach(
    function (val) {
      var i;
      if (val.split('').reverse().join('').indexOf(rev_json) === 0) {
        i = filenames.length;
        filenames[i] = val;
        prefs[val] = JSON.parse( fs.readFileSync( [PREFS_PATH, '/', val].join(''), 'utf8' ) );
        console.log([(i + 1), ': ', val, '\t', prefs[val].description].join(''));
      }
    }
  );
  tty = readline.createInterface(process.stdin, process.stdout);
  tty.question(
    'which one you would like to use? ',
    onQuestionAnswered
  );
};

// 5) check the answer
var onQuestionAnswered = function (ans) {
  // console.log('onQuestionAnswered');
  // console.log(['Recevied: "', ans, '"'].join(''));
  var answer = parseInt(ans, 10);
  if (isNaN(answer)) {
    tty.question(
      'type number please: ',
      onQuestionAnswered
    );
    return false;
  }
  else if (answer < 1 || answer > filenames.length) {
    tty.question(
      'number must be in the range: ',
      onQuestionAnswered
    );
    return false;
  }
  // console.log(answer);
  tty.close();
  hostmap(prefs[filenames[answer - 1]]);
};

// 6) map the host and write the file
var hostmap = function(obj) {
  // console.log('hostmap!');
  var str = hostmapper.mapHost(obj),
  d = new Date(),
  oldfile = [
    d.getFullYear() , '-', 
    String.pad(d.getMonth() + 1, 2), '-', 
    String.pad(d.getDate(), 2), '_', 
    String.pad(d.getHours(), 2), '-', 
    String.pad(d.getMinutes(), 2), 
    '.host'
  ].join(''),
  epo = String.slice(d.valueOf(), -6),
  newfile = ['/var/tmp/', epo].join('');

  // a) keep the old file first
  var onMoveOldHost = function (error, stdout, stderr) {
    // console.log('onMoveOldHost');
    if (error !== null) {
      console.log('failed to move old host file');
      console.log(error);
      process.exit(1);
    }
    createHost();
  };

  // b) create a file in temp path
  var createHost = function () {
    // console.log('createHost');
    try {
      fs.writeFileSync(newfile, str);
      fs.chmodSync(newfile, '755');
      proc.exec(
        ['sudo mv ', newfile, ' ', hostmapper.HOSTPATH].join(''),
        function (error, stdout, stderr) {
          if (error !== null) {
            console.log('failed to move the new host file.');
            console.log(error);
            process.exit(1);
          }
          console.log('done');
          process.exit(0);
        }
      );
    }
    catch (er) {
      console.log('failed to write a host');
      console.log(er);
      process.exit(1);
    }
  };

  if (path.existsSync(hostmapper.HOSTPATH)) {
    // console.log('sudo mv');
    proc.exec(
      ['sudo mv ', hostmapper.HOSTPATH, ' ', PREFS_PATH, '/', oldfile].join(''),
      onMoveOldHost
    );
  }
  else {
    createHost();
  }
};