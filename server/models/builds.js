var mongo = require('mongodb'),
    monk =require ('monk'),
    db = monk('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810'),
    request = require('request');
    if (!process.env.CLIENT_ID) {
      var keys = require('../keys.js');
      }

module.exports = {


  addApp : function (req, name, id, repo) {
    var githubId = req.user.githubId;
    var collection = db.get('Users');
    collection.find({githubId: githubId}, function (err, user) {
      var userApps = user[0].apps;
      userApps[repo] = {name:name, id:id}
      collection.update(user[0]._id,
        {$set:
          {apps: userApps}
        }, function (err) { if (err) console.log('error adding app') }
      );
    })
  },

  getApp: function(req, repo, cb) {

    var githubId = req.user.githubId;
    var collection = db.get('Users');
    collection.find({githubId:githubId}, function (err, user) {
      var apps = user[0].apps;
      if (apps[repo]) {
        var userApp = apps[repo];
        cb(userApp);
      } else { cb(false) }
    })
  },

  checkForApp: function (req, res) {
    var repo = req.url.split('/').slice(1).join('/');
    module.exports.getApp(req, repo, function (userApp) {
      if (!userApp) { res.send(false) }
      else { res.sendStatus(200) }
    })
  },

  rebuild: function (req, res) {
    var repo = req.body.repo,
        token = req.session.herokuToken,
        apiToken = process.env.HEROKU_API_TOKEN || keys.herokuAPIToken

    module.exports.getApp(req, repo, function (userApp){
      request({
        method: 'POST',
        url: "https://api.heroku.com/apps/"+ userApp.name + "/builds",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.heroku+json; version=3',
        'Authorization': 'Bearer '+ token
        },
        json: {
          source_blob : {
            "url" : "https://github.com/" + repo + "/tarball/CODECOLAB?token="+apiToken,
            "version": null
          }
        }
      },
      function (err, resp, body) {
        if (err) { console.log("rebuild error", err) }
        else { res.send({name: userApp.name, buildId: body.id}) }
      })
    })
  },
  deployApp: function(req, res) {
    var repo = req.body.repo,
        name = req.body.name,
        token = req.session.herokuToken,
        apiToken = process.env.HEROKU_API_TOKEN || keys.herokuAPIToken

    request.post({
      url: "https://api.heroku.com/app-setups",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.heroku+json; version=3',
        'Authorization': 'Bearer '+ token
      },
      json: {
        app: {name: name},
        source_blob : {"url" : "https://github.com/" + repo + "/tarball/master?token="+apiToken}
      }
    },
      function (err, resp, body) {
        if (err) console.log('err', err)
        else {
          if (body.message === "Name is already taken") {
            res.status(200).send({name: 'taken'})
          } else if (body.message === "You\'ve reached the limit of 5 apps for unverified accounts. Delete some apps or add a credit card to verify your account.") {
            res.status(200).send({name: 'creditLimit'})
          } else {
            var name = body.app.name;
              module.exports.addApp(req, name, body.id, repo)
            res.status(200).send({name: name})
          }
        }
    })
  },
  showLog: function (req, res) {
    console.log('req.url', req.url)
    var params = req.url.split('/').slice(2);
    console.log('params', params)
    if (params.length>2) { var buildId = params.pop() }
    var repo =   params.join('/'),
        token = req.session.herokuToken;

    module.exports.getApp(req, repo, function (userApp) {
    var name = userApp.name;
    var appId = userApp.id;

    function checkBuild () {
      //Gets App setup info(including BuildID) from heroku for app name sent
      request({
        url: "https://api.heroku.com/app-setups/"+ appId,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.heroku+json; version=3',
          'Authorization': 'Bearer '+ token
        }
      }, function (err, resp, body) {
        //Gets build log for given buildID
        console.log('buildbody', JSON.parse(body))
          var buildId = JSON.parse(body).build.id;
          if (buildId !==null) {
              successBuild(buildId);
            } else {
          checkBuild();
        }
      })
    }

    function successBuild(buildId) {
      request({
      url: "https://api.heroku.com/apps/"+name+"/builds/" + buildId + "/result",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.heroku+json; version=3',
        'Authorization': 'Bearer '+ token
      }
      }, function (err,resp, body) {
          if (JSON.parse(body).build.status === "pending" ){
            setTimeout(function () {
              successBuild(buildId);
            }, 3000);
          } else {
            var log = '';
            JSON.parse(body).lines.forEach(function(line) {
              log+=line.line;
            })
            res.send(log);
          }
        })
      }

    if (!buildId) { setTimeout(checkBuild, 3000) }
    else { successBuild(buildId) }
    });
  }
}
