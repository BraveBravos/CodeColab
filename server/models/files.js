if (!process.env.CLIENT_ID) {
  var keys = require('../../keys.js');
  }

var request = require('request'),
    atob = require('atob'),
    bcrypt = require('bcrypt');

module.exports = {
  getContents: function (req, res) {
  var repo = req.url.split('/').slice(1,3).join('/'),
      filePath = req.url.split('/').slice(3).join('/');
    request ({
      url: 'https://api.github.com/repos/'+repo +'/contents/'+filePath+'?ref=CODECOLAB&access_token='+req.session.token,
      headers: {'User-Agent': req.user.username}
    },
      function (err, resp, body) {
        var fileSha=JSON.parse(body).sha
        var file = atob(JSON.parse(body).content);
        res.status(200).send({file:file, fileSha:fileSha});
      });
  },

  updateRight: function (req, res) {
    var filePath = req.body.filePath
    var repo = req.body.repo //we get this from $scope.selected
    var branch = req.body.branch //Is there any situation where we need to pull from master, rather than the CODECOLAB branch?
    request({
      // on merge, we get them from the CODECOLAB branch so we don't have to wait for the pull request to go through -
      // watch this for bugs, and switch to master if needed
      url: 'https://api.github.com/repos/' + repo + '/contents/' + filePath + '?ref=' + branch + '&access_token=' + req.session.token,
      headers: {'User-Agent': req.user.username}
    },
      function(err, resp, body) {
        var fileSha=JSON.parse(body).sha;
        var file = atob(JSON.parse(body).content);
        // docs.sendDoc(db, file, fileId, fileSha);
        var salt = process.env.SALT || keys.salt; //same as salt in tree

        file.id = '0'+bcrypt.hashSync(repo+'/'+filePath+'Code-Colab-Extra-Salt',salt)
        file.url = 'https://api.github.com/repos/' + repo + '/contents/' + filePath

        res.status(200).send({file:file, fileSha:fileSha});
      })
  },

  addFile: function(req, res) {
    request.put({
      url: 'https://api.github.com/repos/' + req.body.repo + '/contents/' + req.body.fullPath + '?access_token=' + req.session.token,
      headers: {"User-Agent": req.user.username},
      json: {
        "message": "File created.",
        "content": "",
        "branch": "CODECOLAB"
      }
    },
    function(err, resp, body) {
      // docs.sendDoc(db, file, fileId, fileSha);
      console.log('content: ',body)
      // need error handling here
      var fileSha = body.content.sha

      var salt = process.env.SALT || keys.salt; //same as salt in tree

      fileId = '0'+bcrypt.hashSync(req.body.repo+'/'+req.body.fullPath+'Code-Colab-Extra-Salt',salt)
      fileUrl = 'https://api.github.com/repos/' + req.body.repo + '/contents/' + req.body.fullPath

      //will use response to get url and id of newly created file, and return it to our client-side function
      res.status(200).send({fileId:fileId,fileUrl:fileUrl,fileSha:fileSha})
    })
  },

  deleteFile: function(req, res) {
    console.log('deleteFile path: ','https://api.github.com/repos/' + req.body.repo + '/contents/' + req.body.fullPath + '?access_token=' + req.session.token)
    console.log(req.body.fullPath+' sha: ',req.body.sha)
    request.del({
      url: 'https://api.github.com/repos/' + req.body.repo + '/contents/' + req.body.fullPath + '?access_token=' + req.session.token,
      headers: {"User-Agent": req.user.username},
      json: {
        "message": req.body.message,
        "sha" : req.body.sha,
        "branch": "CODECOLAB"
      }
    },
    function(err, resp, body) {
      // docs.sendDoc(db, file, fileId, fileSha);
      console.log('content: ',body)
      // need error handling here
      // var fileSha = body.content.sha

      // var salt = process.env.SALT || keys.salt; //same as salt in tree

      // fileId = '0'+bcrypt.hashSync(req.body.repo+'/'+req.body.fullPath+'Code-Colab-Extra-Salt',salt)
      // fileUrl = 'https://api.github.com/repos/' + req.body.repo + '/contents/' + req.body.fullPath

      //will use response to get url and id of newly created file, and return it to our client-side function
      res.status(200).send({})
    })
  }
}