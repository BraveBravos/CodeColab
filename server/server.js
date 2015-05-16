var express = require('express'),
    connect = require('connect'),
    bodyParser = require ('body-parser'),
    atob = require('atob'),
    app = express(),
    mongo = require('mongodb'),
    monk =require ('monk'),
    docs = require('./documents/documents.js'),
    fileStruct = require('./fileStruct.js'),
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
    dbClient =liveDBMongoClient('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810',
      {safe: true}),
    backend = livedb.client(dbClient),
    share = sharejs.server.createClient({
      backend: backend
    }),
    request = require('request'),
    github = require('octonode'),
    url = require('url');


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
  store: new MongoStore({url: 'mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810'})
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  req.db = db;
  next();
})


app.get('/auth/github/callback', function (req, res, next) {
  if (req.session) {
    sess = req.session;
  } else {
    console.log('no session')
  }
  next();
});


app.listen(app.get('port'), function() {
  console.log('Node app running on port', app.get('port'));
});

passport.serializeUser(function(user, done) {
  db.get('Users').find({githubId: user.id}, function (err, result) {
    if(result.length === 0){ //User isn't in DB (FIRST TIMER!)
      var insertData = [{githubId: user.id, username: user.username, apps: {}}]
      db.get('Users').insert(insertData);
      done(null, result);
    } else { //User is already in DB, just return their data
      done(null, result);
    }
  });
});

