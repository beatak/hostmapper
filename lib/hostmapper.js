var HostMapper = require('./statics.js');

// ===============================================

HostMapper.mapHost = function(_obj) {
  var buf = [],
  maps = _obj.maps,
  c_chars = 0;

  var isLineTooLong = function () {
    return (c_chars > 80) ? true : false;
  };

  var insertNewLine = function (ip) {
    buf[buf.length] = '\n';
    buf[buf.length] = ip;
    buf[buf.length] = '\t';
    c_chars = 0;
  };

  var handleString = function (name, ip) {
    buf[buf.length] = ip;
    buf[buf.length] = '\t';
    buf[buf.length] = name;
    c_chars = c_chars + ip.length + name.length + 1;
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
    c_chars = c_chars + ip.length + 1;
    if (includeNone) {
      buf[buf.length] = name.replace('*', '');
      buf[buf.length] = ' ';
      c_chars = c_chars + name.length;
    }
    for (var i = min; i <= max; ++i) {
      buf[buf.length] = name.replace('*', i);
      buf[buf.length] = ' ';
      c_chars = c_chars + name.length;
      if (isLineTooLong()) {
        insertNewLine(ip);
      }
    }
  };

  var fileinput = function (name, ip, filename) {
    buf[buf.length] = ip;
    buf[buf.length] = '\t';
    c_chars = c_chars + ip.length + 1;
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
          c_chars = c_chars + name.length;
          if (isLineTooLong()) {
            insertNewLine(ip);
          }
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
    c_chars = 0;
  }
  return buf.join('');
};

// ===============================================

for (var i in HostMapper) {
  exports[i] = HostMapper[i];
};
