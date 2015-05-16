

module.exports = {



  sendDoc : function(db, file, fileId, fileSha) {


    var collection = db.get('origDocuments');
    collection.find({id: fileId}, function (err, found){
      if (found.length!==0) {
        // console.log('not err', found);
        collection.update({id: fileId},
          {$set:
            { data: file, fileSha:fileSha }
          },
          function (err) {
            if (err) console.log('update error');
          }
        )
      } else {
        console.log('err');
        collection.insert({
          data: file,
          id: fileId,
          fileSha: fileSha
        })
      }
    })
  },


  getDoc : function (req, cb) {
    var db = req.db,
    githubId = req.githubId;
    var collection = db.get('documents');
    collection.find({githubId: githubId}, function (err, found) {
      if (found.length!==0) {
        // console.log('heres a document', found)
        cb(found[0]);
      } else {
        console.log('doesnt exist')
        collection.find({githubId: 'default'}, function (err, found) {
          cb (found[0]);
        })
      }
    })
  },

  addApp : function (req, name, id, repo) {
    var db = req.db;
    var githubId = req.session.userID;
    var collection = db.get('Users');
    collection.find({githubId: githubId}, function (err, user) {
      var userApps = user[0].apps;
      userApps[repo] = {name:name, id:id}
      collection.update(user[0]._id,
        {$set:
          {apps: userApps}
        },
        function (err) {
          if (err) console.log('error adding app');
        });
    })
  },

  getApp: function(req, repo, cb) {
    var db = req.db;
    var githubId = req.session.userID;
    var collection = db.get('Users');
    collection.find({githubId:githubId}, function (err, user) {
      var apps = user[0].apps;
      var userApp = apps[repo];
      cb(userApp);
    })
  }

}
