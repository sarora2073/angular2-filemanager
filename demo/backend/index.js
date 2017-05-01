var express = require('express');
var sizeOf = require('image-size');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var formidable = require('formidable');
var mime = require('mime-types');
// var easyimg = require('easyimage');

var fs = require('fs');

var baseDir = '/data/'
var basePath = __dirname + '/..' + baseDir;

var isDirectory = function (path) {
  try {
    var dir = fs.statSync(basePath + path);

    return dir && dir.isDirectory();
  } catch (e) {
    return false;
  }
};

var isFile = function (path) {
  try {
    var file = fs.statSync(basePath + path);

    return file && file.isFile();
  } catch (e) {
    return false;
  }
};

app.use(bodyParser.json());
app.use(express.static(basePath));

app.get('/folders', function (req, res) {
  var paths = [];
  var subdir = req.query.nodeId || '';
  var items = fs.readdirSync(basePath + subdir);

  for (var i = 0; i < items.length; i++) {
    var name = items[i];
    var stat = fs.statSync(basePath + subdir + '/' + name);
    if (stat && stat.isDirectory()) {
      var dir = {
        id: subdir + '/' + name,
        name: name,
        children: []
      };

      paths.push(dir);
    }
  }

  res.json(paths);

});

app.put('/folders', function (req, res) {
  var folder = req.body;

  if (isDirectory(folder.id)) {
    var subdirs = folder.id.split('/');
    subdirs[subdirs.length - 1] = folder.name;
    var newDirName = subdirs.join('/');

    if (isDirectory(newDirName)) {
      res.sendStatus(403);
      res.json({msg: 'Directory already exists'});
    }
    else {
      fs.renameSync(basePath + folder.id, basePath + newDirName);

      if (isDirectory(newDirName)) {
        folder.id = newDirName;
        res.json(folder);
      } else {
        res.sendStatus(403);
        res.json({msg: 'Could not change directory name'});
      }
    }

  } else {
    res.sendStatus(403);
    res.json({msg: 'Directory does not exist'});
  }

});


app.post('/folders', function (req, res) {
  var data = req.body;
  var folder = data.node;
  var parentFolderId = data.parentNodeId || '';
  var newDirId = parentFolderId + '/' + folder.name;

  if (!isDirectory(newDirId)) {
    fs.mkdirSync(basePath + newDirId);

    if (isDirectory(newDirId)) {
      res.json({
        id: newDirId,
        name: folder.name,
        children: []
      });
    } else {
      res.sendStatus(403);
      res.json({msg: 'Directory has not been added'});
    }

  } else {
    res.sendStatus(403);
    res.json({msg: 'Directory exists'});
  }

});


app.delete('/folders', function (req, res) {
  var data = req.body;
  var folderId = data.nodeId || null;

  if (isDirectory(folderId)) {
    fs.rmdirSync(basePath + folderId);
    res.json({
      success: !isDirectory(folderId)
    });
  } else {
    res.sendStatus(403);
    res.json({msg: 'Directory exists'});
  }

});


function prepareFile(filePath) {
  var src = path.join('/uploads', filePath).replace(/ /g, '\\ ');
  var mimeType = mime.lookup(filePath);
  var isImage = false;
  var dimensions;
  var name = filePath.split('/').pop();

  if (mimeType) {
    isImage = mimeType.indexOf('image') === 0;
  }

  if (isImage) {
    dimensions = sizeOf(path.join(basePath, filePath))
  }

  return {
    id: filePath,
    name: name,
    thumbnailUrl: src,
    url: src,
    mime: mimeType,
    width: isImage ? dimensions.width : 0,
    height: isImage ? dimensions.height : 0
  };
}
app.get('/files', function (req, res) {
  var files = [];
  var subdir = req.query.dirId || '';
  var items = fs.readdirSync(basePath + subdir);

  for (var i = 0; i < items.length; i++) {
    var name = items[i];
    var stat = fs.statSync(basePath + subdir + '/' + name);
    if (stat && stat.isFile()) {
      var path2 = path.join(subdir, name);

      files.push(prepareFile(path2));
    }
  }

  res.json(files);

});


app.post('/files', function (req, res) {
  var fileExist = false;
  var form = new formidable.IncomingForm();

  form.multiples = true;

  form.uploadDir = basePath;

  form.on('file', function (field, file) {
    var folder = req.header('folderId');
    var newPath;

    file.name = file.name.replace(/[^A-Za-z0-9\-\._]/g, '');

    if (folder) {
      newPath = path.join(folder, file.name);
    } else {
      newPath = file.name;
    }

    if (isFile(newPath)) {
      fileExist = true;
      fs.unlink(file.path);
    } else {
      fs.rename(file.path, basePath + newPath);
    }
  });

  form.on('error', function (err) {
    console.log('An error has occured: \n' + err);
  });

  form.on('end', function () {
    if (fileExist) {
      res.statusCode = 409;
      res.end('error');
    } else {
      res.end('success');
    }
  });

  form.parse(req);
});


app.put('/files', function (req, res) {
  var body = req.body;
  var fileId = body.id || null;
  var bounds = body.bounds || null;


  if (isFile(fileId)) {
    if (bounds) {
      var src = path.join(basePath, fileId);
      // easyimg.crop({
      //   src: src,
      //   dst: src,
      //   cropwidth: bounds.width,
      //   cropheight: bounds.height,
      //   x: bounds.x,
      //   y: bounds.y,
      //   gravity: 'NorthWest'
      // });
    }
    res.json(prepareFile(fileId));
  } else {
    res.status(403);
    res.json({msg: 'File does not exist'});
  }
});

app.delete('/files', function (req, res) {
  var fileId = req.query.id || null;

  if (isFile(fileId)) {
    fs.unlinkSync(path.join(basePath, fileId));
    res.json({
      success: true
    });
  } else {
    res.status(403);
    res.json({msg: 'File does not exist'});
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

