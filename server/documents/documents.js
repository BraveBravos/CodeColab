module.exports = {

  sendDoc : function(data) {
    var db = data.db,
        doc = data.body.doc,
        githubId = data.githubId;

    console.log('data', data)

    var collection = db.get('documents')
    collection.find({githubId: githubId}, function (err, found){
      if (found.length!==0) {

        console.log('not err', found);
        console.log('update', doc)

        collection.update({githubId: gitHubId},
          {$set:
            { left: doc.left,
              right: doc.right }
          },
          function (err) {
            if (err) console.log('update error');
          }
        )
      } else {
        console.log('err');
        collection.insert({
          left: doc.left,
          right: doc.right,
          githubId: githubId
        })
      }
    })
  }

}