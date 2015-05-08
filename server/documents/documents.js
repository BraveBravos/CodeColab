var mongod = require('mongodb'),
   DB;
  mongod.connect('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810', function (err, db){
    if (err) {
      console.log ('mongo error');
    } else {
      DB = db;
    }
  })

module.exports = {



  sendDoc : function(db, file, fileId) {


    var collection = db.get('origDocuments');
    collection.find({id: fileId}, function (err, found){
      if (found.length!==0) {

        // console.log('not err', found);

        collection.update({id: fileId},
          {$set:
            { data: file }
          },
          function (err) {
            if (err) console.log('update error');
          }
        )
      } else {
        console.log('err');
        collection.insert({
          data: file,
          id: fileId
        })
      }
    })
  },
 // setSjs : function(db, file, fileId) {
 //  console.log('updating', file);
 //   var sjsFile = DB.collection('documents').find({_id: fileId});
 //   sjsFile.on('data', function (newDoc){
 //      DB.collection('documents').update({_id: fileId}, {$set: {_data: file}}) = file;
 //   })
 //  },

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
  }

}