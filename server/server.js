var express = require('express'),
    connect = require('connect'),
    bodyParser = require ('body-parser'),
    atob = require('atob'),
    btoa = require('btoa'),
    app = express(),
    mongo = require('mongodb'),
    monk =require ('monk'),
    docs = require('./documents/documents.js'),
    fileStruct = require('./fileStruct.js'),
    // db = monk('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810'),
    db = monk('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require ('connect-mongo')(session),
    path = require('path'),
    passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy,
    HerokuStrategy = require('passport-heroku').Strategy,
    livedb = require( 'livedb' ),
    Duplex = require( 'stream' ).Duplex,
    browserChannel = require('browserchannel').server,
    sharejs = require( 'share' ),
    shareCodeMirror = require( 'share-codemirror' ),
    http    = require( 'http' ),
    server  = http.createServer( app ),
    liveDBMongoClient = require('livedb-mongo'),
    // dbClient =liveDBMongoClient('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810',
    dbClient =liveDBMongoClient('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810',
      {safe: true}),
    backend = livedb.client(dbClient),
    share = sharejs.server.createClient({
      backend: backend
    }),
    request = require('request'),
    bcrypt = require('bcrypt');

if (!process.env.CLIENT_ID) {
  var keys = require('../keys.js');
}


app.set('port', (process.env.PORT || 3000));
app.use(express.static('./client'));
app.use(express.static(sharejs.scriptsDir));
app.use(express.static(shareCodeMirror.scriptsDir));

app.use(bodyParser.json());
app.use (cookieParser());
app.use(bodyParser.urlencoded({extended: true,limit: 1000000}));
app.use(session({
  secret: 'oursecret',
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({
    url: 'mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810',
    ttl: 60*60*8,
    })
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  req.db = db;
  next();
})

app.listen(app.get('port'), function() {
  console.log('Node app running on port', app.get('port'));
});


app.get('/auth/github/callback', function (req, res, next) {
  if (req.session) console.log('session');
  else { console.log('no session') }
  next();
});

passport.serializeUser(function(user, done) {
  var users = db.get('Users');
  if (user.provider === 'github') {
    users.find({githubId: user.id}, function (err, result) {
      if(result.length === 0){ //User isn't in DB (FIRST TIMER!)
        var insertData = [{githubId: user.id, username: user.username, apps: {}}]
        var promise = users.insert(insertData);
        promise.success(function(doc) {
          done(null, doc[0]._id);
        })
      } else { //User is already in DB, just return their data
        done(null, result[0]._id);
      }
    });
  } else {//for Heroku OAuth
      users.find({herokuId: user.id}, function (err, result) {
          if(result.length === 0){ //User hasn't authorized heroku yet
            users.find({_id: user.codeColabId}, function (err, result) {
              users.update(result[0]._id,
                {$set:
                  {herokuId: user.id}
                },
                function (err) {
                  if (err) console.log('error adding heroku token');
                });
            done(null, result[0]._id);
            });
          } else { //Heroku ID is already in DB, just return their data
            done(null, result[0]._id);
          }
        });
  }
});

passport.deserializeUser(function(id, done) {
  db.get('Users').find({_id: id}, function (err, user) {
    done(null, user[0]);
  });
});

passport.use(new GitHubStrategy({
    clientID: process.env.CLIENT_ID || keys.clientID,
    clientSecret: process.env.CLIENT_SECRET || keys.clientSecret,
    callbackURL: process.env.CALLBACK_URL || keys.callbackURL,
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    req.session.token = accessToken;
    req.session.cookie.expires = new Date(Date.now() + 8*60*60*1000)

    return done(null, profile)
  }
));

passport.use(new HerokuStrategy({
  clientID: process.env.HEROKU_CLIENT_ID || keys.herokuId,
  clientSecret: process.env.HEROKU_CLIENT_SECRET || keys.herokuSecret,
  callbackURL: process.env.HEROKU_CALLBACK || keys.herokuCallback,
  passReqToCallback: true
},
function(req, accessToken, refreshToken, profile, done) {
  req.session.herokuToken = accessToken;
  profile.codeColabId = req.user._id;
  return done(null, profile);
}));

app.get('/api/repos', function (req, res) {
  request({
    url: 'https://api.github.com/user/repos?access_token='+ req.session.token+ '&type=all',
    headers: {'User-Agent': req.user.username}
  },
  function(err,resp,body) {
    var data = JSON.parse(body).map(function (repo) {
      return {name: repo.full_name, id: repo.id};
    })
    res.status(200).json(data)
  });
});

app.get('/api/orgs', function (req, res) {
  request({
    url: 'https://api.github.com/user/orgs?access_token='+ req.session.token+ '&type=all',
    headers: {'User-Agent': req.user.username}
  },
  function (err, resp, body) {
    var orgList = JSON.parse(body).map(function (org) {
      return org.login;
    })
    res.status(200).json(orgList);
  });

});

app.post ('/api/orgs/repos', function (req, res) {
  var org = req.body.org;
  request({
    url: 'https://api.github.com/orgs/'+ org + '/repos?access_token='+ req.session.token,
    headers: {'User-Agent': req.user.username}
  },
    function (err, resp, body) {
      var data = [];
        JSON.parse(body).forEach(function (repo) {
        if (repo.permissions.push === true) {
          data.push({name: repo.full_name, id: repo.id});
        }
      });
      res.status(200).json(data)
    });
});

app.post('/api/files', function (req, res) {
  request ({
    // changed this to refer to the CODECOLAB branch by default.  This is what the code used to be.
    // url: req.body.url+'?access_token='+req.session.token,
    url: req.body.url+'?ref=CODECOLAB&access_token='+req.session.token,
    headers: {'User-Agent': req.user.username}
  },
    function (err, resp, body) {
      var fileSha=JSON.parse(body).sha
      // console.log('content: ',JSON.parse(body).content)
      var file = atob(JSON.parse(body).content);
      // docs.sendDoc(db, file, fileId, fileSha);
      res.status(200).send({file:file, fileSha:fileSha});
    });
})

//this is to get updated files after a merge, and maybe after a file is newly created - for some reason, I'm not getting api/files to work
//when trying to update the rightOriginal side.
//https://api.github.com/repos/adamlg/chatitude/contents/ff.html?ref=CODECOLAB
app.post('/api/getUpdatedFile', function (req, res) {
  var filePath = req.body.filePath
  var ownerAndRepo = req.body.ownerAndRepo //need to get this from $scope.selected
  var branch = req.body.branch

  request({
    // on merge, we get them from the CODECOLAB branch so we don't have to wait for the pull request to go through -
    // watch this for bugs, and switch to master if needed
    url: 'https://api.github.com/repos/' + ownerAndRepo + '/contents/' + filePath + '?ref=' + branch + '&access_token=' + req.session.token,
    headers: {'User-Agent': req.user.username}
  },
    function(err, resp, body) {
      var fileSha=JSON.parse(body).sha,
          file = atob(JSON.parse(body).content);
      // docs.sendDoc(db, file, fileId, fileSha);
      var salt = '$2a$10$JX4yfb1a6c0Ec6yYxkleie' //same as salt in tree
      
      file.id = '0'+bcrypt.hashSync(ownerAndRepo+'/'+filePath+'Code-Colab-Extra-Salt',salt)
      file.url = 'https://api.github.com/repos/' + ownerAndRepo + '/contents/' + filePath

      res.status(200).send({file:file, fileSha:fileSha});
    })
})

app.post('/api/repos', function(req, res){

  var path = req.body.path,
      message = req.body.message,
      sha=req.body.sha,
      repo=req.body.repo,
      content = btoa(req.body.content);
  request ({
    method: "PUT",
    url: 'https://api.github.com/repos/' + repo+ '/contents/' + path +'?access_token='+ req.session.token,
    headers: {'User-Agent': req.user.username},
    json: {
      message: message,
      content: content,
      sha: sha,
      branch: "CODECOLAB"
    }
  },
  function (err, resp, body) {
    if (err) console.log(err)
    else {
      res.status(200).send(body.content.sha);
    }
  });
})

app.post ('/api/fileStruct/tree', function (req, res) {
  var owner = req.body.repo[0],
      repo = req.body.repo[1],
      branch = req.body.branch;

  request({
    url: 'https://api.github.com/repos/' +owner+ '/' +repo+ '/git/refs/heads/' + branch+'?access_token='+ req.session.token,
    headers: {'User-Agent': req.user.username}
  },
  function (err, resp, body) {
    var data = JSON.parse(body);
    var sha = data.object.sha;
    var base = 'https://api.github.com/repos',
        more = '/git/trees/',
        last = '?recursive=1&access_token=',
        concat = base + '/' +owner+ '/' + repo + more + sha + last + req.session.token

    request({
      url: concat,
      headers: {'User-Agent': req.user.username}
      },
      function (err, resp, body){
        var data = JSON.parse(body)
        var salt = '$2a$10$JX4yfb1a6c0Ec6yYxkleie'
        var newTree = data.tree.map(function(item) {
          item.id = '0'+bcrypt.hashSync(repo+'/'+item.path+'Code-Colab-Extra-Salt',salt)
          item.url = base+'/'+ owner + '/' + repo + '/contents/' + item.path
          return item
        })
        res.status(200).send(newTree)
      }
    )   // this is a request inside of a request, so the ) may need to move
  });
});

app.get('/auth/github',
  passport.authenticate('github', {scope: ['repo', 'user', 'admin:public_key']})
);

app.get('/auth/github/callback', passport.authenticate(
  'github', { successRedirect: '/#/main', failureRedirect: '/' }
));


app.get('/auth/heroku', passport.authenticate('heroku'));

app.get('/auth/heroku/callback',
  passport.authenticate('heroku', {successRedirect: '/#/deploy', failureRedirect: '/auth/heroku/fail' })
);

app.get('/api/apps/*', function (req, res) {
  var repo = req.url.split('/').slice(3).join('/');
  docs.getApp(req, repo, function (userApp) {
    if (!userApp) { res.send(false) }
    else { res.sendStatus(200) }
  })
})

app.post('/api/builds', function (req, res) {
  var repo = req.body.repo,
      token = req.session.herokuToken,
      apiToken = process.env.HEROKU_API_TOKEN || keys.herokuAPIToken 

  docs.getApp(req, repo, function (userApp){
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
})

app.post('/api/deploy', function(req, res) {
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
            docs.addApp(req, name, body.id, repo)
          res.status(200).send({name: name})
        }
      }
  })

});