passport.deserializeUser(function(obj, done) {
  db.get('Users').find({githubId: obj.id}, function (err, result) {
    done(null, obj);
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
    req.session.userID = profile.id
    req.session.username = profile.username;
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
  console.log('heroku', accessToken)

  return done(null, profile);
}));

app.get('/api/repos', function (req, res) {
  request({
    url: 'https://api.github.com/user/repos?access_token='+ req.session.token+ '&type=all',
    headers: {'User-Agent': req.session.username}
  },
  function(err,resp,body) {
    var data = JSON.parse(body).map(function (repo) {
      // console.log("body from server.api/repos", body)
      // console.log("repo from server.api/repos", repo)
      return {name: repo.full_name, id: repo.id};
    })
      res.status(200).json(data)
      // res.status(200).data
  });
});

app.get('/api/orgs', function (req, res) {
  request({
    url: 'https://api.github.com/user/orgs?access_token='+ req.session.token+ '&type=all',
    headers: {'User-Agent': req.session.username}
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
    headers: {'User-Agent': req.session.username}
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

//this is to get files from the master branch, by default
app.post('/api/files', function (req, res) {
  var fileId = req.body.fileId;
  request ({
    url: req.body.url+'?access_token='+req.session.token,
    headers: {'User-Agent': req.session.username}
  },
    function (err, resp, body) {
      var fileSha=JSON.parse(body).sha
      var file = atob(JSON.parse(body).content);
      // docs.sendDoc(db, file, fileId, fileSha);
      res.status(200).send({file:file, fileSha:fileSha});
    });
})

//this is to get updates files after a merge, and maybe after a file is newly created
//https://api.github.com/repos/adamlg/chatitude/contents/ff.html?ref=CODECOLAB
app.post('/api/getUpdatedFile', function (req, res) {
  var filePath = req.body.filePath
  var ownerAndRepo = req.body.ownerAndRepo //need to get this from $scope.selected
  request({
    //we get them from the CODECOLAB branch so we don't have to wait for the pull request to go through - watch this for bugs,
    //and switch to master if needed
    url: 'https://api.github.com/repos/' + ownerAndRepo + '/contents/' + filePath + '?ref=CODECOLAB&access_token=' + req.session.token,
    headers: {'User-Agent': req.session.username}
  },
    function(err, resp, body) {
      var fileSha=JSON.parse(body).sha
      var file = atob(JSON.parse(body).content);
      // docs.sendDoc(db, file, fileId, fileSha);
      res.status(200).send({file:file, fileSha:fileSha});
    })
})

app.post('/api/sjs', function (req, res) {
  var fileId = req.body.fileId,
      file = req.body.file;
    docs.setSjs(db, file, fileId);
    res.sendStatus(200);
});


app.post('/api/repos/commit', function(req, res){

  var path = req.body.path,
      message = req.body.message,
      sha=req.body.sha,
      repo=req.body.repo,
      content = req.body.content;

  var client = github.client(req.session.token);
  var ghrepo = client.repo(repo)

  console.log("Sending", path, '::', message, '::', sha)
  ghrepo.updateContents(path, message, content, sha, 'CODECOLAB',
  function(err, resp, body){
    if (err) console.log(err)
    else {
      console.log('git commit sent!', body)
      res.sendStatus(200)
    }
  })
})

app.post ('/api/fileStruct/tree', function (req, res) {
  var owner = req.body.repo[0];
  var repo = req.body.repo[1];
  var branch = req.body.branch;
  // req.session.repo = repo;
  console.log("Making request:", 'https://api.github.com/repos/' +owner+ '/' +repo+ '/git/refs/heads/'+branch+'/?access_token='+ req.session.token)
  request({
    url: 'https://api.github.com/repos/' +owner+ '/' +repo+ '/git/refs/heads/' + branch+'?access_token='+ req.session.token,
    headers: {'User-Agent': req.session.username}
  },
  function (err, resp, body) {
    var data = JSON.parse(body);
    console.log('tree response', data)
    var sha = data.object.sha;
    req.session.treeSha = sha;
    var base = 'https://api.github.com/repos'
    var more = '/git/trees/'
    var last = '?recursive=1&access_token='
    var concat = base + '/' +owner+ '/' + repo + more + sha + last + req.session.token

    request({
      url: concat,
      headers: {'User-Agent': req.session.username}
      },
      function (err, resp, body){
        var data = JSON.parse(body)
        res.status(200).send(data.tree)
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

app.post('/api/deploy', function(req, res) {
  var repo = req.body.repo;
  var name = req.body.name;
  var token = req.session.herokuToken
  var apiToken = process.env.HEROKU_API_TOKEN || keys.herokuAPIToken
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
      if (err) {
        console.log('err', err)
      } else {
        console.log('response', body)
        if (body.message === "Name is already taken") {
          res.status(200).send({name: 'taken'})
        } else {
          var name = body.app.name;
            docs.addApp(req, name, body.id, repo)
          res.status(200).send({name: name})
        }
      }
  })

});

app.get('/api/deploy/*', function (req, res) {
  var name = req.url.split('/').slice(3).join('/');
  var token = req.session.herokuToken;
  var appId = req.session.apps[name];

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
      console.log('first body', JSON.parse(body))
        var buildId = JSON.parse(body).build.id;
          console.log ("https://api.heroku.com/apps/"+name+"/builds/" + buildId + "/result")
        if (buildId !==null) {
          function successBuild() {
            request({
            url: "https://api.heroku.com/apps/"+name+"/builds/" + buildId + "/result",
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.heroku+json; version=3',
              'Authorization': 'Bearer '+ token
            }
            }, function (err,resp, body) {
                  console.log('successbody', JSON.parse(body))
                if (JSON.parse(body).build.status === "pending" ){
                  setTimeout(successBuild, 3000);
                } else {
                  var log = '';
                  JSON.parse(body).lines.forEach(function(line) {
                    log+=line.line;
                  })
                  res.send(log);
                  // console.log(JSON.parse(body));
                }
              })
            }
            successBuild();
          } else {
        checkBuild();
      }
    })

  }
  setTimeout(checkBuild, 3000);
})

app.get('/auth/heroku/fail', function(req, res) {
  console.log('fail!')


});

app.get('/api/auth', function(req, res){
  res.status(200).json(req.isAuthenticated());
})

app.get('/logout', function (req, res){
  //req.session.destroy()
  req.logout();
  res.redirect('/');
})

app.get('/api/branch/*', function(req, res) {
  var repo = req.url.split('/').slice(3).join('/');
  request({
    url: 'https://api.github.com/repos/'+repo+'/branches?access_token=' + req.session.token,
    headers: {'User-Agent': req.session.username}
  },
    function(err, resp, body) {
      var exists= false;
      var branches = JSON.parse(body);
      branches.forEach(function(branch) {
        if (branch.name==="CODECOLAB") {
          exists ='true';
        }
      })
      res.send(exists);
    })
})

app.post('/api/branch', function(req, res){
  var owner=req.session.username;
  var repo = req.body.repo;


  request({
    url: 'https://api.github.com/repos/' + repo +'/git/refs/heads/master?access_token='+ req.session.token,
    headers: {'User-Agent': owner}
  },
    function (err, resp, body) {
      if (err) console.log(err);
      // console.log('INSIDE GIT BRANCH')
      var ref = JSON.parse(body).ref,
          sha = JSON.parse(body).object.sha;
      console.log('branch req ref', ref)
      console.log('branch req sha', sha)

      // var send = JSON.stringify({
      //   ref: 'refs/heads/'+'CODECOLAB', //the new branch name
      //   sha: sha
      // });
  console.log('post going to https://api.github.com/repos/' + repo + '/git/refs?access_token='+ req.session.token)
   console.log('headers', 'User-Agent', owner, 'Content-Type', 'application/json')
   console.log('body', 'sha', sha)
      request.post({
        url: 'https://api.github.com/repos/' + repo + '/git/refs?access_token='+ req.session.token,
        headers: {'User-Agent': owner, 'Content-Type': 'application/json'},
        json: {
          ref: "refs/heads/CODECOLAB",
          sha: sha
        }
      },
        function(err, resp, body){
          console.log('New Branch Created!', body)
          res.send(body) //send back to client to use for commits
        })
      })
    });

app.post('/api/merge', function (req, res) {
  var repo = req.body.repo,
      title = req.body.title,
      comments = req.body.comments,
      user = req.session.username;
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
    if (err) {
      console.log('merge err', err)
    } else {
      console.log('pull request is ...',body)
      if (body.errors) {
        res.status(200).send(body.errors[0].message)
      } else {
        var sha = body.head.sha;
        var num = body.number
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
          console.log('second merge error', body)
          request({
            method: "GET",
            url: "https://api.github.com/repos/" + repo + "/pulls/" + num + "/files?access_token=" + req.session.token,
            headers: { 'User-Agent': user}
          }, function (err, resp, body) {
            console.log('files changed', JSON.parse(body))
            res.sendStatus(200);
          })
        })
      }
    }
  })
})

app.use(browserChannel( function(client) {
  var stream = new Duplex({objectMode: true});

  stream._read = function() {};
  stream._write = function(chunk, encoding, callback) {
    if (client.state !== 'closed') {
      client.send(chunk);
      // console.log('received',chunk)
    }
    callback();
  };

  client.on('message', function(data) {
    // console.log('message',data)
    stream.push(data);
  });

  client.on('close', function(reason) {
    console.log('closed')
    stream.push(null);
    stream.emit('close');
  });

  stream.on('end', function() {
    console.log('end')
    client.close();
  });

  return share.listen(stream);

}));






