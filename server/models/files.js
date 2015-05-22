module.exports = {

}

// app.post('/api/files', function (req, res) {
//   request ({
//     // changed this to refer to the CODECOLAB branch by default.  Here is what the code used to be:
//     // url: req.body.url+'?access_token='+req.session.token,
//     url: req.body.url+'?ref=CODECOLAB&access_token='+req.session.token,
//     headers: {'User-Agent': req.user.username}
//   },
//     function (err, resp, body) {
//       var fileSha=JSON.parse(body).sha
//       var file = atob(JSON.parse(body).content);
//       // docs.sendDoc(db, file, fileId, fileSha);
//       res.status(200).send({file:file, fileSha:fileSha});
//     });
// })

// //this is to get updated files after a merge, and maybe after a file is newly created - for some reason, I'm not getting api/files to work
// //when trying to update the rightOriginal side.
// //https://api.github.com/repos/adamlg/chatitude/contents/ff.html?ref=CODECOLAB
// app.post('/api/getUpdatedFile', function (req, res) {
//   var filePath = req.body.filePath
//   var ownerAndRepo = req.body.ownerAndRepo //we get this from $scope.selected
//   var branch = req.body.branch //Is there any situation where we need to pull from master, rather than the CODECOLAB branch?
//   request({
//     // on merge, we get them from the CODECOLAB branch so we don't have to wait for the pull request to go through -
//     // watch this for bugs, and switch to master if needed
//     url: 'https://api.github.com/repos/' + ownerAndRepo + '/contents/' + filePath + '?ref=' + branch + '&access_token=' + req.session.token,
//     headers: {'User-Agent': req.user.username}
//   },
//     function(err, resp, body) {
//       var fileSha=JSON.parse(body).sha;
//       var file = atob(JSON.parse(body).content);
//       // docs.sendDoc(db, file, fileId, fileSha);
//       var salt = '$2a$10$JX4yfb1a6c0Ec6yYxkleie' //same as salt in tree

//       file.id = '0'+bcrypt.hashSync(ownerAndRepo+'/'+filePath+'Code-Colab-Extra-Salt',salt)
//       file.url = 'https://api.github.com/repos/' + ownerAndRepo + '/contents/' + filePath

//       res.status(200).send({file:file, fileSha:fileSha});
//     })
// })

// app.post('/api/files/newFile', function(req, res) {
//   console.log('newFile path: ','https://api.github.com/repos/' + req.body.ownerAndRepo + '/contents/' + req.body.fullPath + '?access_token=' + req.session.token)
//   request.put({
//     url: 'https://api.github.com/repos/' + req.body.ownerAndRepo + '/contents/' + req.body.fullPath + '?access_token=' + req.session.token,
//     headers: {"User-Agent": req.user.username},
//     json: {
//       "message": "File created.",
//       "content": "",
//       "branch": "CODECOLAB"
//     }
//   },
//   function(err, resp, body) {
//     // docs.sendDoc(db, file, fileId, fileSha);
//     console.log('content: ',body)
//     // need error handling here
//     var fileSha = body.content.sha

//     var salt = '$2a$10$JX4yfb1a6c0Ec6yYxkleie' //same as salt in tree

//     fileId = '0'+bcrypt.hashSync(req.body.ownerAndRepo+'/'+req.body.fullPath+'Code-Colab-Extra-Salt',salt)
//     fileUrl = 'https://api.github.com/repos/' + req.body.ownerAndRepo + '/contents/' + req.body.fullPath

//     //will use response to get url and id of newly created file, and return it to our client-side function
//     res.status(200).send({fileId:fileId,fileUrl:fileUrl,fileSha:fileSha})
//   })
// })

// app.post('/api/files/deleteFile', function(req, res) {
//   console.log('deleteFile path: ','https://api.github.com/repos/' + req.body.ownerAndRepo + '/contents/' + req.body.fullPath + '?access_token=' + req.session.token)
//   console.log(req.body.fullPath+' sha: ',req.body.sha)
//   request.del({
//     url: 'https://api.github.com/repos/' + req.body.ownerAndRepo + '/contents/' + req.body.fullPath + '?access_token=' + req.session.token,
//     headers: {"User-Agent": req.user.username},
//     json: {
//       "message": req.body.message,
//       "sha" : req.body.sha,
//       "branch": "CODECOLAB"
//     }
//   },
//   function(err, resp, body) {
//     // docs.sendDoc(db, file, fileId, fileSha);
//     console.log('content: ',body)
//     // need error handling here
//     // var fileSha = body.content.sha

//     // var salt = '$2a$10$JX4yfb1a6c0Ec6yYxkleie' //same as salt in tree

//     // fileId = '0'+bcrypt.hashSync(req.body.ownerAndRepo+'/'+req.body.fullPath+'Code-Colab-Extra-Salt',salt)
//     // fileUrl = 'https://api.github.com/repos/' + req.body.ownerAndRepo + '/contents/' + req.body.fullPath

//     //will use response to get url and id of newly created file, and return it to our client-side function
//     res.status(200).send({})
//   })
// })
// }