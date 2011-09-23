var HostMapper = require('./statics.js');

// ===============================================

HostMapper.mapHost = function(_obj) {
  var buf = [],
  maps = _obj.maps;

  var handleString = function (name, ip) {
    buf[buf.length] = ip;
    buf[buf.length] = '\t';
    buf[buf.length] = name;
  };

  var handleObject = function (name, obj) {
    if (name.indexOf('*') > -1) {
      var rule = eval( ['(', obj.rule, ')'].join('') );
      switch (rule) {
        case HostMapper.COUNTUP:
        	countup(name, obj.ip, obj.min, obj.max, obj.includeNone);
        break;

        case HostMapper.FILEINPUT:
        	fileinput(name, obj.ip, obj.file);
        break;

        default:
        	console.log('implement this!');
        	console.log(rule);
        	var e = new Error('UndefinedRuleError');
        	e.message = 'This ruleset is not implmented yet';
        	throw e;
        break;
      }
    }
    else {
      handleString(name, obj.ip);
    }
  };

  var countup = function (name, ip, min, max, includeNone) {
    buf[buf.length] = ip;
    buf[buf.length] = '\t';
    if (includeNone) {
      buf[buf.length] = name.replace('*', '');
      buf[buf.length] = ' ';
    }
    for (var i = min; i < max; ++i) {
      buf[buf.length] = name.replace('*', i);
      buf[buf.length] = ' ';
    }
  };

  var fileinput = function (name, ip, filename) {
    buf[buf.length] = ip;
    buf[buf.length] = '\t';
    try {
      var fs = require('fs'),
      names = fs.readFileSync(filename, 'utf8');      
    }
    catch (er) {
      console.log(er);
      throw er;
    }
    // FIXME only unix?
    names.split('\n').forEach(
      function(val) {
        val = val.trim();
        if (val.length > 0) {
          buf[buf.length] = name.replace('*', val);
          buf[buf.length] = ' ';
        }
      }
    );
  };

  for (var i in maps) {
    if (typeof maps[i] === 'string') {
      handleString(i, maps[i]);
    }
    else {
      handleObject(i, maps[i]);
    }
    buf[buf.length] = '\n';
  }
  return buf.join('');
};

// ===============================================

for (var i in HostMapper) {
  exports[i] = HostMapper[i];
};