app.get('/api/deploy/*', function (req, res) {
  var params = req.url.split('/').slice(3);
  if (params.length>2) { var buildId = params.pop() }
  var repo =   params.join('/'),
      token = req.session.herokuToken;

  docs.getApp(req, repo, function (userApp) {
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
})

app.get('/auth/heroku/fail', function(req, res) {
  console.log('Heroku fail!')
});

app.get('/api/auth', function(req, res){
  res.status(200).json(req.isAuthenticated());
})

app.get('/logout', function (req, res){
  req.session.destroy()
  req.logout();
  res.redirect('/');
})

app.get('/api/branch/*', function(req, res) {
  var repo = req.url.split('/').slice(3).join('/');
  request({
    url: 'https://api.github.com/repos/'+repo+'/branches?access_token=' + req.session.token,
    headers: {'User-Agent': req.user.username}
  },
    function(err, resp, body) {
      var exists= false,
          branches = JSON.parse(body);

      branches.forEach(function(branch) {
        if (branch.name==="CODECOLAB") exists ='true';
      })
      res.send(exists);
    })
})

app.post('/api/branch', function(req, res){
  var owner=req.user.username,
      repo = req.body.repo;

  request({
    url: 'https://api.github.com/repos/' + repo +'/git/refs/heads/master?access_token='+ req.session.token,
    headers: {'User-Agent': owner}
  },
    function (err, resp, body) {
      if (err) console.log(err);
      var ref = JSON.parse(body).ref,
          sha = JSON.parse(body).object.sha;
      request.post({
        url: 'https://api.github.com/repos/' + repo + '/git/refs?access_token='+ req.session.token,
        headers: {'User-Agent': owner, 'Content-Type': 'application/json'},
        json: {
          ref: "refs/heads/CODECOLAB",
          sha: sha
        }
      },
        function(err, resp, body){
          console.log('New Branch Created!')
          res.send(body) //send back to client to use for commits
        })
      })
    });

app.post('/api/merge', function (req, res) {
  var repo = req.body.repo,
      title = req.body.title,
      comments = req.body.comments,
      user = req.user.username;
  request.post ({
    url: 'https://api.github.com/repos/' + repo + '/pulls?access_token='+ req.session.token,
    headers : {
      'User-Agent' : user
    },
    json: {
      title: title,
      head: "CODECOLAB",
      base: "master",
      body: comments
    }
  },
  function (err, resp, body) {
    if (err) { console.log('merge err', err) }
    else {
      if (body.errors) { res.status(200).send(body.errors[0].message) }
      else {
        var sha = body.head.sha,
            num = body.number
        request({
        method: 'PUT',
        url: 'https://api.github.com/repos/' + repo + '/pulls/' + num + '/merge?access_token='+ req.session.token,
        headers : {
          'User-Agent' : user
        },
        json: {
          message: "Merged CodeColab Branch to master",
          sha: sha
        }
      },
        function (err, resp, body) {
          request({
            method: "GET",
            url: "https://api.github.com/repos/" + repo + "/pulls/" + num + "/files?access_token=" + req.session.token,
            headers: { 'User-Agent': user}
          }, function (err, resp, body) {
            res.sendStatus(200);
          })
        })
      }
    }
  })
})

app.post('/api/files/newFile', function(req, res) {
  console.log('newFile path: ','https://api.github.com/repos/' + req.body.ownerAndRepo + '/contents/' + req.body.fullPath + '?access_token=' + req.session.token)
  // res.sendStatus(200)
  request.put({
    url: 'https://api.github.com/repos/' + req.body.ownerAndRepo + '/contents/' + req.body.fullPath + '?access_token=' + req.session.token,
    headers: {'User-Agent': req.session.username},
    json: {
      'path': req.body.fullPath,
      'message': 'File created.',
      'content': '',
      'branch': 'CODECOLAB'
    }
  }, 
  function(err, resp, body) {
    // console.log('newFile body: ',body)
    // var file = atob(JSON.parse(body).content);
    // docs.sendDoc(db, file, fileId, fileSha);
    var fileSha = JSON.parse(body).sha

    var salt = '$2a$10$JX4yfb1a6c0Ec6yYxkleie' //same as salt in tree
    
    fileId = '0'+bcrypt.hashSync(req.body.ownerAndRepo+'/'+req.body.fullPath+'Code-Colab-Extra-Salt',salt)
    fileUrl = 'https://api.github.com/repos/' + req.body.ownerAndRepo + '/contents/' + req.body.fullPath

    // console.log(body)
    //will use response to get url and id of newly created file, and return it to our client-side function
    res.status(200).send({fileId:fileId,fileUrl:fileUrl,fileSha:fileSha})
  })
})

app.use(browserChannel( function(client) {
  var stream = new Duplex({objectMode: true});

  stream._read = function() {};
  stream._write = function(chunk, encoding, callback) {
    if (client.state !== 'closed') {
      client.send(chunk);
    }
    callback();
  };

  client.on('message', function(data) {
    console.log(data)
    stream.push(data);
  });

  client.on('close', function(reason) {
    stream.push(null);
    stream.emit('close');
  });

  stream.on('end', function() {
    client.close();
  });

  return share.listen(stream);

}));






