
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'game.data';
    var REMOTE_PACKAGE_BASE = 'game.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'objects', true, true);
Module['FS_createPath']('/', 'assets', true, true);
Module['FS_createPath']('/', 'states', true, true);
Module['FS_createPath']('/', 'libs', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_game.data');

    };
    Module['addRunDependency']('datafile_game.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 3477, "filename": "/conf.lua"}, {"audio": 0, "start": 3477, "crunched": 0, "end": 4282, "filename": "/main.lua"}, {"audio": 0, "start": 4282, "crunched": 0, "end": 4957, "filename": "/objects/rain.lua"}, {"audio": 0, "start": 4957, "crunched": 0, "end": 6036, "filename": "/objects/feather.lua"}, {"audio": 1, "start": 6036, "crunched": 0, "end": 59322, "filename": "/assets/theo3.wav"}, {"audio": 0, "start": 59322, "crunched": 0, "end": 59507, "filename": "/assets/raindrop.png"}, {"audio": 1, "start": 59507, "crunched": 0, "end": 110373, "filename": "/assets/theo5.wav"}, {"audio": 1, "start": 110373, "crunched": 0, "end": 163507, "filename": "/assets/theo4.wav"}, {"audio": 1, "start": 163507, "crunched": 0, "end": 217995, "filename": "/assets/theo7.wav"}, {"audio": 0, "start": 217995, "crunched": 0, "end": 258315, "filename": "/assets/favicon.png"}, {"audio": 1, "start": 258315, "crunched": 0, "end": 343605, "filename": "/assets/theo1.wav"}, {"audio": 0, "start": 343605, "crunched": 0, "end": 722553, "filename": "/assets/Pixel UniCode.ttf"}, {"audio": 0, "start": 722553, "crunched": 0, "end": 732541, "filename": "/assets/Feather.png"}, {"audio": 1, "start": 732541, "crunched": 0, "end": 785825, "filename": "/assets/theo6.wav"}, {"audio": 1, "start": 785825, "crunched": 0, "end": 851167, "filename": "/assets/theo2.wav"}, {"audio": 1, "start": 851167, "crunched": 0, "end": 930669, "filename": "/assets/theo8.wav"}, {"audio": 1, "start": 930669, "crunched": 0, "end": 16361657, "filename": "/assets/environments.mp3"}, {"audio": 0, "start": 16361657, "crunched": 0, "end": 16484812, "filename": "/assets/Theo.png"}, {"audio": 0, "start": 16484812, "crunched": 0, "end": 16487173, "filename": "/states/theo.lua"}, {"audio": 0, "start": 16487173, "crunched": 0, "end": 16488707, "filename": "/states/intro.lua"}, {"audio": 0, "start": 16488707, "crunched": 0, "end": 16490190, "filename": "/states/breathing.lua"}, {"audio": 0, "start": 16490190, "crunched": 0, "end": 16506997, "filename": "/libs/Moan.lua"}, {"audio": 0, "start": 16506997, "crunched": 0, "end": 16510763, "filename": "/libs/gamestate.lua"}, {"audio": 0, "start": 16510763, "crunched": 0, "end": 16511303, "filename": "/libs/moandefault.png"}], "remote_package_size": 16511303, "package_uuid": "0ad0196b-c07d-45b9-ad89-087be98d84c1"});

})();
