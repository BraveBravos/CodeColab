module.exports = {

  sendDoc : function(data) {
    var db = data.db,
        doc = data.body.doc;

    console.log('data', doc)

    var collection = db.get('documents')
    collection.find({session: 3}, function (err, found){
      if (found.length!==0) {

        console.log('not err', found);
        console.log('update', doc)

        collection.update({session: 3},
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
          session: doc.session
        })
      }
    })
  }
  
}