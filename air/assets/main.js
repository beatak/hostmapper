var process;

var $selector;
var $button;
var flagup = false;

var onWindowLoad = function  () {
  $selector = $('#selector');
  $button = $('#button');

  $button.click(
    function (ev) {
      ev.preventDefault();

      // process.standardInput.ObjectEncoding = window.runtime.flash.net.ObjectEncoding.DEFAULT;
      // air.trace(process.standardInput.endian);
      // air.trace(process.standardInput.ObjectEncoding);

      process.standardInput.writeUTFBytes("1");
      //process.standardInput.writeUTF("1\n");

      // process.closeInput();
    }
  );

  if (air.NativeProcess.isSupported) {
    setupNativeProcess();
  }
  else {
    air.trace("NativeProcess not supported.");
  }
};

var setupNativeProcess = function () {
  air.trace("NativeProcess IS supported!");
  var nativeProcessStartupInfo = new air.NativeProcessStartupInfo();
  var file = air.File.applicationDirectory.resolvePath("/Users/takashi/Repository/hostmapper/lib/main.js");
  // air.trace(file.nativePath);
  nativeProcessStartupInfo.executable = file;

  var processArgs = new air.Vector["<String>"]();
  // processArgs.push("foo");
  nativeProcessStartupInfo.arguments = processArgs;

  process = new air.NativeProcess();
  process.start(nativeProcessStartupInfo);

  process.addEventListener(air.ProgressEvent.STANDARD_OUTPUT_DATA, onOutputData);
  process.addEventListener(air.Event.STANDARD_INPUT_CLOSE, onInputClose);

  process.addEventListener(air.ProgressEvent.STANDARD_ERROR_DATA, onErrorData);
  process.addEventListener(air.NativeProcessExitEvent.EXIT, onExit);
  process.addEventListener(air.IOErrorEvent.STANDARD_OUTPUT_IO_ERROR, onIOError);
  process.addEventListener(air.IOErrorEvent.STANDARD_ERROR_IO_ERROR, onIOError);
};

var onInputClose = function () {
  air.trace('onInputClose');
};

var onOutputData = function () {
  air.trace('onOutputData');
  var data = process.standardOutput.readUTFBytes( process.standardOutput.bytesAvailable );
  air.trace("Got: ", data);
  if (data.indexOf('sudo') === 0) {
    setTimeout(
      function() {
        air.trace('inputting password');
        process.standardInput.writeUTFBytes("password");
      },
      100
    );
  }
};

var onErrorData = function (event) {
  air.trace("ERROR -", process.standardError.readUTFBytes(process.standardError.bytesAvailable));
};

var onExit = function (event) {
  air.trace("Process exited with ", event.exitCode);
};

var onIOError = function (event) {
  air.trace(event.toString());
};
